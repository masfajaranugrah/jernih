import BantuanContent from "./BantuanContent";

export const metadata = {
  title: "Bantuan - Dashboard Pelanggan",
  description: "Hubungi kami via WhatsApp atau buat tiket kendala live chat.",
};

export default function BantuanPage() {
  return (
    <div>
      <div className="mb-5 flex items-center gap-4">
        <h1
          className="text-[#191c1d] font-semibold tracking-tight"
          style={{ fontSize: "30px", lineHeight: "1.2" }}
        >
          Bantuan
        </h1>
      </div>
      <BantuanContent />
    </div>
  );
}
