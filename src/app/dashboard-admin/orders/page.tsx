import DashboardSidebar from "../DashboardSidebar";
import OrdersContent from "./OrdersContent";

export const metadata = {
  title: "Pesanan Saya - Jernih Creatife",
  description: "Pantau status pesanan dan riwayat belanja Anda.",
};

export default function OrdersPage() {
  return (
    <div className="min-h-screen bg-[#f8f9fa] text-[#191c1d] antialiased">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@24,400,0,0&display=block');
        .material-symbols-outlined { font-variation-settings:'FILL' 0,'wght' 400,'GRAD' 0,'opsz' 24; vertical-align:middle; }
      `}</style>

      <DashboardSidebar />

      <main className="lg:ml-64 min-h-screen flex flex-col pb-24 lg:pb-0">
        {/* TopBar */}
        <header className="w-full h-16 sticky top-0 bg-[#f8f9fa]/90 backdrop-blur-md shadow-sm z-40 flex items-center justify-between px-6">
          <div className="relative w-full max-w-md">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[#404944] text-xl">
              search
            </span>
            <input
              className="w-full pl-10 pr-4 py-2 bg-[#edeeef] border-none rounded-full focus:ring-2 focus:ring-[#064e3b] text-sm transition-all outline-none"
              placeholder="Cari pesanan..."
              type="text"
            />
          </div>
          <div className="flex items-center gap-5 ml-4">
            <button className="relative p-2 hover:text-[#003527] transition-colors">
              <span className="material-symbols-outlined">notifications</span>
              <span className="absolute top-1 right-1 w-2 h-2 bg-[#ba1a1a] rounded-full" />
            </button>
            <button className="p-2 hover:text-[#003527] transition-colors">
              <span className="material-symbols-outlined">shopping_cart</span>
            </button>
            <div className="flex items-center gap-2 cursor-pointer">
              <div className="w-8 h-8 rounded-full bg-[#064e3b] flex items-center justify-center text-white">
                <span className="material-symbols-outlined text-lg">account_circle</span>
              </div>
              <span className="text-sm font-semibold hidden sm:block">Alex Johnson</span>
            </div>
          </div>
        </header>

        {/* Content */}
        <section className="p-6 max-w-[1280px] mx-auto w-full">
          <div className="mb-8">
            <h2
              className="text-[#191c1d] font-semibold tracking-tight mb-1"
              style={{ fontSize: "36px", lineHeight: "1.2" }}
            >
              Pesanan Saya
            </h2>
            <p className="text-[#707974] text-base">
              Pantau status pesanan dan riwayat belanja Anda.
            </p>
          </div>

          <OrdersContent />
        </section>

        {/* Footer */}
        <footer className="mt-auto border-t border-[#bfc9c3] p-6 bg-[#f3f4f5]">
          <div className="max-w-[1280px] mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-xs text-[#404944]">© 2024 Jernih Creatife. All rights reserved.</p>
            <div className="flex gap-6">
              {["Syarat & Ketentuan", "Kebijakan Privasi", "Hubungi Kami"].map((item) => (
                <a
                  key={item}
                  href="#"
                  className="text-xs text-[#404944] hover:text-[#003527] transition-colors"
                >
                  {item}
                </a>
              ))}
            </div>
          </div>
        </footer>
      </main>

      {/* Support FAB */}
      <button
        className="fixed bottom-6 right-6 w-14 h-14 bg-[#003527] text-white rounded-full shadow-lg flex items-center justify-center hover:scale-110 active:scale-95 transition-all z-50"
        aria-label="Support"
      >
        <span className="material-symbols-outlined">support_agent</span>
      </button>
    </div>
  );
}
