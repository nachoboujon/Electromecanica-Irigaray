import { NextResponse } from "next/server";
import { z } from "zod";
import { pool } from "@/lib/db";
import type { PoolClient } from "pg";

const checkoutSchema = z.object({ items: z.array(z.object({ partId: z.string().uuid(), quantity: z.number().int().min(1).max(10) })).min(1).max(20) });

export async function POST(request: Request) {
  if (!process.env.DATABASE_URL || !process.env.MP_ACCESS_TOKEN || !process.env.SITE_URL) {
    return NextResponse.json({ error: "El checkout de Mercado Pago todavía no está configurado." }, { status: 503 });
  }
  let payload: unknown;
  try { payload = await request.json(); } catch { return NextResponse.json({ error: "La solicitud no es válida." }, { status: 400 }); }
  const parsed = checkoutSchema.safeParse(payload);
  if (!parsed.success) return NextResponse.json({ error: "Revisá los productos seleccionados." }, { status: 400 });

  const client: PoolClient = await pool.connect();
  let order: { id: string; reference: string; total_amount: string } | undefined;
  let lines: { id: string; name: string; price: string; quantity: number }[] = [];
  try {
    await client.query("BEGIN");
    const ids = [...new Set(parsed.data.items.map((item) => item.partId))];
    const result = await client.query(
      "SELECT id, name, price, availability FROM parts WHERE id = ANY($1::uuid[]) AND is_published = true FOR SHARE",
      [ids],
    );
    const products = new Map<string, { id: string; name: string; price: string | null; availability: string }>(result.rows.map((row) => [row.id, row]));
    if (products.size !== ids.length) throw new Error("Uno o más productos ya no están publicados.");
    lines = parsed.data.items.map(({ partId, quantity }) => {
      const product = products.get(partId)!;
      if (!product.price || product.availability !== "disponible") throw new Error(`${product.name} no tiene precio y disponibilidad confirmados para el pago.`);
      return { id: product.id, name: product.name, price: product.price, quantity };
    });
    const total = lines.reduce((sum, line) => sum + Number(line.price) * line.quantity, 0);
    if (!Number.isFinite(total) || total <= 0) throw new Error("El total del pedido no es válido.");
    const inserted = await client.query("INSERT INTO orders (total_amount) VALUES ($1) RETURNING id, reference, total_amount", [total.toFixed(2)]);
    const createdOrder = inserted.rows[0] as { id: string; reference: string; total_amount: string };
    order = createdOrder;
    for (const line of lines) {
      await client.query("INSERT INTO order_items (order_id, part_id, product_name, quantity, unit_price) VALUES ($1, $2, $3, $4, $5)", [createdOrder.id, line.id, line.name, line.quantity, line.price]);
    }
    await client.query("COMMIT");
  } catch (error) {
    await client.query("ROLLBACK");
    const message = error instanceof Error ? error.message : "No se pudo preparar la compra.";
    client.release();
    return NextResponse.json({ error: message }, { status: 400 });
  }
  client.release();

  try {
    const siteUrl = process.env.SITE_URL!.replace(/\/$/, "");
    const mpResponse = await fetch("https://api.mercadopago.com/checkout/preferences", {
      method: "POST",
      headers: { Authorization: `Bearer ${process.env.MP_ACCESS_TOKEN}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        items: lines.map((line) => ({ id: line.id, title: line.name, quantity: line.quantity, unit_price: Number(line.price), currency_id: "ARS" })),
        external_reference: order!.reference,
        back_urls: { success: `${siteUrl}/pago/retorno`, pending: `${siteUrl}/pago/retorno`, failure: `${siteUrl}/pago/retorno` },
        notification_url: `${siteUrl}/api/payments/webhook`,
      }),
      cache: "no-store",
    });
    const preference = await mpResponse.json();
    if (!mpResponse.ok || !preference.init_point || !preference.id) throw new Error("Mercado Pago no pudo crear el checkout.");
    await pool.query("UPDATE orders SET provider_preference_id = $1 WHERE id = $2", [preference.id, order!.id]);
    return NextResponse.json({ checkoutUrl: preference.init_point });
  } catch (error) {
    console.error("Mercado Pago preference creation failed:", error);
    return NextResponse.json({ error: "No pudimos iniciar Mercado Pago. No se realizó ningún cobro; intentá de nuevo." }, { status: 502 });
  }
}
