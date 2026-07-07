import { notFound } from "next/navigation";
import ProductDetailClient from "./ProductDetailClient";
import { fetchProductBySlug, formatRupiah } from "@/lib/api";

export default async function ProductDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;

  // Coba fetch dari backend API dulu
  const apiProduct = await fetchProductBySlug(slug);

  if (!apiProduct) {
    notFound();
  }

  // Nama seller default — override ke brand sendiri
  const sellerName = "Jernih Creative Official";

  // Konversi ApiProduct ke format yang diharapkan ProductDetailClient
  const product = {
    title: apiProduct.name,
    category: apiProduct.category?.name ?? "Produk",
    price: formatRupiah(apiProduct.price),
    installment: apiProduct.oldPrice
      ? `Harga normal: ${formatRupiah(apiProduct.oldPrice)}`
      : "Harga terbaik untuk kamu",
    stock: apiProduct.stock === 0 ? "Stok Habis" : `Stok Tersedia (${apiProduct.stock})`,
    image: apiProduct.images[0] ?? "/placeholder.png",
    gallery: apiProduct.images.length > 0 ? apiProduct.images : ["/placeholder.png"],
    description: apiProduct.description ?? "Tidak ada deskripsi tersedia.",
    details: [
      `Dijual oleh: ${sellerName}`,
      apiProduct.mitra?.city ? `Lokasi: ${apiProduct.mitra.city}` : "Lokasi: Indonesia",
      apiProduct.category ? `Kategori: ${apiProduct.category.name}` : null,
      `Terjual: ${apiProduct.totalSold} item`,
      `Rating: ${apiProduct.rating}/5`,
    ].filter(Boolean) as string[],
    specs: [
      ["Kategori", apiProduct.category?.name ?? "-"],
      ["Stok", String(apiProduct.stock)],
      ["Rating", String(apiProduct.rating)],
      ["Total Terjual", String(apiProduct.totalSold)],
      ["Dijual oleh", sellerName],
    ],
  };

  return <ProductDetailClient product={product} />;
}
