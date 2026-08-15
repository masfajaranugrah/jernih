// db/seeds/seed.ts
// Seed dasar: kategori, admin user, mitra demo, dan produk contoh.
// Idempoten (upsert by id / email).
// Jalankan: npm run db:seed
import { db, genId, eq, closePool, schema } from './lib';

async function main() {
  console.log('🌱 Seeding database...');

  const { categories, users, mitras, products } = schema;

  // ── Kategori ────────────────────────────────────────────────────────────────
  const categoryRows = [
    { id: 'elektronik', name: 'Elektronik', slug: 'elektronik', icon: 'devices' },
    { id: 'elektronik-laptop', name: 'Laptop', slug: 'laptop', icon: 'laptop' },
    { id: 'elektronik-komputer', name: 'Komputer', slug: 'komputer', icon: 'desktop_windows' },
    { id: 'elektronik-monitor', name: 'Monitor', slug: 'monitor', icon: 'monitor' },
    { id: 'elektronik-smartphone', name: 'Smartphone', slug: 'smartphone', icon: 'smartphone' },
    { id: 'elektronik-aksesoris', name: 'Aksesoris Elektronik', slug: 'aksesoris-elektronik', icon: 'headphones' },
    { id: 'fashion', name: 'Fashion', slug: 'fashion', icon: 'checkroom' },
    { id: 'fashion-pria', name: 'Fashion Pria', slug: 'fashion-pria', icon: 'man' },
    { id: 'fashion-wanita', name: 'Fashion Wanita', slug: 'fashion-wanita', icon: 'woman' },
    { id: 'fashion-anak', name: 'Fashion Anak', slug: 'fashion-anak', icon: 'child_care' },
    { id: 'rumah-tangga', name: 'Rumah Tangga', slug: 'rumah-tangga', icon: 'home' },
    { id: 'rumah-dapur', name: 'Dapur', slug: 'dapur', icon: 'kitchen' },
    { id: 'rumah-kamar', name: 'Kamar Tidur', slug: 'kamar-tidur', icon: 'bed' },
    { id: 'rumah-dekorasi', name: 'Dekorasi', slug: 'dekorasi', icon: 'style' },
    { id: 'makanan-minuman', name: 'Makanan & Minuman', slug: 'makanan-minuman', icon: 'restaurant' },
    { id: 'kesehatan', name: 'Kesehatan', slug: 'kesehatan', icon: 'health_and_safety' },
    { id: 'olahraga', name: 'Olahraga', slug: 'olahraga', icon: 'fitness_center' },
    { id: 'otomotif', name: 'Otomotif', slug: 'otomotif', icon: 'directions_car' },
  ];

  for (const cat of categoryRows) {
    await db
      .insert(categories)
      .values({ id: cat.id, name: cat.name, slug: cat.slug, icon: cat.icon })
      .onConflictDoUpdate({ target: categories.id, set: { name: cat.name, slug: cat.slug, icon: cat.icon } });
  }
  console.log(`✓ ${categoryRows.length} kategori selesai`);

  // ── Admin user ───────────────────────────────────────────────────────────────
  const bcrypt = await import('bcrypt');
  const adminPassword = await bcrypt.hash('admin123', 10);

  await db
    .insert(users)
    .values({
      id: genId('usr'),
      email: 'admin@jernihcreative.id',
      password: adminPassword,
      name: 'Admin Jernih Creative',
      role: 'ADMIN',
    })
    .onConflictDoNothing({ target: users.email });
  console.log('✓ Admin user: admin@jernihcreative.id');

  // ── Mitra demo ───────────────────────────────────────────────────────────────
  const insertedMitraUser = await db
    .insert(users)
    .values({
      id: genId('usr'),
      email: 'mitra@jernihcreative.id',
      password: await bcrypt.hash('mitra123', 12),
      name: 'Demo Mitra',
      role: 'MITRA',
    })
    .onConflictDoNothing({ target: users.email })
    .returning({ id: users.id });

  let mitraUserId: string;
  if (insertedMitraUser.length > 0) {
    mitraUserId = insertedMitraUser[0].id;
  } else {
    const [existingUser] = await db
      .select({ id: users.id })
      .from(users)
      .where(eq(users.email, 'mitra@jernihcreative.id'));
    mitraUserId = existingUser.id;
  }

  const insertedMitra = await db
    .insert(mitras)
    .values({
      id: genId('mitra'),
      userId: mitraUserId,
      storeName: 'Jernih Creatife Official Store',
      description: 'Toko resmi Jernih Creatife dengan produk-produk pilihan berkualitas.',
      city: 'Jakarta',
      province: 'DKI Jakarta',
      isVerified: true,
    })
    .onConflictDoNothing({ target: mitras.userId })
    .returning();

  const [mitraRow] = insertedMitra.length
    ? insertedMitra
    : await db.select().from(mitras).where(eq(mitras.userId, mitraUserId));
  console.log(`✓ Mitra: ${mitraRow.storeName}`);

  // ── Produk ────────────────────────────────────────────────────────────────────
  const productsRows: Array<{
    id: string;
    categoryId: string;
    name: string;
    slug: string;
    description: string;
    price: number;
    oldPrice?: number;
    stock: number;
    images: string[];
    isActive: boolean;
  }> = [
    {
      id: 'prod-1',
      categoryId: 'elektronik-laptop',
      name: 'Laptop Gaming ASUS ROG',
      slug: 'laptop-gaming-asus-rog',
      description: 'Laptop gaming bertenaga tinggi dengan prosesor Intel Core i9 generasi terbaru, GPU NVIDIA RTX 4070, RAM 32GB DDR5, dan SSD NVMe 1TB. Layar 15.6" QHD 240Hz untuk pengalaman gaming terbaik.',
      price: 15000000,
      oldPrice: 16500000,
      stock: 10,
      images: ['https://lh3.googleusercontent.com/aida-public/AB6AXuAcCKtONE-oOqQ1l01e4k2hpIrpB7-qqdVH3ANTOcWoB_90mpL3Ug5XEPnfSCS75joY6bUTS9cKl2luQHYfuYcA6SlY4BMhKTI_2IdhbEtcbM7s9ZXSj3R1uknHV-p5au81dvYQXnglm6cKsxgKOHODtyzzHPXtB_Em_7wwSkDs9t-u9pGAg4VoYxkUyrmN85N_OlCtDrorssavgi_f2N-5POP4psuw_h0yLzJLK-MI4XTgvbo9FeZk'],
      isActive: true,
    },
    {
      id: 'prod-2',
      categoryId: 'elektronik-smartphone',
      name: 'iPhone 15 Pro Max',
      slug: 'iphone-15-pro-max',
      description: 'Smartphone flagship Apple dengan chip A17 Pro, kamera 48MP sistem ProRAW, layar Super Retina XDR 6.7", dan baterai tahan seharian.',
      price: 22000000,
      stock: 5,
      images: ['https://lh3.googleusercontent.com/aida-public/AB6AXuCdkTocgES_sIazNeSnxhbhnRee2GCElj-hX4aZRsNYyPfmej2vRLCS9_kzETc8q7mDeBVlLQiIXmQ67iJz69xKTZsosdO3zkK1D-VUYMYaPxIfepAzaPK-FLryaoDh9jRGysrfduI14hXzL3cRad8MqbM_eNYeLGsVK0twQ31Njz20txq3hNNlP6wuZF3inV4GpktY8SFZx36Xw5a18Mg2Fznqls_d7kxm82cYxkpaPlX5FgSzhYV'],
      isActive: true,
    },
    {
      id: 'prod-3',
      categoryId: 'elektronik-aksesoris',
      name: 'Headphone Sony WH-1000XM5',
      slug: 'headphone-sony-wh-1000xm5',
      description: 'Headphone over-ear premium dengan noise cancelling aktif terbaik di kelasnya. Baterai 30 jam, koneksi multipoint, dan kualitas suara Hi-Res Audio.',
      price: 4500000,
      oldPrice: 5000000,
      stock: 20,
      images: ['https://lh3.googleusercontent.com/aida-public/AB6AXuDHKyz3QvmoE8gaJ0uO9TR_ky-QqVfuRHdvDiLrGglbnhqtNXJqF3u5NblTbAescIy3-irxKTZDfUtIgDKIrK54fXsITc8gdxXCpS0aSnYtRoLReU3NA_8QlJfboy4c0t1SLJi9usU2yDEhxvdxFytBbUVkviKcQgds2tpIIv1YmZkfRJvVYId2CqvC24MzezVjMESFkmtk-bBO0q1oRay49n9zz50dioAxQHQ-oNlbryJ90mCQXfLb'],
      isActive: true,
    },
    {
      id: 'prod-4',
      categoryId: 'elektronik-smartphone',
      name: 'Kamera DSLR Canon EOS',
      slug: 'kamera-dslr-canon-eos',
      description: 'Kamera DSLR profesional dengan sensor APS-C 32.5MP, sistem autofokus Dual Pixel CMOS AF II, video 4K/60fps, dan layar sentuh vari-angle.',
      price: 8000000,
      stock: 8,
      images: ['https://lh3.googleusercontent.com/aida-public/AB6AXuBRWSvIl8FFz-XDCTeiDPjhmclkINlx3HoEzdoM0sDSChwqC3MJ4vx-dZsNXBg2kTTAUsD5aD0hMJFyYiZtHkmyD1Y-14zUTx0TcUE8xzi5wxXGaoEjQep39ymyDhlGrW13qZmyf4m13cvKNdfTJqKtI2hM2FE2re44iXdLLf4lD2laFh94Osp3E6Ubks9-wS_iTcNjBEgRxtrgqw5diYPO1WaAwyE5moZykPLGgkyCYASJhPNCnlBa'],
      isActive: true,
    },
  ];

  for (const p of productsRows) {
    const values: any = {
      id: p.id,
      categoryId: p.categoryId,
      name: p.name,
      slug: p.slug,
      description: p.description,
      price: String(p.price),
      oldPrice: p.oldPrice != null ? String(p.oldPrice) : null,
      stock: p.stock,
      images: (p as any).images as string[],
      isActive: p.isActive,
    };
    await db
      .insert(products)
      .values(values)
      .onConflictDoUpdate({ target: products.id, set: { ...values } });
  }
  console.log(`✓ ${productsRows.length} produk selesai`);

  console.log('\n✅ Seeding selesai!');
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(closePool);