import Image from "next/image";
import Link from "next/link";
import { getPromoCardsFromBackend } from "@/lib/promo-actions";

export default async function PromoSection() {
  let promoCards;
  try {
    promoCards = await getPromoCardsFromBackend();
  } catch {
    return null;
  }

  if (promoCards.length === 0) return null;

  return (
    <section>
      <h2 className="text-center text-3xl font-semibold tracking-tight text-[#191c1d]">
        Promo Spesial Untuk Anda
      </h2>
      <div className="scrollbar-hide -mx-4 mt-6 flex snap-x snap-mandatory gap-4 overflow-x-auto px-4 pb-2 md:mx-0 md:grid md:grid-cols-3 md:gap-5 md:overflow-visible md:px-0 md:pb-0">
        {promoCards.map((promo) => (
          <Link
            href={promo.linkHref ?? "/produk"}
            key={promo.id}
            className="group relative aspect-[3/4] w-[70vw] max-w-[280px] shrink-0 snap-center overflow-hidden rounded-3xl bg-white shadow-lg shadow-black/5 sm:w-[38vw] md:w-auto md:max-w-none md:shrink"
          >
            <Image
              src={promo.image}
              alt={promo.title}
              fill
              sizes="(min-width: 768px) 33vw, 70vw"
              className="object-cover transition-transform duration-700 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-transparent" />
            <div className="absolute left-3 top-3 rounded-full bg-[#575e70] px-2.5 py-0.5 text-xs font-bold text-white">
              PROMO
            </div>
            {promo.category && (
              <div className="absolute right-3 top-3 rounded-full bg-white px-2.5 py-0.5 text-xs font-bold text-[#191c1d]">
                {promo.category}
              </div>
            )}
            <div className="absolute inset-x-3 bottom-3 text-white">
              <h3 className="text-xs font-bold">{promo.title}</h3>
              <p className="mt-1 text-xl font-black text-[#b0f0d6]">{promo.price}</p>
              <span className="mt-3 block rounded-xl bg-white py-1.5 text-center text-xs font-bold text-[#191c1d]">
                Lihat Detail
              </span>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
