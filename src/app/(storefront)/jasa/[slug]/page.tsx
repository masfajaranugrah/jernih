import { notFound } from "next/navigation";
import Link from "next/link";
import { fetchServiceBySlug } from "@/lib/service-actions";
import JasaDetailClient from "./JasaDetailClient";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const service = await fetchServiceBySlug(slug);
  return {
    title: service ? `${service.name} | Jernih Creatife` : "Jasa Tidak Ditemukan",
    description: service?.description ?? "",
  };
}

export default async function JasaDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const service = await fetchServiceBySlug(slug);

  if (!service) notFound();

  return <JasaDetailClient service={service} />;
}
