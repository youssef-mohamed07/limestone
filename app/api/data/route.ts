import { NextResponse } from "next/server";
import { getChatGPTUser } from "../../chatgpt-auth";
import {
  listSupabaseRecords,
  upsertSupabaseRecord,
} from "../../../lib/supabase-records";

const catalogTypes = [
  "customers",
  "products",
  "payments",
  "shipments",
  "documents",
  "settings",
] as const;

export async function GET() {
  const user = await getChatGPTUser();
  if (!user)
    return NextResponse.json(
      { error: "Authentication required" },
      { status: 401 },
    );

  try {
    const rows = await listSupabaseRecords();
    const data = Object.fromEntries(
      catalogTypes.map((type) => [
        type,
        rows.find((row) => row.entity_type === type)?.payload ?? null,
      ]),
    );
    return NextResponse.json({ data, source: "supabase" });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unable to load data" },
      { status: 503 },
    );
  }
}

export async function POST(request: Request) {
  const user = await getChatGPTUser();
  if (!user)
    return NextResponse.json(
      { error: "Authentication required" },
      { status: 401 },
    );

  try {
    const body = (await request.json()) as Record<string, unknown>;
    const updates = catalogTypes.filter((type) => body[type] !== undefined);
    if (!updates.length)
      return NextResponse.json({ error: "No data supplied" }, { status: 400 });

    await Promise.all(
      updates.map((type) =>
        upsertSupabaseRecord(`catalog:${type}`, type, body[type]),
      ),
    );
    return NextResponse.json({ saved: updates, source: "supabase" });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unable to save data" },
      { status: 500 },
    );
  }
}
