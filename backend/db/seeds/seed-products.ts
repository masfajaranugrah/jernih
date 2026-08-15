// db/seeds/seed-products.ts
// Seed data dummy: 30 produk + kategori pendukung. Idempoten (upsert by slug / id).
// Jalankan: npm run db:seed:products
import { db, genId, eq, closePool, schema } from './lib';

// Kategori yang dibutuhkan oleh 30 produk di bawah (sama dengan def di seed.ts):
const CATEGORIES = [
  { id: 'elektronik-laptop', name: 'Laptop', slug: 'laptop', icon: 'laptop' },
  { id: 'elektronik-komputer', name: 'Komputer', slug: 'komputer', icon: 'desktop_windows' },
  { id: 'elektronik-monitor', name: 'Monitor', slug: 'monitor', icon: 'monitor' },
  { id: 'elektronik-smartphone', name: 'Smartphone', slug: 'smartphone', icon: 'smartphone' },
  { id: 'elektronik-aksesoris', name: 'Aksesoris Elektronik', slug: 'aksesoris-elektronik', icon: 'headphones' },
  { id: 'fashion-pria', name: 'Fashion Pria', slug: 'fashion-pria', icon: 'man' },
  { id: 'fashion-wanita', name: 'Fashion Wanita', slug: 'fashion-wanita', icon: 'woman' },
  { id: 'fashion-anak', name: 'Fashion Anak', slug: 'fashion-anak', icon: 'child_care' },
  { id: 'rumah-dapur', name: 'Dapur', slug: 'dapur', icon: 'kitchen' },
  { id: 'rumah-kamar', name: 'Kamar Tidur', slug: 'kamar-tidur', icon: 'bed' },
  { id: 'rumah-dekorasi', name: 'Dekorasi', slug: 'dekorasi', icon: 'style' },
  { id: 'makanan-minuman', name: 'Makanan & Minuman', slug: 'makanan-minuman', icon: 'restaurant' },
  { id: 'kesehatan', name: 'Kesehatan', slug: 'kesehatan', icon: 'health_and_safety' },
  { id: 'olahraga', name: 'Olahraga', slug: 'olahraga', icon: 'fitness_center' },
  { id: 'otomotif', name: 'Otomotif', slug: 'otomotif', icon: 'directions_car' },
];

// Pool gambar (host lh3.googleusercontent.com — sudah diizinkan di next.config)
const IMG_POOL = [
  'https://lh3.googleusercontent.com/aida-public/AB6AXuAcCKtONE-oOqQ1l01e4k2hpIrpB7-qqdVH3ANTOcWoB_90mpL3Ug5XEPnfSCS75joY6bUTS9cKl2luQHYfuYcA6SlY4BMhKTI_2IdhbEtcbM7s9ZXSj3R1uknHV-p5au81dvYQXnglm6cKsxgKOHODtyzzHPXtB_Em_7wwSkDs9t-u9pGAg4VoYxkUyrmN85N_OlCtDrorssavgi_f2N-5POP4psuw_h0yLzJLK-MI4XTgvbo9FeZk',
  'https://lh3.googleusercontent.com/aida-public/AB6AXuCdkTocgES_sIazNeSnxhbhnRee2GCElj-hX4aZRsNYyPfmej2vRLCS9_kzETc8q7mDeBVlLQiIXmQ67iJz69xKTZsosdO3zkK1D-VUYMYaPxIfepAzaPK-FLryaoDh9jRGysrfduI14hXzL3cRad8MqbM_eNYeLGsVK0twQ31Njz20txq3hNNlP6wuZF3inV4GpktY8SFZx36Xw5a18Mg2Fznqls_d7kxm82cYxkpaPlX5FgSzhYV',
  'https://lh3.googleusercontent.com/aida-public/AB6AXuDHKyz3QvmoE8gaJ0uO9TR_ky-QqVfuRHdvDiLrGglbnhqtNXJqF3u5NblTbAescIy3-irxKTZDfUtIgDKIrK54fXsITc8gdxXCpS0aSnYtRoLReU3NA_8QlJfboy4c0t1SLJi9usU2yDEhxvdxFytBbUVkviKcQgds2tpIIv1YmZkfRJvVYId2CqvC24MzezVjMESFkmtk-bBO0q1oRay49n9zz50dioAxQHQ-oNlbryJ90mCQXfLb',
  'https://lh3.googleusercontent.com/aida-public/AB6AXuBRWSvIl8FFz-XDCTeiDPjhmclkINlx3HoEzdoM0sDSChwqC3MJ4vx-dZsNXBg2kTTAUsD5aD0hMJFyYiZtHkmyD1Y-14zUTx0TcUE8xzi5wxXGaoEjQep39ymyDhlGrW13qZmyf4m13cvKNdfTJqKtI2hM2FE2re44iXdLLf4lD2laFh94Osp3E6Ubks9-wS_iTcNjBEgRxtrgqw5diYPO1WaAwyE5moZykPLGgkyCYASJhPNCnlBa',
];

function imgs(i: number): string[] {
  return [IMG_POOL[i % IMG_POOL.length], IMG_POOL[(i + 1) % IMG_POOL.length]];
}

interface SeedProduct {
  name: string;
  slug: string;
  categorySlug: string;
  price: number;
  oldPrice?: number;
  stock: number;
  description: string;
  rating: number;
  totalSold: number;
}

const products: SeedProduct[] = [
  { name: 'Monitor LG 27" IPS Full HD', slug: 'monitor-lg-27-ips-full-hd', categorySlug: 'monitor', price: 2500000, oldPrice: 2900000, stock: 15, rating: 4.8, totalSold: 120, description: 'Monitor IPS 27 inci Full HD 1080p dengan refresh rate 75Hz, bezel tipis, dan sudut pandang lebar. Cocok untuk kerja dan gaming kasual.' },
  { name: 'Mechanical Keyboard RGB 87 Key', slug: 'mechanical-keyboard-rgb-87-key', categorySlug: 'aksesoris-elektronik', price: 450000, oldPrice: 550000, stock: 40, rating: 4.7, totalSold: 310, description: 'Keyboard mechanical hot-swappable dengan switch merah (linear), pencahayaan RGB, dan kabel braided. Nyaman untuk mengetik lama.' },
  { name: 'Mouse Wireless Logitech M221', slug: 'mouse-wireless-logitech-m221', categorySlug: 'aksesoris-elektronik', price: 300000, stock: 60, rating: 4.6, totalSold: 500, description: 'Mouse nirkabel senyap dengan baterai tahan 18 bulan dan sensor optik presisi. Plug & play, kompatibel semua OS.' },
  { name: 'Laptop Lenovo IdeaPad Slim 3', slug: 'laptop-lenovo-ideapad-slim-3', categorySlug: 'laptop', price: 9500000, oldPrice: 11000000, stock: 8, rating: 4.7, totalSold: 45, description: 'Laptop ringan dengan prosesor Ryzen 5, RAM 8GB, SSD 512GB, layar FHD 15.6". Ideal untuk produktivitas sehari-hari.' },
  { name: 'RAM 16GB DDR4 3200MHz', slug: 'ram-16gb-ddr4-3200mhz', categorySlug: 'komputer', price: 700000, oldPrice: 800000, stock: 30, rating: 4.9, totalSold: 250, description: 'Modul RAM DDR4 16GB 3200MHz dari merk ternama. Kompatibel dengan mayoritas motherboard desktop dan laptop.' },
  { name: 'SSD NVMe 1TB PCIe 3.0', slug: 'ssd-nvme-1tb-pcie-30', categorySlug: 'komputer', price: 1200000, oldPrice: 1400000, stock: 25, rating: 4.8, totalSold: 180, description: 'SSD NVMe berkapasitas 1TB dengan kecepatan baca hingga 3500MB/s. Upgrade performa PC/laptop Anda secara instan.' },
  { name: 'Samsung Galaxy A54 5G', slug: 'samsung-galaxy-a54-5g', categorySlug: 'smartphone', price: 5200000, oldPrice: 5800000, stock: 20, rating: 4.7, totalSold: 95, description: 'Smartphone 5G dengan kamera 50MP, layar Super AMOLED 120Hz, baterai 5000mAh, dan IP67.' },
  { name: 'Xiaomi Redmi Note 12 Pro', slug: 'xiaomi-redmi-note-12-pro', categorySlug: 'smartphone', price: 2800000, oldPrice: 3300000, stock: 35, rating: 4.6, totalSold: 220, description: 'Smartphone dengan layar AMOLED 120Hz, kamera 108MP, dan pengisian cepat 67W. Performa tangguh harga terjangkau.' },
  { name: 'Power Bank Anker 20000mAh', slug: 'power-bank-anker-20000mah', categorySlug: 'aksesoris-elektronik', price: 350000, oldPrice: 420000, stock: 50, rating: 4.8, totalSold: 400, description: 'Power bank 20000mAh dengan output 22.5W fast charging dan dual port. Baterai aman bersertifikat.' },
  { name: 'TWS Earbuds Bluetooth 5.3', slug: 'tws-earbuds-bluetooth-53', categorySlug: 'aksesoris-elektronik', price: 250000, oldPrice: 320000, stock: 80, rating: 4.5, totalSold: 650, description: 'Earbuds TWS dengan noise reduction, bass jernih, daya tahan 30 jam total, dan koneksi stabil Bluetooth 5.3.' },
  { name: 'Kemeja Flanel Pria Premium', slug: 'kemeja-flanel-pria-premium', categorySlug: 'fashion-pria', price: 150000, oldPrice: 190000, stock: 45, rating: 4.5, totalSold: 130, description: 'Kemeja flanel pria berbahan lembut dan nyaman, potongan slim fit, cocok untuk santai maupun kerja.' },
  { name: 'Celana Jeans Slim Fit', slug: 'celana-jeans-slim-fit', categorySlug: 'fashion-pria', price: 250000, oldPrice: 300000, stock: 38, rating: 4.4, totalSold: 210, description: 'Celana jeans slim fit pria dari denim premium, stretch nyaman, jahitan rapi, dan tahan lama.' },
  { name: 'Sepatu Sneakers Pria Casual', slug: 'sepatu-sneakers-pria-casual', categorySlug: 'fashion-pria', price: 400000, oldPrice: 500000, stock: 28, rating: 4.6, totalSold: 170, description: 'Sneakers pria kasual dengan desain minimalis, sol empuk anti slip, dan bahan breathable.' },
  { name: 'Dress Wanita Motif Floral', slug: 'dress-wanita-motif-floral', categorySlug: 'fashion-wanita', price: 180000, oldPrice: 220000, stock: 40, rating: 4.5, totalSold: 150, description: 'Dress wanita motif floral, bahan adem, potongan flowy, cocok untuk hangout maupun acara santai.' },
  { name: 'Hijab Instan Voal Premium', slug: 'hijab-instan-voal-premium', categorySlug: 'fashion-wanita', price: 60000, oldPrice: 75000, stock: 100, rating: 4.7, totalSold: 800, description: 'Hijab instan voal premium dengan berbagai pilihan warna, adem, tidak nerawang, dan mudah dibentuk.' },
  { name: 'Kaos Anak Karakter Lucu', slug: 'kaos-anak-karakter-lucu', categorySlug: 'fashion-anak', price: 50000, oldPrice: 65000, stock: 90, rating: 4.6, totalSold: 350, description: 'Kaos anak berbahan katun combed yang lembut di kulit, motif karakter lucu, ukuran tersedia lengkap.' },
  { name: 'Sepatu Anak Sol Empuk', slug: 'sepatu-anak-sol-empuk', categorySlug: 'fashion-anak', price: 120000, oldPrice: 150000, stock: 55, rating: 4.5, totalSold: 180, description: 'Sepatu anak ringan dengan sol empuk dan tali velcro, nyaman untuk aktivitas bermain sehari-hari.' },
  { name: 'Rice Cooker 1.8L Stainless', slug: 'rice-cooker-18l-stainless', categorySlug: 'dapur', price: 450000, oldPrice: 520000, stock: 32, rating: 4.7, totalSold: 240, description: 'Rice cooker kapasitas 1.8 liter dengan panci stainless anti lengket, fungsi keep warm, dan daya rendah.' },
  { name: 'Blender Philips 450W', slug: 'blender-philips-450w', categorySlug: 'dapur', price: 350000, oldPrice: 400000, stock: 40, rating: 4.6, totalSold: 300, description: 'Blender 450W dengan pisau stainless tajam, mangkuk kaca 1.5L, dan pengaman otomatis.' },
  { name: 'Setrika Uap Otomatis 1500W', slug: 'setrika-uap-otomatis-1500w', categorySlug: 'dapur', price: 280000, oldPrice: 330000, stock: 36, rating: 4.5, totalSold: 160, description: 'Setrika uap 1500W dengan pelapis anti lengket, pengatur suhu, dan semprotan air merata.' },
  { name: 'Kasur Lipat 3 Lipatan', slug: 'kasur-lipat-3-lipatan', categorySlug: 'kamar-tidur', price: 900000, oldPrice: 1100000, stock: 18, rating: 4.6, totalSold: 75, description: 'Kasur lipat 3 bagian tebal 10cm, mudah disimpan, cocok untuk tamu dan ruangan kecil.' },
  { name: 'Bantal Memory Foam Orthopedic', slug: 'bantal-memory-foam-orthopedic', categorySlug: 'kamar-tidur', price: 150000, oldPrice: 190000, stock: 60, rating: 4.7, totalSold: 420, description: 'Bantal memory foam ergonomis yang menopang leher dengan baik, membantu tidur lebih nyenyak.' },
  { name: 'Lampu Hias LED Warm White', slug: 'lampu-hias-led-warm-white', categorySlug: 'dekorasi', price: 120000, oldPrice: 150000, stock: 70, rating: 4.4, totalSold: 290, description: 'Lampu hias LED dengan cahaya hangat, hemat energi, dan desain estetik untuk mempercantik ruangan.' },
  { name: 'Vas Bunga Keramik Minimalis', slug: 'vas-bunga-keramik-minimalis', categorySlug: 'dekorasi', price: 85000, oldPrice: 100000, stock: 75, rating: 4.3, totalSold: 200, description: 'Vas bunga keramik minimalis, finishing halus, berbagai ukuran untuk mempercantik meja maupun sudut ruangan.' },
  { name: 'Kopi Arabika Gayo 250gr', slug: 'kopi-arabika-gayo-250gr', categorySlug: 'makanan-minuman', price: 75000, oldPrice: 90000, stock: 120, rating: 4.8, totalSold: 900, description: 'Kopi Arabika Gayo premium, freshly roasted, rasa smooth dengan acidity rendah. Dikemas vakum menjaga aroma.' },
  { name: 'Madu Murni Asli 500ml', slug: 'madu-murni-asli-500ml', categorySlug: 'makanan-minuman', price: 120000, oldPrice: 140000, stock: 85, rating: 4.7, totalSold: 600, description: 'Madu murni alami 100% tanpa campuran, kaya nutrisi, baik untuk daya tahan tubuh dan kesehatan.' },
  { name: 'Vitamin C 1000mg Isi 30', slug: 'vitamin-c-1000mg-isi-30', categorySlug: 'kesehatan', price: 65000, oldPrice: 80000, stock: 150, rating: 4.6, totalSold: 750, description: 'Suplemen Vitamin C 1000mg dengan zinc, membantu menjaga imunitas tubuh dan kesehatan kulit.' },
  { name: 'Sepeda Gunung 24 Speed', slug: 'sepeda-gunung-24-speed', categorySlug: 'olahraga', price: 3500000, oldPrice: 4000000, stock: 6, rating: 4.6, totalSold: 25, description: 'Sepeda gunung dengan rangka aluminium, 24 speed, suspensi depan, dan rem cakram. Siap untuk lintasan off-road.' },
  { name: 'Dumbbell Set 10kg', slug: 'dumbbell-set-10kg', categorySlug: 'olahraga', price: 300000, oldPrice: 360000, stock: 22, rating: 4.5, totalSold: 140, description: 'Set dumbbell 10kg dengan neoprene grip yang nyaman, tidak licin, dan tahan lama untuk latihan di rumah.' },
  { name: 'Oli Mesin Mobil Full Synthetic 5L', slug: 'oli-mesin-mobil-full-synthetic-5l', categorySlug: 'otomotif', price: 450000, oldPrice: 500000, stock: 48, rating: 4.7, totalSold: 320, description: 'Oli mesin mobil full synthetic SAE 0W-20, melindungi mesin dari keausan dan menjaga performa tetap optimal.' },
];

async function main() {
  console.log('🌱 Seeding kategori + 30 produk dummy...');

  const { categories, products: productsTable } = schema;

  // 1) Upsert kategori pendukung (id & slug konsisten dengan seed.ts)
  for (const cat of CATEGORIES) {
    await db
      .insert(categories)
      .values({ id: cat.id, name: cat.name, slug: cat.slug, icon: cat.icon })
      .onConflictDoUpdate({ target: categories.id, set: { name: cat.name, slug: cat.slug, icon: cat.icon } });
  }
  console.log(`✓ ${CATEGORIES.length} kategori siap`);

  // 2) Map slug kategori → id
  const cats = await db.select().from(categories);
  const catMap = new Map(cats.map((c) => [c.slug, c.id]));
  const missing = [...new Set(products.filter((p) => !catMap.has(p.categorySlug)).map((p) => p.categorySlug))];
  if (missing.length) console.warn('⚠ Kategori belum ada (slug):', missing);

  // 3) Upsert produk (by slug)
  let created = 0;
  let updated = 0;
  for (let i = 0; i < products.length; i++) {
    const p = products[i];
    const categoryId = catMap.get(p.categorySlug) ?? null;
    const existing = await db.select({ id: productsTable.id }).from(productsTable).where(eq(productsTable.slug, p.slug));

    const data: any = {
      categoryId,
      name: p.name,
      description: p.description,
      price: String(p.price),
      oldPrice: p.oldPrice != null ? String(p.oldPrice) : null,
      stock: p.stock,
      images: imgs(i),
      isActive: true,
      rating: p.rating,
      totalSold: p.totalSold,
    };

    if (existing.length) {
      await db.update(productsTable).set(data).where(eq(productsTable.id, existing[0].id));
      updated++;
    } else {
      await db.insert(productsTable).values({ id: genId('prod'), slug: p.slug, ...data });
      created++;
    }
  }

  console.log(`✓ ${created} produk dibuat, ${updated} produk diperbarui (total ${products.length}).`);
}

main()
  .catch((e) => { console.error('✗ Gagal seeding:', e); process.exit(1); })
  .finally(closePool);