import { randomBytes, scrypt as scryptCallback } from "node:crypto";
const scrypt = (password, salt, length, options) => new Promise((resolve, reject) => scryptCallback(password, salt, length, options, (error, key) => error ? reject(error) : resolve(key)));
const password = process.env.ADMIN_PASSWORD_ONESHOT;
delete process.env.ADMIN_PASSWORD_ONESHOT;
if (!password || password.length < 14) {
  console.error("La contraseña debe tener al menos 14 caracteres.");
  process.exit(1);
}
const salt = randomBytes(16);
const derived = await scrypt(password, salt, 64, { N: 2 ** 15, r: 8, p: 1, maxmem: 64 * 1024 * 1024 });
console.log(`scrypt$15$${salt.toString("base64url")}$${Buffer.from(derived).toString("base64url")}`);
