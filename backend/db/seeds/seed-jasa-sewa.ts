// db/seeds/seed-jasa-sewa.ts
// Seed data dummy: 20 jasa + 20 sewa + kategori jasa pendukung. Idempoten (upsert by slug / name).
// Jalankan: npm run db:seed:jasa-sewa
import { db, genId, eq, closePool, schema } from './lib';

// Kategori jasa
const JASA_CATEGORIES = [
  { name: 'Kreatif', slug: 'kreatif', icon: 'brush' },
  { name: 'Konstruksi', slug: 'konstruksi', icon: 'construction' },
  { name: 'IT & Digital', slug: 'it-digital', icon: 'code' },
  { name: 'Kecantikan', slug: 'kecantikan', icon: 'spa' },
  { name: 'Kebersihan', slug: 'kebersihan', icon: 'cleaning_services' },
  { name: 'Kuliner', slug: 'kuliner', icon: 'restaurant' },
  { name: 'Pendidikan', slug: 'pendidikan', icon: 'school' },
  { name: 'Otomotif', slug: 'otomotif', icon: 'directions_car' },
];

// Pool gambar
const IMG_POOL = [
  'https://lh3.googleusercontent.com/aida-public/AB6AXuAcCKtONE-oOqQ1l01e4k2hpIrpB7-qqdVH3ANTOcWoB_90mpL3Ug5XEPnfSCS75joY6bUTS9cKl2luQHYfuYcA6SlY4BMhKTI_2IdhbEtcbM7s9ZXSj3R1uknHV-p5au81dvYQXnglm6cKsxgKOHODtyzzHPXtB_Em_7wwSkDs9t-u9pGAg4VoYxkUyrmN85N_OlCtDrorssavgi_f2N-5POP4psuw_h0yLzJLK-MI4XTgvbo9FeZk',
  'https://lh3.googleusercontent.com/aida-public/AB6AXuCdkTocgES_sIazNeSnxhbhnRee2GCElj-hX4aZRsNYyPfmej2vRLCS9_kzETc8q7mDeBVlLQiIXmQ67iJz69xKTZsosdO3zkK1D-VUYMYaPxIfepAzaPK-FLryaoDh9jRGysrfduI14hXzL3cRad8MqbM_eNYeLGsVK0twQ31Njz20txq3hNNlP6wuZF3inV4GpktY8SFZx36Xw5a18Mg2Fznqls_d7kxm82cYxkpaPlX5FgSzhYV',
  'https://lh3.googleusercontent.com/aida-public/AB6AXuDHKyz3QvmoE8gaJ0uO9TR_ky-QqVfuRHdvDiLrGglbnhqtNXJqF3u5NblTbAescIy3-irxKTZDfUtIgDKIrK54fXsITc8gdxXCpS0aSnYtRoLReU3NA_8QlJfboy4c0t1SLJi9usU2yDEhxvdxFytBbUVkviKcQgds2tpIIv1YmZkfRJvVYId2CqvC24MzezVjMESFkmtk-bBO0q1oRay49n9zz50dioAxQHQ-oNlbryJ90mCQXfLb',
  'https://lh3.googleusercontent.com/aida-public/AB6AXuBRWSvIl8FFz-XDCTeiDPjhmclkINlx3HoEzdoM0sDSChwqC3MJ4vx-dZsNXBg2kTTAUsD5aD0hMJFyYiZtHkmyD1Y-14zUTx0TcUE8xzi5wxXGaoEjQep39ymyDhlGrW13qZmyf4m13cvKNdfTJqKtI2hM2FE2re44iXdLLf4lD2laFh94Osp3E6Ubks9-wS_iTcNjBEgRxtrgqw5diYPO1WaAwyE5moZykPLGgkyCYASJhPNCnlBa',
];

function imgs(i: number): string[] {
  return [IMG_POOL[i % IMG_POOL.length], IMG_POOL[(i + 1) % IMG_POOL.length]];
}

// ─── JASA (Service) ─────────────────────────────────────────────────────────────

interface SeedService {
  name: string;
  slug: string;
  categoryName: string;
  priceFrom: number;
  unit: string;
  rating: number;
  description: string;
}

const services: SeedService[] = [
  { name: 'Desain Logo Profesional', slug: 'desain-logo-profesional', categoryName: 'Kreatif', priceFrom: 350000, unit: 'project', rating: 4.9, description: 'Desain logo unik 3 konsep revisi tak terbatas, format vector siap cetak. Cocok untuk brand UMKM dan perusahaan.' },
  { name: 'Jasa Desain UI/UX Aplikasi', slug: 'desain-ui-ux-aplikasi', categoryName: 'Kreatif', priceFrom: 2500000, unit: 'project', rating: 4.8, description: 'Desain antarmuka aplikasi mobile/web dengan prototype interaktif di Figma. Menyertakan wireframe hingga high-fidelity.' },
  { name: 'Edit Video Cinematic', slug: 'edit-video-cinematic', categoryName: 'Kreatif', priceFrom: 250000, unit: 'video', rating: 4.7, description: 'Editing video cinematic dengan transisi halus, color grading, subtitle, dan musik latar. Siap untuk YouTube & media sosial.' },
  { name: 'Fotografi Produk Katalog', slug: 'fotografi-produk-katalog', categoryName: 'Kreatif', priceFrom: 100000, unit: 'produk', rating: 4.8, description: 'Foto produk berkualitas studio dengan background putih atau lifestyle, hasil sharp dan siap upload marketplace.' },
  { name: 'Jasa Penulisan Artikel SEO', slug: 'penulisan-artikel-seo', categoryName: 'Kreatif', priceFrom: 150000, unit: 'artikel', rating: 4.6, description: 'Artikel SEO friendly 800-1000 kata sesuai topik, keyword research rapi, dan bebas plagiarisme. Deadline tepat waktu.' },
  { name: 'Renovasi Rumah Minimalis', slug: 'renovasi-rumah-minimalis', categoryName: 'Konstruksi', priceFrom: 15000000, unit: 'project', rating: 4.7, description: 'Jasa renovasi rumah minimalis borongan, pengerjaan rapi dan tepat waktu. Termasuk tukang berpengalaman & pengawasan.' },
  { name: 'Pengecatan Dinding Interior', slug: 'pengecatan-dinding-interior', categoryName: 'Konstruksi', priceFrom: 25000, unit: 'm2', rating: 4.5, description: 'Pengecatan dinding interior & eksterior dengan cat berkualitas, rapih, dan bersih. Gratis konsultasi warna.' },
  { name: 'Instalasi Listrik Rumah', slug: 'instalasi-listrik-rumah', categoryName: 'Konstruksi', priceFrom: 500000, unit: 'titik', rating: 4.8, description: 'Instalasi listrik rumah/gedung sesuai standar SNI oleh teknisi bersertifikat. Termasuk garansi pengerjaan.' },
  { name: 'Pemasangan Atap Baja Ringan', slug: 'pemasangan-atap-baja-ringan', categoryName: 'Konstruksi', priceFrom: 95000, unit: 'm2', rating: 4.6, description: 'Pemasangan rangka atap baja ringan + genteng, struktur kokoh anti bocor. Material berkualitas dengan garansi.' },
  { name: 'Pembuatan Website Company Profile', slug: 'website-company-profile', categoryName: 'IT & Digital', priceFrom: 3000000, unit: 'project', rating: 4.9, description: 'Website company profile modern, responsive, SEO ready, plus panel admin sederhana. Hosting & domain membantu.' },
  { name: 'Pembuatan Aplikasi Android/iOS', slug: 'pembuatan-aplikasi-mobile', categoryName: 'IT & Digital', priceFrom: 10000000, unit: 'project', rating: 4.8, description: 'Jasa pembuatan aplikasi mobile native/hybrid dengan fitur lengkap, UI menarik, dan siap rilis ke Play Store/App Store.' },
  { name: 'Jasa Install Ulang & Perbaikan Laptop', slug: 'install-ulang-perbaikan-laptop', categoryName: 'IT & Digital', priceFrom: 75000, unit: 'unit', rating: 4.7, description: 'Install ulang OS, bersihkan virus, dan perbaikan hardware laptop. Diagnosa gratis, garansi pengerjaan 1 bulan.' },
  { name: 'Jaringan Kabel & WiFi Kantor', slug: 'jaringan-wifi-kantor', categoryName: 'IT & Digital', priceFrom: 1000000, unit: 'project', rating: 4.6, description: 'Instalasi jaringan LAN/WiFi kantor dengan konfigurasi router & switch, coverage merata. Sertifikat titik jaringan.' },
  { name: 'Make Up Wisuda & Bridal', slug: 'make-up-wisuda-bridal', categoryName: 'Kecantikan', priceFrom: 300000, unit: 'sesi', rating: 4.9, description: 'Jasa rias pengantin & wisuda dengan produk halal premium, tahan lama, dan hasil natural glowing. Home service tersedia.' },
  { name: 'Manicure & Pedicure Premium', slug: 'manicure-pedicure-premium', categoryName: 'Kecantikan', priceFrom: 65000, unit: 'sesi', rating: 4.7, description: 'Perawatan kuku tangan & kaki dengan alat steril, pilihan warna gel polis lengkap, dan hasil rapi tahan lama.' },
  { name: 'Jasa Kebersihan Rumah', slug: 'jasa-kebersihan-rumah', categoryName: 'Kebersihan', priceFrom: 150000, unit: 'jam', rating: 4.6, description: 'Cuci rumah menyeluruh oleh petugas profesional, termasuk lantai, kaca, dapur, dan kamar mandi. Datang dengan peralatan sendiri.' },
  { name: 'Laundry Kiloan Antar Jemput', slug: 'laundry-kiloan', categoryName: 'Kebersihan', priceFrom: 5000, unit: 'kg', rating: 4.9, description: 'Laundry kiloan dengan layanan antar-jemput gratis area kota, cuci wangi, setrika rapi, dan selesai 1x24 jam.' },
  { name: 'Catering Harian Kantor', slug: 'catering-harian-kantor', categoryName: 'Kuliner', priceFrom: 25000, unit: 'porsi', rating: 4.7, description: 'Catering harian untuk kantor/sekolah, menu bergizi beragam tiap hari, pengiriman tepat waktu dengan wadah higienis.' },
  { name: 'Les Privat Matematika', slug: 'les-privat-matematika', categoryName: 'Pendidikan', priceFrom: 75000, unit: 'sesi', rating: 4.8, description: 'Les privat matematika SD-SMP-SMA oleh guru berpengalaman, metode mudah dipahami, bisa datang ke rumah atau online.' },
  { name: 'Cuci Mobil Salju & Poles', slug: 'cuci-mobil-salju-poles', categoryName: 'Otomotif', priceFrom: 150000, unit: 'mobil', rating: 4.6, description: 'Cuci mobil salju, poles body polish, dan detailing interior. Mobil kembali kinclong seperti baru.' },
];

// ─── SEWA (RentalItem) ──────────────────────────────────────────────────────────

interface SeedRental {
  name: string;
  slug: string;
  cat: string;
  pricePerDay: number;
  deposit: number;
  rating: number;
  description: string;
}

const rentals: SeedRental[] = [
  { name: 'Sewa Kamera Canon EOS R50', slug: 'sewa-kamera-canon-eos-r50', cat: 'Kamera', pricePerDay: 250000, deposit: 1500000, rating: 4.9, description: 'Kamera mirrorless dengan lensa kit 18-45mm, kualitas video 4K. Digunakan untuk pemotretan & vlog.' },
  { name: 'Sewa Drone DJI Mini 4 Pro', slug: 'sewa-drone-dji-mini-4-pro', cat: 'Kamera', pricePerDay: 350000, deposit: 2000000, rating: 4.8, description: 'Drone ringkas dengan kamera 4K, stabilisasi gimbal 3-axis, dan fitur obstacle sensing. Termasuk 2 baterai.' },
  { name: 'Sewa Lensa 85mm F1.8', slug: 'sewa-lensa-85mm-f1-8', cat: 'Kamera', pricePerDay: 150000, deposit: 1000000, rating: 4.7, description: 'Lensa prime 85mm bukaan besar, bokeh cantik, cocok untuk portrait dan wedding.' },
  { name: 'Sewa Proyektor HD 1080p', slug: 'sewa-proyektor-hd-1080p', cat: 'Elektronik', pricePerDay: 120000, deposit: 750000, rating: 4.6, description: 'Proyektor LCD Full HD untuk meeting, nonton bareng, atau outdoor cinema. Siap dengan kabel & adaptor.' },
  { name: 'Sewa Sound System Acara', slug: 'sewa-sound-system-acara', cat: 'Elektronik', pricePerDay: 750000, deposit: 3000000, rating: 4.8, description: 'Paket sound system lengkap (speaker, mixer, mic) untuk acara nikah, ulang tahun, dan event perusahaan.' },
  { name: 'Sewa Lighting DMX & Laser', slug: 'sewa-lighting-dmx-laser', cat: 'Elektronik', pricePerDay: 500000, deposit: 2000000, rating: 4.7, description: 'Peralatan lighting panggung DMX + laser untuk hiburan malam dan konser. Tim operator tersedia.' },
  { name: 'Sewa Mobil Avanza 7 Kursi', slug: 'sewa-mobil-avanza', cat: 'Kendaraan', pricePerDay: 450000, deposit: 1500000, rating: 4.7, description: 'Toyota Avanza 7 penumpang, bersih, AC dingin, dan servis rutin. Cocok untuk perjalanan keluarga & dinas.' },
  { name: 'Sewa Mobil Alphard Premium', slug: 'sewa-mobil-alphard', cat: 'Kendaraan', pricePerDay: 1800000, deposit: 5000000, rating: 4.9, description: 'Toyota Alphard mewah dengan sopir berpengalaman, kursi premium, cocok untuk tamu VIP & wisata.' },
  { name: 'Sewa Motor NMAX 155', slug: 'sewa-motor-nmax-155', cat: 'Kendaraan', pricePerDay: 100000, deposit: 500000, rating: 4.6, description: 'Yamaha NMAX 155 matik, irit dan nyaman untuk mobilitas harian di perkotaan. Termasuk 2 helm.' },
  { name: 'Sewa Alat Berat Excavator', slug: 'sewa-excavator', cat: 'Kendaraan', pricePerDay: 3500000, deposit: 10000000, rating: 4.8, description: 'Excavator mini 5 ton untuk proyek konstruksi & galian. Operator berpengalaman disertakan.' },
  { name: 'Sewa Tenda Pesta 3x4', slug: 'sewa-tenda-pesta-3x4', cat: 'Event', pricePerDay: 200000, deposit: 500000, rating: 4.5, description: 'Tenda pesta 3x4 dengan atap, cocok untuk acara hajatan, bazar, dan pameran. Termasuk pemasangan.' },
  { name: 'Sewa Kursi Chitose & Meja', slug: 'sewa-kursi-chitose-meja', cat: 'Event', pricePerDay: 7500, deposit: 50000, rating: 4.4, description: 'Sewa kursi & meja untuk acara pernikahan, seminar, dan gathering. Tersedia jumlah besar, pengiriman cepat.' },
  { name: 'Sewa Panggung Podium Stage', slug: 'sewa-panggung-podium', cat: 'Event', pricePerDay: 1500000, deposit: 3000000, rating: 4.6, description: 'Panggung podium ukuran custom dengan karpet dan backwall, untuk berbagai jenis event.' },
  { name: 'Sewa PS5 Playstation 5', slug: 'sewa-ps5-playstation-5', cat: 'Hiburan', pricePerDay: 150000, deposit: 1500000, rating: 4.8, description: 'Console PS5 dengan 2 controller dan beberapa game pilihan. Seru untuk acara gathering jakun.' },
  { name: 'Sewa Console Nintendo Switch', slug: 'sewa-nintendo-switch', cat: 'Hiburan', pricePerDay: 100000, deposit: 750000, rating: 4.7, description: 'Nintendo Switch OLED + Joy-Cons untuk hiburan keluarga, game multiplayer tersedia.' },
  { name: 'Sewa Alat Camping Complete Set', slug: 'sewa-alat-camping-set', cat: 'Outdoor', pricePerDay: 150000, deposit: 500000, rating: 4.6, description: 'Paket lengkap camping: tenda 4 orang, sleeping bag, matras, kompor, dan penerangan. Siap outdoor.' },
  { name: 'Sewa Tas Carrier 60L', slug: 'sewa-tas-carrier-60l', cat: 'Outdoor', pricePerDay: 50000, deposit: 200000, rating: 4.5, description: 'Carrier 60L dengan rain cover, punggung nyaman untuk pendakian & backpacking.' },
  { name: 'Sewa Mesin Molen Semen', slug: 'sewa-mesin-molen-semen', cat: 'Perkakas', pricePerDay: 250000, deposit: 750000, rating: 4.5, description: 'Mesin molen beton kapasitas 350 liter untuk kebutuhan proyek cor. Kondisi terawat.' },
  { name: 'Sewa Jack Hammer & Bor Beton', slug: 'sewa-jack-hammer-bor-beton', cat: 'Perkakas', pricePerDay: 300000, deposit: 1000000, rating: 4.4, description: 'Jack hammer dan bor beton untuk pengerjaan demolisi & konstruksi. Termasuk aksesoris.' },
  { name: 'Sewa Meja Rapat & Kursi Kantor', slug: 'sewa-meja-rapat-kursi-kantor', cat: 'Event', pricePerDay: 100000, deposit: 300000, rating: 4.5, description: 'Peralatan meeting: meja rapat, kursi, dan flipchart untuk acara seminar & pelatihan.' },
];

async function main() {
  console.log('🌱 Seeding kategori jasa + 20 jasa + 20 sewa...');

  const { categories, services: servicesTable, rentalItems } = schema;

  // 1) Upsert kategori jasa (by slug)
  for (const cat of JASA_CATEGORIES) {
    await db
      .insert(categories)
      .values({ id: genId('cat'), name: cat.name, slug: cat.slug, icon: cat.icon })
      .onConflictDoUpdate({ target: categories.slug, set: { name: cat.name, icon: cat.icon } });
  }
  console.log(`✓ ${JASA_CATEGORIES.length} kategori jasa siap`);

  // 2) Map nama kategori -> id
  const cats = await db.select().from(categories);
  const catByName = new Map(cats.map((c) => [c.name, c.id]));

  // 3) Upsert jasa (by slug)
  let created = 0;
  let updated = 0;
  for (let i = 0; i < services.length; i++) {
    const s = services[i];
    const categoryId = catByName.get(s.categoryName) ?? null;
    const existing = await db.select({ id: servicesTable.id }).from(servicesTable).where(eq(servicesTable.slug, s.slug));

    const data: any = {
      categoryId,
      name: s.name,
      description: s.description,
      priceFrom: String(s.priceFrom),
      unit: s.unit,
      images: imgs(i),
      isActive: true,
      rating: s.rating,
    };

    if (existing.length) {
      await db.update(servicesTable).set(data).where(eq(servicesTable.id, existing[0].id));
      updated++;
    } else {
      await db.insert(servicesTable).values({ id: genId('svc'), slug: s.slug, ...data });
      created++;
    }
  }
  console.log(`✓ ${created} jasa dibuat, ${updated} jasa diperbarui (total ${services.length}).`);

  // 4) Upsert sewa (rental item, by slug)
  let rCreated = 0;
  let rUpdated = 0;
  for (let i = 0; i < rentals.length; i++) {
    const r = rentals[i];
    const existing = await db.select({ id: rentalItems.id }).from(rentalItems).where(eq(rentalItems.slug, r.slug));

    const data: any = {
      name: r.name,
      description: `[cat:${r.cat}] ${r.description}`,
      pricePerDay: String(r.pricePerDay),
      deposit: String(r.deposit),
      images: imgs(i + 5),
      isActive: true,
      rating: r.rating,
    };

    if (existing.length) {
      await db.update(rentalItems).set(data).where(eq(rentalItems.id, existing[0].id));
      rUpdated++;
    } else {
      await db.insert(rentalItems).values({ id: genId('ritem'), slug: r.slug, ...data });
      rCreated++;
    }
  }
  console.log(`✓ ${rCreated} sewa dibuat, ${rUpdated} sewa diperbarui (total ${rentals.length}).`);
}

main()
  .catch((e) => { console.error('✗ Gagal seeding:', e); process.exit(1); })
  .finally(closePool);