import { NextResponse } from "next/server";
import { getChatGPTUser } from "../../chatgpt-auth";
import { calculateInvoiceTotals } from "../../../lib/calculations";
import {
  listSupabaseRecords,
  upsertSupabaseRecord,
} from "../../../lib/supabase-records";
import { invoiceSchema } from "../../../lib/validation";

export async function GET() {
  const user = await getChatGPTUser();
  if (!user)
    return NextResponse.json(
      { error: "Authentication required" },
      { status: 401 },
    );

  try {
    const rows = await listSupabaseRecords();
    const invoiceData = rows
      .filter((row) => row.entity_type === "invoice")
      .map((row) => row.payload)
      .filter(
        (invoice) =>
          typeof invoice === "object" &&
          invoice !== null &&
          (!("status" in invoice) || invoice.status !== "Archived"),
      );
    return NextResponse.json({ invoices: invoiceData, source: "supabase" });
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Invoice storage is not available yet",
      },
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
    const body = await request.json();
    const parsed = invoiceSchema.safeParse({
      number: body.number,
      invoiceDate: body.date,
      customerId: body.customerId,
      currency: body.currency,
      containerQuantity: body.containers,
      freightPerContainerMinor: body.freightPerContainerMinor,
      downPaymentPercent: body.downPaymentPercent,
      items: body.items,
    });
    if (!parsed.success)
      return NextResponse.json(
        { error: "Invalid invoice", issues: parsed.error.flatten() },
        { status: 400 },
      );

    const totals = calculateInvoiceTotals({
      items: parsed.data.items,
      containers: parsed.data.containerQuantity,
      freightPerContainerMinor: parsed.data.freightPerContainerMinor,
      downPaymentPercent: parsed.data.downPaymentPercent,
    });
    const now = new Date().toISOString();
    const invoiceId = typeof body.id === "string" ? body.id : crypto.randomUUID();
    const snapshot = { ...body, id: invoiceId };
    await upsertSupabaseRecord(`invoice:${invoiceId}`, "invoice", {
      ...snapshot,
      updatedAt: now,
      updatedBy: user.email,
    });

    return NextResponse.json({ id: invoiceId, totals, source: "supabase" });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unable to save invoice" },
      { status: 500 },
    );
  }
}
