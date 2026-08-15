// src/database/database.service.ts
import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { Pool } from 'pg';
import { drizzle, NodePgDatabase } from 'drizzle-orm/node-postgres';
import { randomUUID, randomBytes } from 'crypto';
import * as schema from '../../db/schema';
import * as relations from '../../db/relations';

export type AppDb = NodePgDatabase<typeof schema & typeof relations>;

/** Idempotent ID unik (row prefix + random bytes) */
export function genId(prefix = ''): string {
  const raw = randomBytes(8).toString('base64url');
  return prefix ? `${prefix}_${raw}_${randomUUID().slice(0, 8)}` : raw;
}

@Injectable()
export class DatabaseService implements OnModuleInit, OnModuleDestroy {
  db!: AppDb;
  private pool!: Pool;

  async onModuleInit() {
    this.pool = new Pool({
      connectionString: process.env.DATABASE_URL,
      max: Number(process.env.PGPOOL_MAX ?? 20),
      idleTimeoutMillis: 30_000,
      connectionTimeoutMillis: 10_000,
      statement_timeout: Number(process.env.PG_STATEMENT_TIMEOUT ?? 30_000),
    });
    this.db = drizzle(this.pool, {
      schema: { ...schema, ...relations },
      logger: process.env.NODE_ENV === 'development',
    });
  }

  async onModuleDestroy() {
    await this.pool?.end();
  }
}