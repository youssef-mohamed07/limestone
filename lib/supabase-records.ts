import { env } from "cloudflare:workers";

export type SupabaseRecord = {
  id: string;
  entity_type: string;
  payload: unknown;
  updated_at: string;
};

function config() {
  const bindings = env as unknown as Record<string, string | undefined>;
  const url = bindings.SUPABASE_URL ?? process.env.SUPABASE_URL;
  const publishableKey =
    bindings.SUPABASE_PUBLISHABLE_KEY ??
    process.env.SUPABASE_PUBLISHABLE_KEY;
  const accessToken =
    bindings.SUPABASE_APP_TOKEN ?? process.env.SUPABASE_APP_TOKEN;

  if (!url || !publishableKey || !accessToken) {
    throw new Error("Supabase environment is not configured");
  }
  return { url: url.replace(/\/$/, ""), publishableKey, accessToken };
}

async function rpc<T>(name: string, body: Record<string, unknown>): Promise<T> {
  const { url, publishableKey, accessToken } = config();
  const response = await fetch(`${url}/rest/v1/rpc/${name}`, {
    method: "POST",
    headers: {
      apikey: publishableKey,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ p_access_token: accessToken, ...body }),
    cache: "no-store",
  });
  if (!response.ok) {
    const error = (await response.json().catch(() => null)) as {
      message?: string;
    } | null;
    throw new Error(error?.message ?? `Supabase request failed (${response.status})`);
  }
  return (await response.json()) as T;
}

export function listSupabaseRecords() {
  return rpc<SupabaseRecord[]>("limestone_list_records", {});
}

export function upsertSupabaseRecord(
  id: string,
  entityType: string,
  payload: unknown,
) {
  return rpc<unknown>("limestone_upsert_record", {
    p_id: id,
    p_entity_type: entityType,
    p_payload: payload,
  });
}
