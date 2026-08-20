import type { Metadata } from "next";
import { fetchPromos } from "@/lib/api";
import PromoPageClient from "./PromoPageClient";

export const metadata: Metadata = {
  title: "Promo & Diskon | Jernih Creatife",
  description: "Temukan promo terbaik, diskon hingga 50%, dan penawaran spesial untuk produk pilihan.",
};

export default async function PromoPage() {
  const [active, upcoming, expired] = await Promise.all([
    fetchPromos({ status: "active", limit: 100, noCache: true }),
    fetchPromos({ status: "scheduled", limit: 100, noCache: true }),
    fetchPromos({ status: "expired", limit: 100, noCache: true }),
  ]);

  return <PromoPageClient active={active} upcoming={upcoming} expired={expired} />;
}