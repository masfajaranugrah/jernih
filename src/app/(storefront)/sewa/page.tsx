import { fetchRentalItems } from "@/lib/rental-actions";
import SewaPageClient from "./SewaPageClient";

export const metadata = {
  title: "Katalog Sewa - Jernih Creatife",
  description: "Temukan item sewa terbaik di Jernih Creatife.",
};

interface PageProps {
  searchParams: Promise<{ search?: string }>;
}

export default async function SewaPage({ searchParams }: PageProps) {
  const { search } = await searchParams;
  const resolvedSearch = search ?? "";

  const items = await fetchRentalItems({ search: resolvedSearch });

  // Ambil kategori unik dari tag [cat:...] dalam deskripsi
  const categories = Array.from(
    new Set(
      items
        .map((item) => item.description?.match(/^\[cat:([^\]]+)\]/)?.[1])
        .filter(Boolean) as string[]
    )
  ).sort();

  return (
    <SewaPageClient
      items={items}
      categories={categories}
      resolvedSearch={resolvedSearch}
    />
  );
}
