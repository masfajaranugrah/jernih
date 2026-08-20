CREATE TYPE "public"."PromoStatus" AS ENUM('SCHEDULED', 'ACTIVE', 'EXPIRED', 'DISABLED');--> statement-breakpoint
CREATE TABLE "product_promos" (
	"id" text PRIMARY KEY NOT NULL,
	"productId" text NOT NULL,
	"title" text NOT NULL,
	"subtitle" text,
	"bannerImage" text,
	"bannerBg" text DEFAULT '#064e3b' NOT NULL,
	"promoPrice" numeric(12, 2) NOT NULL,
	"discountPercent" numeric(5, 2) DEFAULT '0' NOT NULL,
	"status" "PromoStatus" DEFAULT 'ACTIVE' NOT NULL,
	"quota" integer,
	"soldCount" integer DEFAULT 0 NOT NULL,
	"startDate" timestamp (3) NOT NULL,
	"endDate" timestamp (3) NOT NULL,
	"createdAt" timestamp (3) DEFAULT CURRENT_TIMESTAMP NOT NULL,
	"updatedAt" timestamp (3) NOT NULL
);
--> statement-breakpoint
ALTER TABLE "product_promos" ADD CONSTRAINT "product_promos_productId_fkey" FOREIGN KEY ("productId") REFERENCES "public"."products"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
CREATE INDEX "product_promos_productId_idx" ON "product_promos" USING btree ("productId" text_ops);--> statement-breakpoint
CREATE INDEX "product_promos_status_idx" ON "product_promos" USING btree ("status");