import { getHeroData } from "@/lib/hero-store";
import HeroEditor from "./HeroEditor";

export const metadata = {
  title: "Edit Hero Banner - Admin",
};

export default function AdminHeroPage() {
  const heroData = getHeroData();
  return <HeroEditor initial={heroData} />;
}
