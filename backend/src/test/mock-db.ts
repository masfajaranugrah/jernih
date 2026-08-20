// test/mock-db.ts
// Helper mock DatabaseService.db untuk unit test.
// Meniru fluent-chain Drizzle cukup untuk menguji logika service
// (tanpa koneksi database nyata). Merekam semua payload .values()/.set()
// agar test bisa memverifikasi data yang ditulis backend.

export type OpHandlers = {
  select?: (table: any) => any;
  insert?: (table: any) => any;
  update?: (table: any) => any;
  delete?: (table: any) => any;
  txSelect?: (table: any) => any;
  txInsert?: (table: any) => any;
  txUpdate?: (table: any) => any;
  findFirst?: () => any;
};

export interface CapturedWrite {
  op: string;
  table: any;
  payload: any;
}

export function createMockDb(handlers: OpHandlers = {}) {
  const captured: CapturedWrite[] = [];

  const buildChain = (resolver: () => any, onFrom?: (table: any) => () => any, opPrefix = '') => {
    const c: any = {};
    c.from = (table: any) => buildChain(onFrom ? onFrom(table) : resolver, undefined, opPrefix);
    c.where = () => c;
    c.for = () => c;
    c.set = (payload: any) => {
      captured.push({ op: `${opPrefix}update`, table: c.__table ?? null, payload });
      return c;
    };
    c.values = (payload: any) => {
      captured.push({ op: `${opPrefix}insert`, table: c.__table ?? null, payload });
      return c;
    };
    c.onConflictDoNothing = () => c;
    c.returning = () => c;
    c.orderBy = () => c;
    c.limit = () => c;
    c.first = () => c;
    c.then = (onFulfilled: any, onRejected?: any) =>
      Promise.resolve(resolver()).then(onFulfilled, onRejected);
    return c;
  };

  const db: any = {};
  db.select = () => buildChain(() => undefined, (table) => () => (handlers.select ? handlers.select(table) : undefined));
  db.insert = (table: any) => {
    const c = buildChain(() => (handlers.insert ? handlers.insert(table) : undefined), undefined);
    c.__table = table;
    return c;
  };
  db.update = (table: any) => {
    const c = buildChain(() => (handlers.update ? handlers.update(table) : undefined), undefined);
    c.__table = table;
    return c;
  };
  db.delete = (table: any) => {
    const c = buildChain(() => (handlers.delete ? handlers.delete(table) : undefined), undefined);
    c.__table = table;
    const origWhere = c.where;
    c.where = (...args: any[]) => {
      captured.push({ op: 'delete', table, payload: { where: args.length ? args[0] : true } });
      return origWhere(...args);
    };
    return c;
  };

  db.query = {
    orders: { findFirst: (handlers.findFirst ? handlers.findFirst : () => undefined) },
  };

  const tx: any = {};
  tx.select = () => buildChain(() => undefined, (table) => () => (handlers.txSelect ? handlers.txSelect(table) : (handlers.select ? handlers.select(table) : undefined)), 'tx');
  tx.insert = (table: any) => {
    const c = buildChain(() => (handlers.txInsert ? handlers.txInsert(table) : (handlers.insert ? handlers.insert(table) : undefined)), undefined, 'tx');
    c.__table = table;
    return c;
  };
  tx.update = (table: any) => {
    const c = buildChain(() => (handlers.txUpdate ? handlers.txUpdate(table) : (handlers.update ? handlers.update(table) : undefined)), undefined, 'tx');
    c.__table = table;
    return c;
  };

  db.transaction = async (cb: any) => cb(tx);

  return { db, tx, captured };
}