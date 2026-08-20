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

  // Deskripsi bisa diawali marker [badge:XXX] atau ||SPECS_START|| dari dashboard
  const rawDescription = apiProduct.description ?? "";
  const badgeMatch = rawDescription.match(/\[badge:([A-Z0-9]+)\]/);
  const badge = badgeMatch ? badgeMatch[1] : null;
  const brandMatch = rawDescription.match(/\[brand:([^\]]+)\]/);
  const brandFromMarker = brandMatch ? brandMatch[1] : null;
  const skuMatch = rawDescription.match(/\[sku:([^\]]+)\]/);
  const skuFromMarker = skuMatch ? skuMatch[1] : null;

  // Parse structured specifications
  let structuredSpecs: Record<string, string> = {};
  const specsMatch = rawDescription.match(/\|\|SPECS_START\|\|([\s\S]*?)\|\|SPECS_END\|\|/);
  if (specsMatch) {
    try {
      structuredSpecs = JSON.parse(specsMatch[1]);
    } catch {
      structuredSpecs = {};
    }
  }

  // Hapus semua markers dari deskripsi yang ditampilkan
  let cleanDescription = rawDescription
    .replace(/(\[badge:[A-Z0-9]+\]|\[brand:[^\]]+\]|\[sku:[^\]]+\])+\s*/g, "")
    .replace(/\|\|SPECS_START\|\|[\s\S]*?\|\|SPECS_END\|\|/g, "");

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
    brand: brandFromMarker ?? structuredSpecs["Brand"] ?? null,
    sku: skuFromMarker ?? structuredSpecs["SKU"] ?? null,
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
    specs: structuredSpecs,
    types: (apiProduct.types ?? []).map((t) => ({
      id: t.id,
      name: t.name,
      price: formatRupiah(t.price),
      oldPrice: t.oldPrice ? formatRupiah(t.oldPrice) : null,
      stock: t.stock,
    })),
    reviews: (apiProduct.reviews ?? []).map((r) => ({
      id: r.id,
      rating: r.rating,
      comment: r.comment,
      userName: r.userName,
      userAvatar: r.userAvatar,
      image: r.image ?? null,
      createdAt: r.createdAt,
    })),
    promo:
      apiProduct.promo && apiProduct.promo.status === "active"
        ? {
            title: apiProduct.promo.title,
            promoPrice: apiProduct.promo.promoPrice,
            discountPercent: apiProduct.promo.discountPercent,
            endsAt: apiProduct.promo.endsAt,
            quotaLeft: apiProduct.promo.quotaLeft,
          }
        : null,
  };

  return <ProductDetailClient product={product} />;
}
