import { notFound } from "next/navigation";
import ProductDetailClient from "./ProductDetailClient";
import { fetchProductBySlug, formatRupiah } from "@/lib/api";
import { resolveImageUrl } from "@/lib/image-url";

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
  const badgeMatch = rawDescription.match(/\[badge:([A-Z0-9]+)\]/);
  const badge = badgeMatch ? badgeMatch[1] : null;
  const brandMatch = rawDescription.match(/\[brand:([^\]]+)\]/);
  const brandFromMarker = brandMatch ? brandMatch[1] : null;
  const skuMatch = rawDescription.match(/\[sku:([^\]]+)\]/);
  const skuFromMarker = skuMatch ? skuMatch[1] : null;
  // Hapus semua markers dari deskripsi yang ditampilkan
  let cleanDescription = rawDescription.replace(/(\[badge:[A-Z0-9]+\]|\[brand:[^\]]+\]|\[sku:[^\]]+\])+\s*/g, "");

  // Bersihkan inline styles dari copy-paste HTML (Shopee/Tokopedia/dll)
  cleanDescription = cleanDescription
    // Hapus semua atribut style="..."
    .replace(/\s*style="[^"]*"/gi, "")
    // Hapus atribut box-sizing dan caret-color yang tersisa
    .replace(/\s*(box-sizing|caret-color)\s*:\s*[^;"]+;?/gi, "")
    // Collapse 2+ <br> berturutan menjadi satu pemisah paragraf
    .replace(/(<br\s*\/?>[\s\n]*){2,}/gi, "</p><p>")
    // Ganti single <br> menjadi line break yang bersih
    .replace(/<br\s*\/?>/gi, "<br/>")
    // Hapus <span> kosong atau yang hanya wrapping tanpa atribut
    .replace(/<span\s*>(.*?)<\/span>/gi, "$1")
    // Hapus tag kosong yang tersisa
    .replace(/<(p|div|span)>\s*<\/\1>/gi, "")
    // Trim whitespace berlebihan
    .replace(/\n{3,}/g, "\n\n")
    .trim();

  // Pastikan array gambar aman
  const rawImages = Array.isArray(apiProduct.images) ? apiProduct.images : [];
  const gallery = rawImages.length > 0 ? rawImages.map(resolveImageUrl) : ["/placeholder.png"];
  const image = gallery[0];

  // Konversi ApiProduct ke format yang diharapkan ProductDetailClient
  const product = {
    id: apiProduct.id,
    slug: apiProduct.slug,
    title: apiProduct.name,
    category: apiProduct.category?.name ?? "Produk",
    brand: brandFromMarker ?? null,
    sku: skuFromMarker ?? null,
    badge,
    price: formatRupiah(apiProduct.price),
    installment: apiProduct.oldPrice
      ? `Harga normal: ${formatRupiah(apiProduct.oldPrice)}`
      : "Harga terbaik untuk kamu",
    stock: apiProduct.stock === 0 ? "Stok Habis" : `Stok Tersedia (${apiProduct.stock})`,
    image,
    gallery,
    description: cleanDescription || "Tidak ada deskripsi tersedia.",
    details: [
      `Dijual oleh: ${sellerName}`,
      "Lokasi: Indonesia",
      apiProduct.category ? `Kategori: ${apiProduct.category.name}` : null,
    ].filter(Boolean) as string[],
    specs: [
      ["Kategori", apiProduct.category?.name ?? "-"],
      ["Stok", String(apiProduct.stock)],
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
