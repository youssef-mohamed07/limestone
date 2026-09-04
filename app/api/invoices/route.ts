import { NextResponse } from "next/server";
import { getChatGPTUser } from "../../chatgpt-auth";
import { getDb } from "../../../db";
import { activityLogs, invoiceSnapshots } from "../../../db/schema";
import { calculateInvoiceTotals } from "../../../lib/calculations";
import { invoiceSchema } from "../../../lib/validation";

export async function GET() {
  const user = await getChatGPTUser();
  if (!user)
    return NextResponse.json(
      { error: "Authentication required" },
      { status: 401 },
    );

  try {
    const rows = await getDb().select().from(invoiceSnapshots);
    const invoiceData = rows.flatMap((row) => {
      try {
        return [JSON.parse(row.payload)];
      } catch {
        return [];
      }
    });
    return NextResponse.json({ invoices: invoiceData });
  } catch {
    return NextResponse.json(
      { error: "Invoice storage is not available yet" },
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
    const db = getDb();

    await db
      .insert(invoiceSnapshots)
      .values({
        id: invoiceId,
        number: parsed.data.number,
        payload: JSON.stringify(snapshot),
        createdAt: now,
        updatedAt: now,
      })
      .onConflictDoUpdate({
        target: invoiceSnapshots.id,
        set: {
          number: parsed.data.number,
          payload: JSON.stringify(snapshot),
          updatedAt: now,
        },
      });

    await db.insert(activityLogs).values({
      id: crypto.randomUUID(),
      userId: user.userId,
      action: "INVOICE_SAVED",
      entity: "Invoice",
      entityId: invoiceId,
      newValue: JSON.stringify({
        number: parsed.data.number,
        grandTotalMinor: totals.grandTotalMinor,
      }),
      createdAt: now,
    });

    return NextResponse.json({ id: invoiceId, totals });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unable to save invoice" },
      { status: 500 },
    );
  }
}
