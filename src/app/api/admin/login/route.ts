import { createHmac, scrypt as scryptCallback, timingSafeEqual } from "node:crypto";
import { NextResponse } from "next/server";
import { z } from "zod";
import { pool } from "@/lib/db";
import { ADMIN_COOKIE, makeAdminToken, validAdminOrigin } from "@/lib/admin-auth";
function scrypt(password: string, salt: Buffer, keylen: number, options: { N: number; r: number; p: number; maxmem: number }) {
  return new Promise<Buffer>((resolve, reject) => scryptCallback(password, salt, keylen, options, (error, key) => error ? reject(error) : resolve(key as Buffer)));
}
const bodySchema = z.object({ email: z.string().email().max(254), password: z.string().min(1).max(256) });

export async function POST(request: Request) {
  if (!validAdminOrigin(request)) return NextResponse.json({ error: "Origen inválido." }, { status: 403 });
  const configured = process.env.ADMIN_EMAIL && process.env.ADMIN_PASSWORD_HASH && process.env.ADMIN_SESSION_SECRET;
  if (!configured) return NextResponse.json({ error: "El acceso de administración no está configurado." }, { status: 503 });
  const parsed = bodySchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Ingresá correo y contraseña válidos." }, { status: 400 });
  const { email, password } = parsed.data;
  const forwarded = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
  const ipHash = createHmac("sha256", process.env.ADMIN_SESSION_SECRET!).update(forwarded).digest("hex");
  try {
    await pool.query("DELETE FROM admin_login_attempts WHERE attempted_at < now() - interval '1 day'");
    const attempts = await pool.query("SELECT count(*)::int AS count FROM admin_login_attempts WHERE ip_hash=$1 AND attempted_at > now() - interval '15 minutes'", [ipHash]);
    if (attempts.rows[0].count >= 8) return NextResponse.json({ error: "Demasiados intentos. Probá nuevamente más tarde." }, { status: 429 });
    await pool.query("INSERT INTO admin_login_attempts (ip_hash) VALUES ($1)", [ipHash]);
    const [scheme, nText, salt, expectedText] = process.env.ADMIN_PASSWORD_HASH!.split("$");
    if (scheme !== "scrypt" || !/^\d+$/.test(nText ?? "") || !salt || !expectedText) throw new Error("Invalid scrypt hash configuration");
    const cost = Number(nText); if (cost < 14 || cost > 18) throw new Error("Invalid scrypt cost");
    const expected = Buffer.from(expectedText, "base64url");
    const actual = await scrypt(password, Buffer.from(salt, "base64url"), expected.length, { N: 2 ** cost, r: 8, p: 1, maxmem: 64 * 1024 * 1024 }) as Buffer;
    if (email.toLowerCase() !== process.env.ADMIN_EMAIL!.toLowerCase() || expected.length !== actual.length || !timingSafeEqual(actual, expected)) return NextResponse.json({ error: "Correo o contraseña incorrectos." }, { status: 401 });
    await pool.query("DELETE FROM admin_login_attempts WHERE ip_hash=$1", [ipHash]);
    const response = NextResponse.json({ ok: true });
    response.cookies.set(ADMIN_COOKIE, makeAdminToken(process.env.ADMIN_EMAIL!), { httpOnly: true, sameSite: "strict", secure: process.env.NODE_ENV === "production", path: "/", maxAge: 8 * 60 * 60 });
    return response;
  } catch (error) {
    console.error("Admin login unavailable:", error);
    return NextResponse.json({ error: "No se pudo validar el acceso. Verificá la base y la configuración." }, { status: 503 });
  }
}

export async function DELETE(request: Request) {
  if (!validAdminOrigin(request)) return NextResponse.json({ error: "Origen inválido." }, { status: 403 });
  const response = NextResponse.json({ ok: true });
  response.cookies.set(ADMIN_COOKIE, "", { httpOnly: true, sameSite: "strict", secure: process.env.NODE_ENV === "production", path: "/", maxAge: 0 });
  return response;
}
