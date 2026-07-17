import { notFound } from "next/navigation";
import { fetchRentalItemBySlug } from "@/lib/rental-actions";
import SewaDetailClient from "./SewaDetailClient";
import type { Metadata } from "next";

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const item = await fetchRentalItemBySlug(slug);
  if (!item) return { title: "Item Sewa Tidak Ditemukan" };
  return {
    title: `${item.name} - Sewa`,
    description: item.description?.replace(/\[cat:[^\]]+\]\s*/, "").slice(0, 160) ?? "",
  };
}

export default async function SewaDetailPage({ params }: Props) {
  const { slug } = await params;
  const item = await fetchRentalItemBySlug(slug);
  if (!item) notFound();

  return <SewaDetailClient item={item} />;
}
