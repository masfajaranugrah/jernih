"use server";

import { revalidatePath } from "next/cache";
import {
  updateHeroMain,
  updateHeroBanner,
  resetHeroData,
  type HeroMain,
  type HeroBanner,
} from "@/lib/hero-store";

export async function saveHeroMain(data: Partial<HeroMain>) {
  updateHeroMain(data);
  revalidatePath("/");
}

export async function saveHeroBanner(index: 0 | 1 | 2, data: Partial<HeroBanner>) {
  updateHeroBanner(index, data);
  revalidatePath("/");
}

export async function resetHero() {
  resetHeroData();
  revalidatePath("/");
}
