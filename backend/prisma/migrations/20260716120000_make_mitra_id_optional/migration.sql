-- DropForeignKey
ALTER TABLE "services" DROP CONSTRAINT "services_mitraId_fkey";

-- AlterTable
ALTER TABLE "rental_items" ALTER COLUMN "mitraId" DROP NOT NULL;

-- AlterTable
ALTER TABLE "services" ALTER COLUMN "mitraId" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "services" ADD CONSTRAINT "services_mitraId_fkey" FOREIGN KEY ("mitraId") REFERENCES "mitras"("id") ON DELETE SET NULL ON UPDATE CASCADE;
