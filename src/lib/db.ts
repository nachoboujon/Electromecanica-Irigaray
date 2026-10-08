import { Pool } from "pg";

const globalForPool = globalThis as unknown as { pgPool?: Pool };

export const pool = globalForPool.pgPool ?? new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.DATABASE_SSL === "true" ? { rejectUnauthorized: true } : undefined,
  max: 10,
  idleTimeoutMillis: 30_000,
  connectionTimeoutMillis: 5_000,
});

if (process.env.NODE_ENV !== "production") globalForPool.pgPool = pool;
