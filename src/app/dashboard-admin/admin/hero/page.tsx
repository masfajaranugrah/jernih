import { getHeroDataFromBackend } from "@/lib/hero-store";
import HeroEditor from "./HeroEditor";

export const metadata = {
  title: "Edit Hero Banner - Admin",
};

export default async function AdminHeroPage() {
  // Fetch dari backend database — data tersimpan permanen
  const heroData = await getHeroDataFromBackend();
  return <HeroEditor initial={heroData} />;
}
