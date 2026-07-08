import { fetchServices } from "@/lib/service-actions";
import JasaPageClient from "./JasaPageClient";

export const metadata = {
  title: "Layanan Profesional - Jernih Creatife",
  description: "Temukan layanan profesional terbaik di Jernih Creatife.",
};

interface PageProps {
  searchParams: Promise<{ search?: string }>;
}

export default async function JasaPage({ searchParams }: PageProps) {
  const { search } = await searchParams;
  const resolvedSearch = search ?? "";

  const services = await fetchServices({ search: resolvedSearch });

  // Ambil kategori unik dari data yang sudah di-fetch di server
  const categories = Array.from(
    new Set(services.map((s) => s.category?.name).filter(Boolean) as string[])
  ).sort();

  return (
    <JasaPageClient
      services={services}
      categories={categories}
      resolvedSearch={resolvedSearch}
    />
  );
}
