import { NextResponse } from "next/server";
import { isAdmin } from "@/lib/admin-auth";
import { pool } from "@/lib/db";
import { productSchema } from "@/lib/product-schema";
export async function PATCH(request: Request, context: { params: Promise<{ id: string }> }) {
  if (!await isAdmin()) return NextResponse.json({ error: "No autorizado." }, { status: 401 });
  const { id } = await context.params;
  const parsed = productSchema.safeParse(await request.json().catch(() => null));
  if (!/^[0-9a-f-]{36}$/i.test(id) || !parsed.success) return NextResponse.json({ error: "Datos inválidos." }, { status: 400 });
  const p = parsed.data;
  try {
    const result = await pool.query("UPDATE parts SET category_id=$2,barcode=$3,name=$4,description=$5,image_url=$6,price=$7,availability=$8,is_published=$9 WHERE id=$1 RETURNING id", [id,p.category_id,p.barcode,p.name,p.description,p.image_url,p.price,p.availability,p.is_published]);
    if (!result.rowCount) return NextResponse.json({ error: "Producto inexistente." }, { status: 404 });
    return NextResponse.json({ ok: true });
  } catch (error) {
    if (typeof error === "object" && error !== null && "code" in error && error.code === "23505") return NextResponse.json({ error: "Ese código de barras ya está asignado a otro producto." }, { status: 409 });
    return NextResponse.json({ error: "No se pudo guardar el producto." }, { status: 503 });
  }
}
