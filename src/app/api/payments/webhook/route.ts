import { createHmac, timingSafeEqual } from "node:crypto";
import { NextResponse } from "next/server";
import { pool } from "@/lib/db";

function isValidSignature(signature: string, requestId: string, dataId: string, secret: string) {
  const parts = Object.fromEntries(signature.split(",").map((pair) => pair.trim().split("=", 2) as [string, string]));
  const ts = parts.ts;
  const received = parts.v1;
  if (!ts || !received || !/^\d+$/.test(ts) || !/^[a-f0-9]{64}$/i.test(received)) return false;
  const manifest = `id:${dataId.toLowerCase()};request-id:${requestId};ts:${ts};`;
  const expected = createHmac("sha256", secret).update(manifest).digest();
  const actual = Buffer.from(received, "hex");
  return actual.length === expected.length && timingSafeEqual(actual, expected);
}

export async function POST(request: Request) {
  const secret = process.env.MP_WEBHOOK_SECRET;
  if (!secret || !process.env.MP_ACCESS_TOKEN || !process.env.DATABASE_URL) return NextResponse.json({ error: "Webhook no configurado." }, { status: 503 });
  const url = new URL(request.url);
  const dataId = url.searchParams.get("data.id") ?? url.searchParams.get("id") ?? "";
  const signature = request.headers.get("x-signature") ?? "";
  const requestId = request.headers.get("x-request-id") ?? "";
  if (!dataId || !requestId || !isValidSignature(signature, requestId, dataId, secret)) return NextResponse.json({ error: "Firma inválida." }, { status: 401 });

  let notification: { type?: string; action?: string; data?: { id?: string } };
  try { notification = await request.json(); } catch { return NextResponse.json({ ok: true }); }
  if (notification.type !== "payment" || !notification.data?.id || notification.data.id !== dataId) return NextResponse.json({ ok: true });

  try {
    const paymentResponse = await fetch(`https://api.mercadopago.com/v1/payments/${encodeURIComponent(dataId)}`, {
      headers: { Authorization: `Bearer ${process.env.MP_ACCESS_TOKEN}` }, cache: "no-store",
    });
    if (!paymentResponse.ok) return NextResponse.json({ error: "No se pudo verificar el pago con Mercado Pago." }, { status: 502 });
    const payment = await paymentResponse.json();
    const statusMap: Record<string, "pending" | "approved" | "rejected" | "canceled"> = {
      approved: "approved", rejected: "rejected", cancelled: "canceled", canceled: "canceled",
      pending: "pending", in_process: "pending", authorized: "pending",
    };
    const status = statusMap[payment.status];
    if (!status || String(payment.id) !== dataId || !payment.external_reference || payment.currency_id !== "ARS") return NextResponse.json({ error: "Datos de pago no reconocidos." }, { status: 400 });
    const updated = await pool.query(
      `UPDATE orders SET payment_status = $1, provider_payment_id = $2, provider_payment_method = $3
       WHERE reference = $4 AND total_amount = $5 AND currency = 'ARS' AND provider_preference_id = $6
         AND payment_status <> 'approved'
       RETURNING id`,
      [status, String(payment.id), payment.payment_method_id ?? payment.payment_type_id ?? null, payment.external_reference, Number(payment.transaction_amount).toFixed(2), payment.preference_id],
    );
    if (updated.rowCount !== 1) {
      const existing = await pool.query(
        "SELECT payment_status FROM orders WHERE reference = $1 AND total_amount = $2 AND currency = 'ARS' AND provider_preference_id = $3",
        [payment.external_reference, Number(payment.transaction_amount).toFixed(2), payment.preference_id],
      );
      if (existing.rows[0]?.payment_status === "approved") return NextResponse.json({ ok: true });
      return NextResponse.json({ error: "El pago no coincide con un pedido pendiente." }, { status: 404 });
    }
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Mercado Pago webhook processing failed:", error);
    return NextResponse.json({ error: "No se pudo procesar la notificación." }, { status: 500 });
  }
}
