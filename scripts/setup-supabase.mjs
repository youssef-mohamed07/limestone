import fs from "node:fs";
import path from "node:path";
import postgres from "postgres";

const required = [
  "SUPABASE_URL",
  "SUPABASE_DB_PASSWORD",
  "SUPABASE_APP_TOKEN",
];
for (const name of required) {
  if (!process.env[name]) throw new Error(`Missing ${name}`);
}

const source = fs.readFileSync(
  path.resolve("components/limestone-erp.tsx"),
  "utf8",
);

function readArray(name) {
  const declaration = source.indexOf(`const ${name}`);
  if (declaration < 0) throw new Error(`Could not find ${name}`);
  const start = source.indexOf("[", source.indexOf("=", declaration));
  let depth = 0;
  let quote = null;
  let escaped = false;
  for (let index = start; index < source.length; index += 1) {
    const character = source[index];
    if (quote) {
      if (escaped) escaped = false;
      else if (character === "\\") escaped = true;
      else if (character === quote) quote = null;
      continue;
    }
    if (character === '"' || character === "'" || character === "`") {
      quote = character;
      continue;
    }
    if (character === "[") depth += 1;
    if (character === "]") {
      depth -= 1;
      if (depth === 0) {
        const literal = source.slice(start, index + 1);
        return Function(`"use strict"; return (${literal});`)();
      }
    }
  }
  throw new Error(`Could not parse ${name}`);
}

const customers = readArray("customers");
const products = readArray("products");
const invoices = readArray("seedInvoices");
const payments = [];
const shipments = [];
const documents = [
  ["PI-26-26.pdf", "Proforma Invoice", "PI-26-26", "23 Aug 2026", "Youssef M.", "Final"],
  ["PI-26-27.pdf", "Proforma Invoice", "PI-26-27", "23 Aug 2026", "Youssef M.", "Final"],
];
const settings = {
  companyName: "Limestone for Marble and Granite",
  tagline: "Egyptian Natural Stone Exporter",
  email: "mohamed@loldlimestone.net",
  phone: "+20 111 121 0056 - +20 106 610 1017",
  taxCard: "773-932-488",
  commercialRegistration: "6724 / 9",
  address: "56 Ragheb Street, Helwan, 4th Floor, Cairo, Egypt",
  currency: "USD",
  portLoading: "Any Egyptian Port",
  downPaymentPercent: 25,
  marbleBackground: true,
};

const projectRef = new URL(process.env.SUPABASE_URL).hostname.split(".")[0];
const sql = postgres({
  host:
    process.env.SUPABASE_DB_HOST ??
    "aws-0-eu-central-1.pooler.supabase.com",
  port: Number(process.env.SUPABASE_DB_PORT ?? 5432),
  database: "postgres",
  username: process.env.SUPABASE_DB_USER ?? `postgres.${projectRef}`,
  password: process.env.SUPABASE_DB_PASSWORD,
  ssl: "require",
  connect_timeout: 20,
  max: 1,
});

try {
  await sql.begin(async (transaction) => {
    await transaction.unsafe(`
      create schema if not exists private;
      create table if not exists private.limestone_secrets (
        id text primary key,
        secret_value text not null,
        updated_at timestamptz not null default now()
      );
      revoke all on schema private from public, anon, authenticated;
      revoke all on all tables in schema private from public, anon, authenticated;

      create table if not exists public.limestone_records (
        id text primary key,
        entity_type text not null,
        payload jsonb not null,
        updated_at timestamptz not null default now()
      );
      create index if not exists limestone_records_entity_type_idx
        on public.limestone_records (entity_type);
      alter table public.limestone_records enable row level security;
      revoke all on table public.limestone_records from public, anon, authenticated;
    `);

    await transaction`
      insert into private.limestone_secrets (id, secret_value, updated_at)
      values ('application', ${process.env.SUPABASE_APP_TOKEN}, now())
      on conflict (id) do update
      set secret_value = excluded.secret_value, updated_at = now()
    `;

    await transaction.unsafe(`
      create or replace function public.limestone_list_records(p_access_token text)
      returns table(id text, entity_type text, payload jsonb, updated_at timestamptz)
      language plpgsql
      security definer
      set search_path = ''
      as $function$
      begin
        if not exists (
          select 1 from private.limestone_secrets s
          where s.id = 'application' and s.secret_value = p_access_token
        ) then
          raise exception 'Not authorized';
        end if;
        return query
          select r.id, r.entity_type, r.payload, r.updated_at
          from public.limestone_records r
          order by r.updated_at desc;
      end;
      $function$;

      create or replace function public.limestone_upsert_record(
        p_access_token text,
        p_id text,
        p_entity_type text,
        p_payload jsonb
      ) returns jsonb
      language plpgsql
      security definer
      set search_path = ''
      as $function$
      begin
        if not exists (
          select 1 from private.limestone_secrets s
          where s.id = 'application' and s.secret_value = p_access_token
        ) then
          raise exception 'Not authorized';
        end if;
        insert into public.limestone_records (id, entity_type, payload, updated_at)
        values (p_id, p_entity_type, p_payload, now())
        on conflict (id) do update
        set entity_type = excluded.entity_type,
            payload = excluded.payload,
            updated_at = now();
        return p_payload;
      end;
      $function$;

      revoke all on function public.limestone_list_records(text) from public;
      revoke all on function public.limestone_upsert_record(text, text, text, jsonb) from public;
      grant execute on function public.limestone_list_records(text) to anon, authenticated;
      grant execute on function public.limestone_upsert_record(text, text, text, jsonb) to anon, authenticated;
    `);

    const records = [
      ...invoices.map((invoice) => ({ id: `invoice:${invoice.id}`, type: "invoice", payload: invoice })),
      { id: "catalog:customers", type: "customers", payload: customers },
      { id: "catalog:products", type: "products", payload: products },
      { id: "ledger:payments", type: "payments", payload: payments },
      { id: "export:shipments", type: "shipments", payload: shipments },
      { id: "files:documents", type: "documents", payload: documents },
      { id: "settings:company", type: "settings", payload: settings },
    ];

    // Remove only the two known demo invoices. Never clear the full records
    // table because it may already contain invoices imported by the user.
    await transaction`
      delete from public.limestone_records
      where id in ('invoice:inv-24', 'invoice:inv-25')
    `;

    for (const record of records) {
      await transaction`
        insert into public.limestone_records (id, entity_type, payload, updated_at)
        values (${record.id}, ${record.type}, ${transaction.json(record.payload)}, now())
        on conflict (id) do update
        set entity_type = excluded.entity_type,
            payload = excluded.payload,
            updated_at = now()
      `;
    }
    await transaction.unsafe("notify pgrst, 'reload schema'");
  });
  console.log(`Supabase ready: ${invoices.length} invoices and 6 catalog datasets uploaded.`);
} finally {
  await sql.end({ timeout: 5 });
}
