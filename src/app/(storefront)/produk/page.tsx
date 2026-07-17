import { fetchProducts } from "@/lib/api";
import ProdukPageClient from "./ProdukPageClient";

export const metadata = {
  title: "Koleksi Produk Pilihan - Jernih Creatife",
  description: "Temukan koleksi produk pilihan terbaik di Jernih Creatife.",
};

interface PageProps {
  searchParams: Promise<{ search?: string; categoryId?: string }>;
}

export default async function ProdukPage({ searchParams }: PageProps) {
  const resolvedSearchParams = await searchParams;
  const searchVal = resolvedSearchParams?.search || "";
  const categoryIdVal = resolvedSearchParams?.categoryId || "";

  const products = await fetchProducts({
    search: searchVal,
    categoryId: categoryIdVal,
    limit: 50,
    light: true,
  });

  // Ambil kategori unik dari produk
  const categories = Array.from(
    new Set(products.map((p) => p.category?.name).filter(Boolean) as string[])
  ).sort();

  return (
    <ProdukPageClient
      products={products}
      categories={categories}
      resolvedSearch={searchVal}
    />
  );
}
