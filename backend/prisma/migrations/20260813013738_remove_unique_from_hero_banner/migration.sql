-- DropIndex
DROP INDEX "hero_banners_position_key";

-- CreateIndex
CREATE INDEX "hero_banners_position_idx" ON "hero_banners"("position");
