import { NextResponse } from "next/server";
import { isAdmin } from "@/lib/admin-auth";
import { pool } from "@/lib/db";
import { productSchema } from "@/lib/product-schema";

export async function GET() {
  if (!await isAdmin()) return NextResponse.json({ error: "No autorizado." }, { status: 401 });
  try {
    const [parts, categories] = await Promise.all([
      pool.query("SELECT p.id,p.category_id,c.name AS category_name,p.barcode,p.name,p.description,p.image_url,p.price,p.availability,p.is_published,p.created_at,p.updated_at FROM parts p LEFT JOIN parts_categories c ON c.id=p.category_id ORDER BY p.updated_at DESC"),
      pool.query("SELECT id,name,description FROM parts_categories ORDER BY display_order,name"),
    ]);
    return NextResponse.json({ products: parts.rows, categories: categories.rows });
  } catch { return NextResponse.json({ error: "No se pudo cargar el catálogo." }, { status: 503 }); }
}

export async function POST(request: Request) {
  if (!await isAdmin()) return NextResponse.json({ error: "No autorizado." }, { status: 401 });
  const parsed = productSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Revisá los datos del producto." }, { status: 400 });
  const p = parsed.data;
  try {
    const result = await pool.query("INSERT INTO parts(category_id,barcode,name,description,image_url,price,availability,is_published) VALUES($1,$2,$3,$4,$5,$6,$7,$8) RETURNING id", [p.category_id,p.barcode,p.name,p.description,p.image_url,p.price,p.availability,p.is_published]);
    return NextResponse.json({ id: result.rows[0].id }, { status: 201 });
  } catch (error) {
    if (isDuplicate(error)) return NextResponse.json({ error: "Ese código de barras ya está asignado a otro producto." }, { status: 409 });
    return NextResponse.json({ error: "No se pudo guardar el producto." }, { status: 503 });
  }
}
function isDuplicate(error: unknown) { return typeof error === "object" && error !== null && "code" in error && error.code === "23505"; }
