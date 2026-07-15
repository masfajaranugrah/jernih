import Link from "next/link";
import ThreeScene from "./ThreeScene";
import ScrollObserver from "./ScrollObserver";

export const metadata = {
  title: "Tentang Kami - Jernih Creative",
  description:
    "Jernih Creative adalah platform ekosistem kreatif terpercaya yang menghubungkan pelanggan, penjual, penyedia layanan, dan mitra.",
};

const heroImage =
  "https://lh3.googleusercontent.com/aida/AP1WRLuwt28TdsBFtd2WTVIi7lmRf_y0DoFIMfB2O2ROfeaeYIUnPGPhzpd8fYckXmmJHyHSZqGfOd3epLfEf9DDAhy7QeusseGhThjj2z4ExnLipSKtBdAXAPTUKACdwsJWLv6yC1SKFWULiQ31tcBEQdWEPoAIUPAMIsvdogFvI5Ckl9i7K8sY2aGKVjot4g1kpAbDcoqLniwCaMsp3tkmwzHpMnl7RGrU-ZTCovJ_yCnsq9eXkERa2K9fvAo";

const services = [
  {
    icon: "shopping_bag",
    title: "Produk Fisik & Digital",
    description:
      "Marketplace kurasi tinggi untuk aset digital, template, hingga karya fisik berkualitas dari kreator terpilih.",
    delay: "delay-100",
    offset: "md:mt-12",
  },
  {
    icon: "design_services",
    title: "Layanan Profesional",
    description:
      "Akses langsung ke talenta kreatif profesional untuk project desain, pengembangan, dan strategi brand Anda.",
    delay: "delay-200",
    offset: "",
  },
  {
    icon: "key",
    title: "Layanan Sewa",
    description:
      "Penyewaan perlengkapan produksi, studio, dan aset kreatif lainnya dengan proses yang aman dan transparan.",
    delay: "delay-300",
    offset: "md:mt-12",
  },
  {
    icon: "storefront",
    title: "Transaksi Mitra",
    description:
      "Fasilitas transaksi B2B terpercaya, mendukung kolaborasi skala besar dengan manajemen yang rapi dan terukur.",
    delay: "delay-400",
    offset: "",
  },
];

const commitments = [
  { icon: "shield", title: "Keamanan", description: "Perlindungan data dan transaksi di setiap lapisan.", delay: "delay-100", offset: "" },
  { icon: "verified_user", title: "Kepercayaan", description: "Sistem reputasi yang adil dan validasi terpusat.", delay: "delay-200", offset: "md:-mt-8" },
  { icon: "trending_up", title: "Pertumbuhan", description: "Fokus pada peningkatan skala bisnis seluruh pengguna.", delay: "delay-300", offset: "" },
  { icon: "visibility", title: "Transparansi", description: "Komunikasi terbuka tanpa biaya tersembunyi.", delay: "delay-400", offset: "md:-mt-8" },
  { icon: "lightbulb", title: "Inovasi", description: "Pembaruan fitur berkelanjutan untuk efisiensi.", delay: "delay-500", offset: "" },
];

const partnerBenefits = [
  "Proses onboarding yang jelas dan terstruktur.",
  "Dukungan visibilitas di pasar yang relevan.",
  "Sistem pembayaran yang aman dan tepat waktu.",
];

function MaterialIcon({ children, className = "" }: { children: string; className?: string }) {
  return (
    <span className={`material-symbols-outlined ${className}`} style={{ fontVariationSettings: "'FILL' 0, 'wght' 500" }}>
      {children}
    </span>
  );
}

export default function TentangPage() {
  return (
    <main className="bg-[#f7f9fb] text-[#191c1e] antialiased selection:bg-[#1e3a8a] selection:text-white">
      <ScrollObserver />
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&family=Plus+Jakarta+Sans:wght@600;700;800;900&display=swap');
        @import url('https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=block');
        .material-symbols-outlined { vertical-align: middle; }
        .animate-on-scroll {
          opacity: 0;
          transform: translateY(40px);
          transition: opacity 1s cubic-bezier(0.16, 1, 0.3, 1), transform 1s cubic-bezier(0.16, 1, 0.3, 1);
        }
        .animate-on-scroll.is-visible { opacity: 1; transform: translateY(0); }
        .fade-in { opacity: 0; transition: opacity 1.2s ease-out; }
        .fade-in.is-visible { opacity: 1; }
        .slide-left {
          opacity: 0; transform: translateX(40px);
          transition: opacity 1s cubic-bezier(0.16, 1, 0.3, 1), transform 1s cubic-bezier(0.16, 1, 0.3, 1);
        }
        .slide-left.is-visible { opacity: 1; transform: translateX(0); }
        .slide-right {
          opacity: 0; transform: translateX(-40px);
          transition: opacity 1s cubic-bezier(0.16, 1, 0.3, 1), transform 1s cubic-bezier(0.16, 1, 0.3, 1);
        }
        .slide-right.is-visible { opacity: 1; transform: translateX(0); }
        .delay-100 { transition-delay: 100ms; }
        .delay-200 { transition-delay: 200ms; }
        .delay-300 { transition-delay: 300ms; }
        .delay-400 { transition-delay: 400ms; }
        .delay-500 { transition-delay: 500ms; }
        .hover-lift {
          transition: transform 0.4s cubic-bezier(0.16, 1, 0.3, 1), box-shadow 0.4s cubic-bezier(0.16, 1, 0.3, 1), border-color 0.4s ease;
        }
        .hover-lift:hover {
          transform: translateY(-8px);
          box-shadow: 0 20px 40px -10px rgba(1, 53, 39, 0.15), 0 10px 20px -5px rgba(0, 0, 0, 0.05);
          border-color: rgba(1, 53, 39, 0.3);
        }
      `}</style>

      {/* 1. Hero Section */}
      <section className="relative flex min-h-[90vh] w-full items-center overflow-hidden border-b border-[#c3c5d9]/20 bg-[#2d3133]">
        <div className="absolute inset-0 z-0">
          <img alt="Jernih Creative Team" className="h-full w-full object-cover opacity-60 mix-blend-overlay" src={heroImage} />
          <div className="absolute inset-0 bg-gradient-to-r from-[#2d3133] via-[#2d3133]/80 to-transparent" />
        </div>
        <ThreeScene />
        <div className="relative z-10 mx-auto w-full max-w-[1280px] px-4 py-24 md:px-6 lg:py-[120px]">
          <div className="animate-on-scroll w-full lg:w-2/3">
            <span className="mb-6 inline-block rounded-full border border-[#1e3a8a]/30 bg-[#1e3a8a]/20 px-4 py-2 text-[14px] font-bold uppercase tracking-widest text-[#c7d2fe] shadow-lg backdrop-blur-md">
              Ekosistem Kreatif
            </span>
            <h1 className="mb-6 font-['Plus_Jakarta_Sans'] text-6xl font-black leading-[1.05] tracking-tighter text-white md:text-8xl lg:text-[110px]">
              Tentang <br />
              <span className="text-[#c7d2fe]">Kami</span>
            </h1>
            <p className="max-w-2xl font-['Inter'] text-xl font-light leading-relaxed text-[#eff1f3] drop-shadow-md md:text-2xl">
              Jernih Creative adalah platform ekosistem kreatif terpercaya yang menghubungkan pelanggan, penjual, penyedia layanan, dan mitra dalam satu lingkungan yang transparan dan profesional. Kami hadir untuk memastikan setiap karya kreatif mendapatkan tempat terbaiknya.
            </p>
          </div>
        </div>
      </section>

      {/* 2. Services Section */}
      <section className="relative mx-auto max-w-[1280px] px-4 py-24 md:px-6 lg:py-32">
        <div className="absolute right-0 top-0 -z-10 h-full w-1/3 rounded-l-full bg-gradient-to-l from-[#f2f4f6] to-transparent opacity-50" />
        <div className="grid grid-cols-1 items-start gap-16 lg:grid-cols-12">
          <div className="animate-on-scroll lg:sticky lg:top-32 lg:col-span-5">
            <h2 className="mb-4 font-['Plus_Jakarta_Sans'] text-4xl font-extrabold leading-tight tracking-tight text-[#191c1e] md:text-5xl">
              Apa yang Kami Sediakan
            </h2>
            <p className="mb-10 font-['Inter'] text-xl font-light text-[#434656]">
              Solusi komprehensif untuk setiap kebutuhan kreatif Anda.
            </p>
            <div className="h-1 w-24 rounded-full bg-[#1e3a8a]" />
          </div>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:col-span-7">
            {services.map((service) => (
              <div
                key={service.title}
                className={`animate-on-scroll ${service.delay} rounded-3xl border border-[#c3c5d9]/30 bg-white p-10 shadow-lg shadow-[#1e3a8a]/5 hover-lift ${service.offset}`}
              >
                <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-[#1e3a8a]/10 text-[#1e3a8a]">
                  <MaterialIcon className="text-3xl">{service.icon}</MaterialIcon>
                </div>
                <h3 className="mb-2 text-2xl font-bold text-[#191c1e]">{service.title}</h3>
                <p className="font-['Inter'] leading-relaxed text-[#434656]">{service.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 3. Partnership Section */}
      <section className="w-full overflow-hidden bg-white px-4 py-24 md:px-6 lg:py-32">
        <div className="mx-auto flex max-w-[1280px] flex-col items-center gap-20 lg:flex-row">
          <div className="animate-on-scroll relative w-full lg:w-1/2">
            <div className="absolute inset-0 -z-10 translate-x-4 translate-y-4 rounded-[40px] bg-[#1e3a8a]/10" />
            <img
              alt="Ruang kerja kolaboratif"
              className="aspect-[4/5] h-auto w-full rounded-[40px] object-cover object-center shadow-2xl"
              src={heroImage}
            />
            <div className="animate-on-scroll delay-300 absolute -bottom-8 -right-8 hidden rounded-3xl border border-[#c3c5d9]/20 bg-white p-6 shadow-xl md:block">
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#1e3a8a]/10 text-[#1e3a8a]">
                  <MaterialIcon>handshake</MaterialIcon>
                </div>
                <div>
                  <p className="text-lg font-bold">Kolaborasi</p>
                  <p className="text-sm text-[#434656]">Tumbuh Bersama</p>
                </div>
              </div>
            </div>
          </div>
          <div className="slide-left delay-200 w-full lg:w-1/2">
            <div className="lg:pl-10">
              <span className="mb-6 inline-block rounded-full border border-[#1e3a8a]/20 bg-[#1e3a8a]/10 px-4 py-2 text-[14px] font-bold uppercase tracking-widest text-[#1e3a8a]">
                Peluang Tumbuh
              </span>
              <h2 className="mb-6 font-['Plus_Jakarta_Sans'] text-4xl font-extrabold leading-tight tracking-tight text-[#191c1e] md:text-5xl">
                Menjadi Mitra Jernih Creative
              </h2>
              <p className="mb-16 font-['Inter'] text-xl font-light leading-relaxed text-[#434656]">
                Kami membuka pintu lebar bagi individu berbakat, UKM kreatif, hingga perusahaan besar untuk bergabung dan tumbuh bersama dalam ekosistem kami. Jernih Creative didesain untuk menjunjung tinggi profesionalisme, memastikan setiap kemitraan membawa manfaat timbal balik yang maksimal.
              </p>
              <ul className="flex flex-col gap-6">
                {partnerBenefits.map((benefit) => (
                  <li key={benefit} className="group flex items-start gap-4">
                    <div className="mt-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#1e3a8a]/10 text-[#1e3a8a] transition-colors duration-300 group-hover:bg-[#1e3a8a] group-hover:text-white">
                      <MaterialIcon className="text-[20px]">check</MaterialIcon>
                    </div>
                    <span className="text-lg font-medium leading-relaxed text-[#191c1e] transition-colors group-hover:text-[#1e3a8a]">
                      {benefit}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* 4. Commitment Section */}
      <section className="relative mx-auto max-w-[1280px] px-4 py-24 md:px-6 lg:py-32">
        <div className="absolute left-0 top-1/2 -z-10 h-px w-full bg-gradient-to-r from-transparent via-[#c3c5d9]/30 to-transparent" />
        <div className="animate-on-scroll mx-auto mb-16 max-w-3xl text-center">
          <h2 className="mb-6 font-['Plus_Jakarta_Sans'] text-4xl font-extrabold tracking-tight text-[#191c1e] md:text-5xl">
            Komitmen Kami
          </h2>
          <p className="font-['Inter'] text-xl font-light text-[#434656]">
            Fondasi dari setiap interaksi di platform Jernih Creative.
          </p>
        </div>
        <div className="grid grid-cols-1 gap-6 pb-10 md:grid-cols-2 lg:grid-cols-5">
          {commitments.map((item) => (
            <div
              key={item.title}
              className={`animate-on-scroll ${item.delay} group flex flex-col items-center rounded-[32px] border border-[#c3c5d9]/20 bg-white p-10 text-center shadow-lg shadow-[#1e3a8a]/5 hover-lift ${item.offset}`}
            >
              <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-2xl bg-[#1e3a8a]/5 text-[#1e3a8a] transition-all duration-500 group-hover:rotate-12 group-hover:bg-[#1e3a8a] group-hover:text-white">
                <MaterialIcon className="text-4xl">{item.icon}</MaterialIcon>
              </div>
              <h4 className="mb-2 text-xl font-bold text-[#191c1e]">{item.title}</h4>
              <p className="text-sm leading-relaxed text-[#434656]">{item.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* 5. Ecosystem/Closing Section */}
      <section className="mx-auto mb-16 max-w-[1280px] px-4 py-24 text-center md:px-6">
        <div className="animate-on-scroll relative overflow-hidden rounded-[40px] p-10 shadow-2xl md:p-[100px]" style={{ backgroundColor: "#2d3133" }}>
          <div className="absolute inset-0 z-0" style={{ background: "linear-gradient(135deg, #1e3a8a, rgba(30, 58, 138, 0.8), #1e3a8a)", opacity: 0.95 }} />
          <div className="absolute right-0 top-0 h-[500px] w-[500px] -translate-y-1/2 translate-x-1/3 rounded-full bg-[#a5b4fc]/20 blur-[120px]" />
          <div className="absolute bottom-0 left-0 h-[600px] w-[600px] translate-y-1/3 -translate-x-1/4 rounded-full bg-[#a5b4fc]/10 blur-[150px]" />
          <div className="absolute inset-0 opacity-10 mix-blend-overlay" style={{ backgroundImage: "url('https://www.transparenttextures.com/patterns/cubes.png')" }} />
          <div className="relative z-10 mx-auto max-w-4xl">
            <span className="mb-6 inline-block rounded-full border border-white/20 bg-white/10 px-4 py-1 text-sm font-semibold uppercase tracking-[0.2em] text-white backdrop-blur-md">
              Masa Depan Kreatif
            </span>
            <h2 className="mb-10 font-['Plus_Jakarta_Sans'] text-4xl font-black leading-[1.1] tracking-tighter text-white md:text-6xl lg:text-7xl">
              Bersama Membangun <br />
              Ekosistem yang Lebih Baik
            </h2>
            <p className="mx-auto mb-16 max-w-3xl text-lg font-light leading-[1.8] text-white/80 md:text-xl">
              Jernih Creative bukan sekadar platform; ini adalah komunitas yang didorong oleh kolaborasi dan dedikasi terhadap kualitas. Mari ciptakan karya hebat bersama kami.
            </p>
            <div className="flex flex-col justify-center gap-4 sm:flex-row">
              <Link
                href="/register-mitra"
                className="inline-flex items-center justify-center rounded-full bg-white px-10 py-6 text-lg font-bold text-[#1e3a8a] shadow-xl transition-all duration-300 hover:-translate-y-1 hover:scale-[1.02]"
              >
                Mulai Perjalanan Anda
                <MaterialIcon className="ml-2 transition-transform group-hover:translate-x-1">arrow_forward</MaterialIcon>
              </Link>
              <Link
                href="/register-mitra"
                className="inline-flex items-center justify-center rounded-full border border-white/30 bg-transparent px-10 py-6 text-lg font-bold text-white transition-all duration-300 hover:bg-white/10"
              >
                Pelajari Kemitraan
              </Link>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
