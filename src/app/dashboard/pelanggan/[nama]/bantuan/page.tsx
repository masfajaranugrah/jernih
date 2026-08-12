import Link from "next/link";
import BantuanContent from "./BantuanContent";

export const metadata = {
  title: "Bantuan - Dashboard Pelanggan",
  description: "Hubungi kami via WhatsApp atau buat tiket kendala live chat.",
};

export default async function BantuanPage({
  params,
}: {
  params: Promise<{ nama: string }>;
}) {
  const { nama } = await params;
  return (
    <div>
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
        <h1
          className="text-[#191c1d] font-semibold tracking-tight text-2xl md:text-[30px]"
          style={{ lineHeight: "1.2" }}
        >
          Bantuan
        </h1>
      </div>
      <BantuanContent />
    </div>
  );
}
