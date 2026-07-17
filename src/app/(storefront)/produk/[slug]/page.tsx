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

  // Deskripsi bisa diawali marker [badge:XXX] dari dashboard — pisahkan jadi badge & teks bersih
  const rawDescription = apiProduct.description ?? "";
  const badgeMatch = rawDescription.match(/^\[badge:([A-Z0-9]+)\]\s*/);
  const badge = badgeMatch ? badgeMatch[1] : null;
  const cleanDescription = rawDescription.replace(/^\[badge:[A-Z0-9]+\]\s*/, "");

  // Konversi ApiProduct ke format yang diharapkan ProductDetailClient
  const product = {
    id: apiProduct.id,
    slug: apiProduct.slug,
    title: apiProduct.name,
    category: apiProduct.category?.name ?? "Produk",
    badge,
    price: formatRupiah(apiProduct.price),
    installment: apiProduct.oldPrice
      ? `Harga normal: ${formatRupiah(apiProduct.oldPrice)}`
      : "Harga terbaik untuk kamu",
    stock: apiProduct.stock === 0 ? "Stok Habis" : `Stok Tersedia (${apiProduct.stock})`,
    image: apiProduct.images[0] ?? "/placeholder.png",
    gallery: apiProduct.images.length > 0 ? apiProduct.images : ["/placeholder.png"],
    description: cleanDescription || "Tidak ada deskripsi tersedia.",
    details: [
      `Dijual oleh: ${sellerName}`,
      "Lokasi: Indonesia",
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
    types: (apiProduct.types ?? []).map((t) => ({
      id: t.id,
      name: t.name,
      price: formatRupiah(t.price),
      oldPrice: t.oldPrice ? formatRupiah(t.oldPrice) : null,
      stock: t.stock,
    })),
  };

  return <ProductDetailClient product={product} />;
}
