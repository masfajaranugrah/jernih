require('dotenv').config({ path: require('path').join(__dirname, '../.env') });
const { Client } = require('pg');

const url = process.env.DATABASE_URL;
if (!url) {
  console.error('DATABASE_URL tidak ditemukan');
  process.exit(1);
}

const client = new Client({ connectionString: url });

const now = Date.now();
const promos = [
  {
    id: 'promo_demo_001',
    productId: 'prod-4',
    title: 'Promo Kamera DSLR',
    subtitle: 'Hemat 20% untuk Kamera DSLR Canon EOS',
    bannerBg: '#064e3b',
    promoPrice: '6400000',
    discountPercent: '20',
    status: 'ACTIVE',
    quota: 10,
    startDate: new Date(now - 3600e3).toISOString(),
    endDate: new Date(now + 3 * 86400e3).toISOString(),
  },
  {
    id: 'promo_demo_002',
    productId: 'prod_AGcMr2viEVQ_4154285a',
    title: 'Promo Akan Datang',
    subtitle: 'Segera hadir untuk produk ini',
    bannerBg: '#7c2d12',
    promoPrice: '100000',
    discountPercent: '24',
    status: 'SCHEDULED',
    quota: 50,
    startDate: new Date(now + 86400e3).toISOString(),
    endDate: new Date(now + 5 * 86400e3).toISOString(),
  },
];

(async () => {
  await client.connect();
  for (const p of promos) {
    await client.query(
      `INSERT INTO product_promos
        (id, "productId", title, subtitle, "bannerBg", "promoPrice", "discountPercent", status, quota, "soldCount", "startDate", "endDate", "updatedAt")
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,0,$10,$11,NOW())
       ON CONFLICT (id) DO UPDATE SET
         "productId"=EXCLUDED."productId", title=EXCLUDED.title, subtitle=EXCLUDED.subtitle,
         "bannerBg"=EXCLUDED."bannerBg", "promoPrice"=EXCLUDED."promoPrice",
         "discountPercent"=EXCLUDED."discountPercent", status=EXCLUDED.status, quota=EXCLUDED.quota,
         "startDate"=EXCLUDED."startDate", "endDate"=EXCLUDED."endDate", "updatedAt"=NOW()`,
      [p.id, p.productId, p.title, p.subtitle, p.bannerBg, p.promoPrice, p.discountPercent, p.status, p.quota, p.startDate, p.endDate],
    );
  }
  const { rows } = await client.query(
    'SELECT id, title, status, "startDate", "endDate", "promoPrice" FROM product_promos ORDER BY "startDate"',
  );
  console.table(rows);
  await client.end();
})().catch((e) => {
  console.error(e);
  process.exit(1);
});