// db/seeds/lib.ts
// Pustaka bersama untuk script seeding dengan Drizzle.
import 'dotenv/config';
import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import { randomBytes, randomUUID } from 'crypto';
import { eq } from 'drizzle-orm';
import * as schema from '../schema';
import * as relations from '../relations';

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
export const db = drizzle(pool, { schema: { ...schema, ...relations } });

/** Idempotent ID unik (row prefix + random bytes) */
export function genId(prefix = ''): string {
  const raw = randomBytes(8).toString('base64url');
  return prefix ? `${prefix}_${raw}_${randomUUID().slice(0, 8)}` : raw;
}

/** UUID standar */
export function genUuid(): string {
  return randomUUID();
}

export async function closePool() {
  await pool.end();
}

export { schema, eq };