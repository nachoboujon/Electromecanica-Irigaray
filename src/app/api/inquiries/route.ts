import { NextResponse } from "next/server";
import { z } from "zod";
import { pool } from "@/lib/db";

const inquirySchema = z.object({
  name: z.string().trim().min(2).max(120),
  phone: z.string().trim().max(40).optional().or(z.literal("")),
  email: z.string().trim().email().max(254).optional().or(z.literal("")),
  reason: z.string().trim().min(2).max(100),
  message: z.string().trim().min(10).max(4000),
}).refine((value) => Boolean(value.phone || value.email), { message: "Ingresá un teléfono o un correo." });

export async function POST(request: Request) {
  let payload: unknown;
  try { payload = await request.json(); } catch { return NextResponse.json({ error: "El formulario no tiene un formato válido." }, { status: 400 }); }
  const parsed = inquirySchema.safeParse(payload);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Revisá los datos ingresados." }, { status: 400 });
  if (!process.env.DATABASE_URL) return NextResponse.json({ error: "El formulario todavía no está conectado. Configurá la base de datos del sitio." }, { status: 503 });
  const { name, phone, email, reason, message } = parsed.data;
  try {
    await pool.query("INSERT INTO inquiries (name, phone, email, reason, message) VALUES ($1, $2, $3, $4, $5)", [name, phone || null, email || null, reason, message]);
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Could not save inquiry:", error);
    return NextResponse.json({ error: "No pudimos guardar la consulta. Probá de nuevo o escribinos por WhatsApp." }, { status: 503 });
  }
}
