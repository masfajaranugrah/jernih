import Link from "next/link";
import ChatContent from "./ChatContent";

export const metadata = {
  title: "Chat - Dashboard Pelanggan",
  description: "Hubungi support atau seller langsung dari dashboard.",
};

export default async function ChatPage({
  params,
}: {
  params: Promise<{ nama: string }>;
}) {
  const { nama } = await params;
  return (
    <div className="flex flex-col flex-1 min-h-0">
      <div className="mb-5 flex items-center gap-4">
        <div className="md:hidden">
          <Link
            href={`/dashboard/pelanggan/${nama}/profile`}
            aria-label="Kembali"
            className="flex h-10 w-10 items-center justify-center rounded-full bg-white text-[#191c1d] shadow-[0px_4px_20px_rgba(0,0,0,0.06)] border border-[#e1e3e4] transition-colors hover:bg-[#f3f4f5] active:scale-95"
          >
            <span className="material-symbols-outlined">arrow_back</span>
          </Link>
        </div>
        <h1 className="text-[#191c1d] font-semibold tracking-tight text-2xl md:text-[30px]"
          style={{ lineHeight: "1.2" }}>
          Chat
        </h1>
      </div>
      <div className="relative flex-1 min-h-0">
        <div className="absolute inset-0 flex flex-col">
          <ChatContent />
        </div>
      </div>
    </div>
  );
}
