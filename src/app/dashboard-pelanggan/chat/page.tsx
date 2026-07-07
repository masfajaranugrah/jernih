import SidebarPelanggan from "../Sidebar";
import ChatContent from "./ChatContent";

export const metadata = {
  title: "Chat - Dashboard Pelanggan",
  description: "Hubungi support atau seller langsung dari dashboard.",
};

export default function ChatPage() {
  return (
    <div className="bg-[#f8f9fa] text-[#191c1d] min-h-screen antialiased flex">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@24,400,0,0&display=block');
        .material-symbols-outlined { font-variation-settings:'FILL' 0,'wght' 400,'GRAD' 0,'opsz' 24; }
      `}</style>
      <SidebarPelanggan />
      <main className="flex-1 md:ml-64 p-6 md:p-8 flex flex-col overflow-hidden">
        <div className="mb-5 flex items-center gap-4">
          <h1 className="text-[#191c1d] font-semibold tracking-tight"
            style={{ fontSize: "30px", lineHeight: "1.2" }}>
            Chat
          </h1>
          <span className="bg-[#003527]/10 text-[#003527] px-3 py-1 rounded-full text-xs font-semibold">
            3 Pesan Baru
          </span>
        </div>
        <ChatContent />
      </main>
    </div>
  );
}
