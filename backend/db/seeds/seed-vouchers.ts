// db/seeds/seed-vouchers.ts
// Seed voucher dummy sesuai promt.md — jalanin: npm run db:seed:vouchers
// - DISKON50  : DISCOUNT 50% (maks 250.000), min pembelian 100.000
// - ONGKIR50  : SHIPPING 50% (maks 25.000), min pembelian 50.000
import { db, genId, closePool, schema, eq } from './lib';

const VOUCHERS = [
  {
    code: 'DISKON50',
    name: 'Diskon 50%',
    description: 'Diskon 50% untuk pembelian produk, maksimal Rp 250.000. Berlaku minimal belanja Rp 100.000.',
    category: 'DISCOUNT',
    type: 'PERCENTAGE',
    value: 50,
    minPurchase: 100000,
    maxDiscount: 250000,
    quota: 100,
  },
  {
    code: 'ONGKIR50',
    name: 'Diskon Ongkir 50%',
    description: 'Diskon 50% untuk ongkos kirim, maksimal Rp 25.000. Berlaku minimal belanja Rp 50.000.',
    category: 'SHIPPING',
    type: 'PERCENTAGE',
    value: 50,
    minPurchase: 50000,
    maxDiscount: 25000,
    quota: 100,
  },
];

async function main() {
  for (const v of VOUCHERS) {
    const [existing] = await db
      .select({ id: schema.vouchers.id })
      .from(schema.vouchers)
      .where(eq(schema.vouchers.code, v.code));

    if (existing) {
      await db
        .update(schema.vouchers)
        .set({
          name: v.name,
          description: v.description,
          category: v.category as any,
          type: v.type as any,
          value: String(v.value),
          minPurchase: String(v.minPurchase),
          maxDiscount: String(v.maxDiscount),
          quota: v.quota,
          isActive: true,
          startDate: null,
          endDate: null,
        })
        .where(eq(schema.vouchers.id, existing.id));
      console.log(`♻️  Updated voucher ${v.code} (${v.category})`);
    } else {
      await db.insert(schema.vouchers).values({
        id: genId('vc'),
        code: v.code,
        name: v.name,
        description: v.description,
        category: v.category as any,
        type: v.type as any,
        value: String(v.value),
        minPurchase: String(v.minPurchase),
        maxDiscount: String(v.maxDiscount),
        quota: v.quota,
        isActive: true,
      });
      console.log(`✅ Created voucher ${v.code} (${v.category})`);
    }
  }
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(closePool);
