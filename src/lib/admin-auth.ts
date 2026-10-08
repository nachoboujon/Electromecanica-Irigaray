import { createHmac, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";

export const ADMIN_COOKIE = "taller_admin";
const ttl = 8 * 60 * 60;
function secret() { const value = process.env.ADMIN_SESSION_SECRET; if (!value || value.length < 32) throw new Error("ADMIN_SESSION_SECRET must contain at least 32 characters"); return value; }
function signature(payload: string) { return createHmac("sha256", secret()).update(payload).digest("base64url"); }
export function makeAdminToken(email: string) { const payload = Buffer.from(JSON.stringify({ email, exp: Math.floor(Date.now() / 1000) + ttl })).toString("base64url"); return `${payload}.${signature(payload)}`; }
export function verifyAdminToken(token?: string) {
  try {
    if (!token) return false;
    const [payload, sig] = token.split("."); if (!payload || !sig) return false;
    const expected = Buffer.from(signature(payload)); const actual = Buffer.from(sig);
    if (actual.length !== expected.length || !timingSafeEqual(actual, expected)) return false;
    const data = JSON.parse(Buffer.from(payload, "base64url").toString("utf8")) as { email?: string; exp?: number };
    return data.email === process.env.ADMIN_EMAIL && typeof data.exp === "number" && data.exp > Date.now() / 1000;
  } catch { return false; }
}
export async function isAdmin() { return verifyAdminToken((await cookies()).get(ADMIN_COOKIE)?.value); }
export function validAdminOrigin(request: Request) {
  const origin = request.headers.get("origin");
  if (!origin) return true;
  try { return new URL(origin).host === new URL(request.url).host; } catch { return false; }
}
