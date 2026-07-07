import Link from "next/link";
import DashboardSidebar from "@/app/dashboard-admin/DashboardSidebar";

export const metadata = {
  title: "Admin Dashboard - Jernih Creatife",
};

const menuItems = [
  {
    href: "/dashboard-admin/admin/hero",
    icon: "image",
    label: "Hero Banner",
    desc: "Edit konten hero utama & 3 banner promo",
    color: "bg-[#064e3b]/10 text-[#064e3b]",
  },
  {
    href: "/dashboard-admin/admin/products",
    icon: "inventory_2",
    label: "Produk",
    desc: "Kelola daftar produk & harga",
    color: "bg-[#0a3d62]/10 text-[#0a3d62]",
  },
  {
    href: "/dashboard-admin/admin/promo",
    icon: "local_offer",
    label: "Promo",
    desc: "Atur kartu promo di halaman utama",
    color: "bg-[#2c1938]/10 text-[#2c1938]",
  },
  {
    href: "/dashboard-admin/admin/services",
    icon: "design_services",
    label: "Jasa",
    desc: "Kelola daftar jasa & paket layanan",
    color: "bg-[#064e3b]/10 text-[#064e3b]",
  },
  {
    href: "#",
    icon: "shopping_bag",
    label: "Pesanan",
    desc: "Pantau & proses pesanan masuk",
    color: "bg-[#ba1a1a]/10 text-[#ba1a1a]",
  },
];

export default function AdminPage() {
  return (
    <div className="min-h-screen bg-[#f8f9fa] text-[#191c1d] antialiased">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@24,400,0,0&display=block');
        .material-symbols-outlined { font-variation-settings:'FILL' 0,'wght' 400,'GRAD' 0,'opsz' 24; vertical-align:middle; }
      `}</style>

      <DashboardSidebar />

      <main className="lg:ml-64 min-h-screen flex flex-col pb-24 lg:pb-0">
        {/* Top bar */}
        <header className="w-full h-16 sticky top-0 bg-[#f8f9fa]/90 backdrop-blur-md shadow-sm z-40 flex items-center justify-between px-6">
          <div className="flex items-center gap-3">
            <span className="material-symbols-outlined text-[#003527]">admin_panel_settings</span>
            <h1 className="text-[#003527] font-bold text-lg">Admin Dashboard</h1>
          </div>
          <Link
            href="/"
            target="_blank"
            className="flex items-center gap-2 text-sm text-[#707974] hover:text-[#003527] transition-colors"
          >
            <span className="material-symbols-outlined text-base">open_in_new</span>
            Lihat Toko
          </Link>
        </header>

        {/* Content */}
        <section className="p-6 max-w-4xl">
          <div className="mb-10">
            <h2 className="text-[#191c1d] font-semibold text-3xl tracking-tight mb-2">
              Selamat datang, Admin 👋
            </h2>
            <p className="text-[#707974] text-base">
              Pilih menu di bawah untuk mengelola konten toko.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            {menuItems.map((item) => (
              <Link
                key={item.label}
                href={item.href}
                className="bg-white border border-[#e1e3e4] rounded-xl p-6 flex items-start gap-5 hover:border-[#003527] hover:shadow-md transition-all group"
              >
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${item.color}`}>
                  <span className="material-symbols-outlined text-2xl">{item.icon}</span>
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-lg text-[#191c1d] group-hover:text-[#003527] transition-colors">
                    {item.label}
                  </h3>
                  <p className="text-[#707974] text-sm mt-1">{item.desc}</p>
                </div>
                <span className="material-symbols-outlined text-[#bfc9c3] group-hover:text-[#003527] self-center transition-colors">
                  chevron_right
                </span>
              </Link>
            ))}
          </div>

          {/* Shortcut cepat */}
          <div className="mt-8">
            <h3 className="text-sm font-semibold text-[#707974] uppercase tracking-widest mb-4">Aksi Cepat</h3>
            <div className="flex flex-wrap gap-3">
              <Link
                href="/dashboard-admin/admin/products/new"
                className="flex items-center gap-2 rounded-xl bg-[#064e3b] px-5 py-3 text-sm font-semibold text-white shadow-sm hover:-translate-y-0.5 hover:bg-[#043b2d] transition-all"
              >
                <span className="material-symbols-outlined text-base">add</span>
                Tambah Produk
              </Link>
              <Link
                href="/dashboard-admin/admin/products"
                className="flex items-center gap-2 rounded-xl border border-[#e1e3e4] bg-white px-5 py-3 text-sm font-semibold text-[#191c1d] hover:border-[#003527] hover:text-[#003527] transition-all"
              >
                <span className="material-symbols-outlined text-base">inventory_2</span>
                Lihat Semua Produk
              </Link>
              <Link
                href="/dashboard-admin/admin/services/new"
                className="flex items-center gap-2 rounded-xl bg-[#064e3b] px-5 py-3 text-sm font-semibold text-white shadow-sm hover:-translate-y-0.5 hover:bg-[#043b2d] transition-all"
              >
                <span className="material-symbols-outlined text-base">add</span>
                Tambah Jasa
              </Link>
              <Link
                href="/dashboard-admin/admin/services"
                className="flex items-center gap-2 rounded-xl border border-[#e1e3e4] bg-white px-5 py-3 text-sm font-semibold text-[#191c1d] hover:border-[#003527] hover:text-[#003527] transition-all"
              >
                <span className="material-symbols-outlined text-base">design_services</span>
                Lihat Semua Jasa
              </Link>
              <Link
                href="/dashboard-admin/admin/promo"
                className="flex items-center gap-2 rounded-xl border border-[#e1e3e4] bg-white px-5 py-3 text-sm font-semibold text-[#191c1d] hover:border-[#003527] hover:text-[#003527] transition-all"
              >
                <span className="material-symbols-outlined text-base">local_offer</span>
                Edit Promo
              </Link>
              <Link
                href="/"
                target="_blank"
                className="flex items-center gap-2 rounded-xl border border-[#e1e3e4] bg-white px-5 py-3 text-sm font-semibold text-[#191c1d] hover:border-[#003527] hover:text-[#003527] transition-all"
              >
                <span className="material-symbols-outlined text-base">storefront</span>
                Lihat Toko
              </Link>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
