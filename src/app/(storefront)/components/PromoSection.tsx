import { getPromoCardsFromBackend } from "@/lib/promo-actions";
import PromoSectionClient from "./PromoSectionClient";

export default async function PromoSection() {
  let promoCards;
  try {
    promoCards = await getPromoCardsFromBackend();
  } catch {
    return null;
  }

  if (!promoCards || promoCards.length === 0) return null;

  return (
    <section>
      <h2 className="text-center text-3xl font-semibold tracking-tight text-[#191c1d]">
        Promo Spesial Untuk Anda
      </h2>
      {/* Slider carousel — geser di semua ukuran layar, auto-play + tombol panah */}
      <PromoSectionClient promoCards={promoCards} />
    </section>
  );
}
