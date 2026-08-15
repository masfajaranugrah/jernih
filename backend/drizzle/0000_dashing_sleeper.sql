CREATE TYPE "public"."ComplaintStatus" AS ENUM('OPEN', 'IN_PROGRESS', 'RESOLVED', 'CLOSED');--> statement-breakpoint
CREATE TYPE "public"."OrderStatus" AS ENUM('PENDING', 'CONFIRMED', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED', 'REFUNDED');--> statement-breakpoint
CREATE TYPE "public"."RentalStatus" AS ENUM('PENDING', 'ACTIVE', 'RETURNED', 'CANCELLED');--> statement-breakpoint
CREATE TYPE "public"."Role" AS ENUM('CUSTOMER', 'MITRA', 'ADMIN');--> statement-breakpoint
CREATE TYPE "public"."TicketCategory" AS ENUM('PEMBELIAN', 'PENGIRIMAN', 'LAINNYA');--> statement-breakpoint
CREATE TYPE "public"."TicketPriority" AS ENUM('URGENT', 'SEDANG', 'LOW');--> statement-breakpoint
CREATE TYPE "public"."TicketStatus" AS ENUM('OPEN', 'RESOLVED', 'CLOSED');--> statement-breakpoint
CREATE TYPE "public"."VoucherType" AS ENUM('PERCENTAGE', 'FIXED');--> statement-breakpoint
CREATE TABLE "addresses" (
	"id" text PRIMARY KEY NOT NULL,
	"userId" text NOT NULL,
	"label" text DEFAULT 'Rumah' NOT NULL,
	"recipient" text NOT NULL,
	"phone" text NOT NULL,
	"street" text NOT NULL,
	"city" text NOT NULL,
	"province" text NOT NULL,
	"postalCode" text NOT NULL,
	"isDefault" boolean DEFAULT false NOT NULL,
	"createdAt" timestamp (3) DEFAULT CURRENT_TIMESTAMP NOT NULL,
	"updatedAt" timestamp (3) NOT NULL
);
--> statement-breakpoint
CREATE TABLE "categories" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"slug" text NOT NULL,
	"icon" text,
	"createdAt" timestamp (3) DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE TABLE "chats" (
	"id" text PRIMARY KEY NOT NULL,
	"senderId" text NOT NULL,
	"receiverId" text NOT NULL,
	"message" text NOT NULL,
	"imageUrl" text,
	"isRead" boolean DEFAULT false NOT NULL,
	"createdAt" timestamp (3) DEFAULT CURRENT_TIMESTAMP NOT NULL,
	"isDeleted" boolean DEFAULT false NOT NULL,
	"isSystem" boolean DEFAULT false NOT NULL,
	"productId" text,
	"videoUrl" text
);
--> statement-breakpoint
CREATE TABLE "complaints" (
	"id" text PRIMARY KEY NOT NULL,
	"userId" text NOT NULL,
	"mitraId" text,
	"orderId" text,
	"title" text NOT NULL,
	"description" text NOT NULL,
	"images" text[],
	"status" "ComplaintStatus" DEFAULT 'OPEN' NOT NULL,
	"resolution" text,
	"createdAt" timestamp (3) DEFAULT CURRENT_TIMESTAMP NOT NULL,
	"updatedAt" timestamp (3) NOT NULL
);
--> statement-breakpoint
CREATE TABLE "hero_banners" (
	"id" text PRIMARY KEY NOT NULL,
	"position" integer NOT NULL,
	"badge" text,
	"title" text NOT NULL,
	"titleSuffix" text,
	"subtitle" text,
	"tagline" text,
	"description" text,
	"ctaText" text,
	"ctaColor" text,
	"ctaTextColor" text,
	"bgColor" text DEFAULT '#064e3b' NOT NULL,
	"imageUrl" text,
	"imageAlt" text,
	"linkHref" text,
	"align" text DEFAULT 'left' NOT NULL,
	"isActive" boolean DEFAULT true NOT NULL,
	"updatedAt" timestamp (3) NOT NULL
);
--> statement-breakpoint
CREATE TABLE "mitras" (
	"id" text PRIMARY KEY NOT NULL,
	"userId" text NOT NULL,
	"storeName" text NOT NULL,
	"description" text,
	"logo" text,
	"banner" text,
	"address" text,
	"city" text,
	"province" text,
	"isVerified" boolean DEFAULT false NOT NULL,
	"isActive" boolean DEFAULT true NOT NULL,
	"rating" double precision DEFAULT 0 NOT NULL,
	"totalReviews" integer DEFAULT 0 NOT NULL,
	"createdAt" timestamp (3) DEFAULT CURRENT_TIMESTAMP NOT NULL,
	"updatedAt" timestamp (3) NOT NULL
);
--> statement-breakpoint
CREATE TABLE "order_items" (
	"id" text PRIMARY KEY NOT NULL,
	"orderId" text NOT NULL,
	"productId" text,
	"serviceId" text,
	"name" text NOT NULL,
	"price" numeric(12, 2) NOT NULL,
	"quantity" integer DEFAULT 1 NOT NULL,
	"subtotal" numeric(12, 2) NOT NULL
);
--> statement-breakpoint
CREATE TABLE "orders" (
	"id" text PRIMARY KEY NOT NULL,
	"userId" text NOT NULL,
	"addressId" text,
	"voucherUseId" text,
	"status" "OrderStatus" DEFAULT 'PENDING' NOT NULL,
	"subtotal" numeric(12, 2) NOT NULL,
	"discountAmount" numeric(12, 2) DEFAULT '0' NOT NULL,
	"shippingCost" numeric(12, 2) DEFAULT '0' NOT NULL,
	"total" numeric(12, 2) NOT NULL,
	"notes" text,
	"paymentMethod" text,
	"paymentProof" text,
	"paidAt" timestamp (3),
	"createdAt" timestamp (3) DEFAULT CURRENT_TIMESTAMP NOT NULL,
	"updatedAt" timestamp (3) NOT NULL,
	"orderNumber" text,
	"shippingCourier" text,
	"trackingNumber" text,
	"midtransTransactionId" text,
	"snapToken" text,
	"paymentFee" numeric(12, 2)
);
--> statement-breakpoint
CREATE TABLE "_prisma_migrations" (
	"id" varchar(36) PRIMARY KEY NOT NULL,
	"checksum" varchar(64) NOT NULL,
	"finished_at" timestamp with time zone,
	"migration_name" varchar(255) NOT NULL,
	"logs" text,
	"rolled_back_at" timestamp with time zone,
	"started_at" timestamp with time zone DEFAULT now() NOT NULL,
	"applied_steps_count" integer DEFAULT 0 NOT NULL
);
--> statement-breakpoint
CREATE TABLE "product_types" (
	"id" text PRIMARY KEY NOT NULL,
	"productId" text NOT NULL,
	"name" text NOT NULL,
	"price" numeric(12, 2) NOT NULL,
	"oldPrice" numeric(12, 2),
	"stock" integer DEFAULT 0 NOT NULL,
	"isActive" boolean DEFAULT true NOT NULL,
	"createdAt" timestamp (3) DEFAULT CURRENT_TIMESTAMP NOT NULL,
	"updatedAt" timestamp (3) NOT NULL
);
--> statement-breakpoint
CREATE TABLE "products" (
	"id" text PRIMARY KEY NOT NULL,
	"categoryId" text,
	"name" text NOT NULL,
	"slug" text NOT NULL,
	"description" text,
	"price" numeric(12, 2) NOT NULL,
	"oldPrice" numeric(12, 2),
	"stock" integer DEFAULT 0 NOT NULL,
	"images" text[],
	"isActive" boolean DEFAULT true NOT NULL,
	"rating" double precision DEFAULT 0 NOT NULL,
	"totalSold" integer DEFAULT 0 NOT NULL,
	"createdAt" timestamp (3) DEFAULT CURRENT_TIMESTAMP NOT NULL,
	"updatedAt" timestamp (3) NOT NULL
);
--> statement-breakpoint
CREATE TABLE "rental_items" (
	"id" text PRIMARY KEY NOT NULL,
	"mitraId" text,
	"name" text NOT NULL,
	"slug" text NOT NULL,
	"description" text,
	"pricePerDay" numeric(12, 2) NOT NULL,
	"deposit" numeric(12, 2),
	"images" text[],
	"isActive" boolean DEFAULT true NOT NULL,
	"rating" double precision DEFAULT 0 NOT NULL,
	"createdAt" timestamp (3) DEFAULT CURRENT_TIMESTAMP NOT NULL,
	"updatedAt" timestamp (3) NOT NULL
);
--> statement-breakpoint
CREATE TABLE "rentals" (
	"id" text PRIMARY KEY NOT NULL,
	"userId" text NOT NULL,
	"mitraId" text NOT NULL,
	"rentalItemId" text NOT NULL,
	"startDate" timestamp (3) NOT NULL,
	"endDate" timestamp (3) NOT NULL,
	"totalDays" integer NOT NULL,
	"totalPrice" numeric(12, 2) NOT NULL,
	"status" "RentalStatus" DEFAULT 'PENDING' NOT NULL,
	"notes" text,
	"createdAt" timestamp (3) DEFAULT CURRENT_TIMESTAMP NOT NULL,
	"updatedAt" timestamp (3) NOT NULL
);
--> statement-breakpoint
CREATE TABLE "services" (
	"id" text PRIMARY KEY NOT NULL,
	"mitraId" text,
	"categoryId" text,
	"name" text NOT NULL,
	"slug" text NOT NULL,
	"description" text,
	"priceFrom" numeric(12, 2) NOT NULL,
	"unit" text DEFAULT 'project' NOT NULL,
	"images" text[],
	"isActive" boolean DEFAULT true NOT NULL,
	"rating" double precision DEFAULT 0 NOT NULL,
	"createdAt" timestamp (3) DEFAULT CURRENT_TIMESTAMP NOT NULL,
	"updatedAt" timestamp (3) NOT NULL
);
--> statement-breakpoint
CREATE TABLE "system_settings" (
	"id" text PRIMARY KEY NOT NULL,
	"key" text NOT NULL,
	"value" text NOT NULL,
	"updatedAt" timestamp (3) NOT NULL
);
--> statement-breakpoint
CREATE TABLE "ticket_messages" (
	"id" text PRIMARY KEY NOT NULL,
	"ticketId" text NOT NULL,
	"senderId" text NOT NULL,
	"message" text NOT NULL,
	"imageUrl" text,
	"isRead" boolean DEFAULT false NOT NULL,
	"createdAt" timestamp (3) DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE TABLE "tickets" (
	"id" text PRIMARY KEY NOT NULL,
	"number" serial NOT NULL,
	"userId" text NOT NULL,
	"category" "TicketCategory" NOT NULL,
	"priority" "TicketPriority" NOT NULL,
	"status" "TicketStatus" DEFAULT 'OPEN' NOT NULL,
	"subject" text NOT NULL,
	"createdAt" timestamp (3) DEFAULT CURRENT_TIMESTAMP NOT NULL,
	"updatedAt" timestamp (3) NOT NULL
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" text PRIMARY KEY NOT NULL,
	"email" text NOT NULL,
	"password" text NOT NULL,
	"name" text NOT NULL,
	"phone" text,
	"avatar" text,
	"role" "Role" DEFAULT 'CUSTOMER' NOT NULL,
	"isActive" boolean DEFAULT true NOT NULL,
	"createdAt" timestamp (3) DEFAULT CURRENT_TIMESTAMP NOT NULL,
	"updatedAt" timestamp (3) NOT NULL,
	"lastSeenAt" timestamp (3),
	"tokenVersion" integer DEFAULT 0 NOT NULL
);
--> statement-breakpoint
CREATE TABLE "voucher_uses" (
	"id" text PRIMARY KEY NOT NULL,
	"voucherId" text NOT NULL,
	"userId" text NOT NULL,
	"usedAt" timestamp (3) DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE TABLE "vouchers" (
	"id" text PRIMARY KEY NOT NULL,
	"code" text NOT NULL,
	"description" text,
	"type" "VoucherType" DEFAULT 'PERCENTAGE' NOT NULL,
	"value" numeric(10, 2) NOT NULL,
	"minPurchase" numeric(12, 2) DEFAULT '0' NOT NULL,
	"maxDiscount" numeric(12, 2),
	"quota" integer DEFAULT 100 NOT NULL,
	"usedCount" integer DEFAULT 0 NOT NULL,
	"isActive" boolean DEFAULT true NOT NULL,
	"startDate" timestamp (3),
	"endDate" timestamp (3),
	"createdAt" timestamp (3) DEFAULT CURRENT_TIMESTAMP NOT NULL,
	"updatedAt" timestamp (3) NOT NULL
);
--> statement-breakpoint
CREATE TABLE "wishlists" (
	"id" text PRIMARY KEY NOT NULL,
	"userId" text NOT NULL,
	"productId" text NOT NULL,
	"createdAt" timestamp (3) DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
ALTER TABLE "addresses" ADD CONSTRAINT "addresses_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "chats" ADD CONSTRAINT "chats_receiverId_fkey" FOREIGN KEY ("receiverId") REFERENCES "public"."users"("id") ON DELETE restrict ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "chats" ADD CONSTRAINT "chats_productId_fkey" FOREIGN KEY ("productId") REFERENCES "public"."products"("id") ON DELETE set null ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "chats" ADD CONSTRAINT "chats_senderId_fkey" FOREIGN KEY ("senderId") REFERENCES "public"."users"("id") ON DELETE restrict ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "complaints" ADD CONSTRAINT "complaints_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE restrict ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "complaints" ADD CONSTRAINT "complaints_mitraId_fkey" FOREIGN KEY ("mitraId") REFERENCES "public"."mitras"("id") ON DELETE set null ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "complaints" ADD CONSTRAINT "complaints_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "public"."orders"("id") ON DELETE set null ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "mitras" ADD CONSTRAINT "mitras_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "order_items" ADD CONSTRAINT "order_items_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "public"."orders"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "order_items" ADD CONSTRAINT "order_items_productId_fkey" FOREIGN KEY ("productId") REFERENCES "public"."products"("id") ON DELETE set null ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "order_items" ADD CONSTRAINT "order_items_serviceId_fkey" FOREIGN KEY ("serviceId") REFERENCES "public"."services"("id") ON DELETE set null ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "orders" ADD CONSTRAINT "orders_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE restrict ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "orders" ADD CONSTRAINT "orders_addressId_fkey" FOREIGN KEY ("addressId") REFERENCES "public"."addresses"("id") ON DELETE set null ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "orders" ADD CONSTRAINT "orders_voucherUseId_fkey" FOREIGN KEY ("voucherUseId") REFERENCES "public"."voucher_uses"("id") ON DELETE set null ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "product_types" ADD CONSTRAINT "product_types_productId_fkey" FOREIGN KEY ("productId") REFERENCES "public"."products"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "products" ADD CONSTRAINT "products_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "public"."categories"("id") ON DELETE set null ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "rentals" ADD CONSTRAINT "rentals_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE restrict ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "rentals" ADD CONSTRAINT "rentals_mitraId_fkey" FOREIGN KEY ("mitraId") REFERENCES "public"."mitras"("id") ON DELETE restrict ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "rentals" ADD CONSTRAINT "rentals_rentalItemId_fkey" FOREIGN KEY ("rentalItemId") REFERENCES "public"."rental_items"("id") ON DELETE restrict ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "services" ADD CONSTRAINT "services_mitraId_fkey" FOREIGN KEY ("mitraId") REFERENCES "public"."mitras"("id") ON DELETE set null ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "services" ADD CONSTRAINT "services_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "public"."categories"("id") ON DELETE set null ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "ticket_messages" ADD CONSTRAINT "ticket_messages_ticketId_fkey" FOREIGN KEY ("ticketId") REFERENCES "public"."tickets"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "ticket_messages" ADD CONSTRAINT "ticket_messages_senderId_fkey" FOREIGN KEY ("senderId") REFERENCES "public"."users"("id") ON DELETE restrict ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "tickets" ADD CONSTRAINT "tickets_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE restrict ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "voucher_uses" ADD CONSTRAINT "voucher_uses_voucherId_fkey" FOREIGN KEY ("voucherId") REFERENCES "public"."vouchers"("id") ON DELETE restrict ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "voucher_uses" ADD CONSTRAINT "voucher_uses_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE restrict ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "wishlists" ADD CONSTRAINT "wishlists_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "wishlists" ADD CONSTRAINT "wishlists_productId_fkey" FOREIGN KEY ("productId") REFERENCES "public"."products"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
CREATE UNIQUE INDEX "categories_name_key" ON "categories" USING btree ("name" text_ops);--> statement-breakpoint
CREATE UNIQUE INDEX "categories_slug_key" ON "categories" USING btree ("slug" text_ops);--> statement-breakpoint
CREATE UNIQUE INDEX "complaints_orderId_key" ON "complaints" USING btree ("orderId" text_ops);--> statement-breakpoint
CREATE INDEX "hero_banners_position_idx" ON "hero_banners" USING btree ("position" int4_ops);--> statement-breakpoint
CREATE UNIQUE INDEX "mitras_userId_key" ON "mitras" USING btree ("userId" text_ops);--> statement-breakpoint
CREATE UNIQUE INDEX "orders_orderNumber_key" ON "orders" USING btree ("orderNumber" text_ops);--> statement-breakpoint
CREATE UNIQUE INDEX "orders_voucherUseId_key" ON "orders" USING btree ("voucherUseId" text_ops);--> statement-breakpoint
CREATE UNIQUE INDEX "products_slug_key" ON "products" USING btree ("slug" text_ops);--> statement-breakpoint
CREATE UNIQUE INDEX "rental_items_slug_key" ON "rental_items" USING btree ("slug" text_ops);--> statement-breakpoint
CREATE UNIQUE INDEX "services_slug_key" ON "services" USING btree ("slug" text_ops);--> statement-breakpoint
CREATE UNIQUE INDEX "system_settings_key_key" ON "system_settings" USING btree ("key" text_ops);--> statement-breakpoint
CREATE INDEX "ticket_messages_ticketId_createdAt_idx" ON "ticket_messages" USING btree ("ticketId" text_ops,"createdAt" text_ops);--> statement-breakpoint
CREATE UNIQUE INDEX "tickets_number_key" ON "tickets" USING btree ("number" int4_ops);--> statement-breakpoint
CREATE UNIQUE INDEX "users_email_key" ON "users" USING btree ("email" text_ops);--> statement-breakpoint
CREATE UNIQUE INDEX "voucher_uses_voucherId_userId_key" ON "voucher_uses" USING btree ("voucherId" text_ops,"userId" text_ops);--> statement-breakpoint
CREATE UNIQUE INDEX "vouchers_code_key" ON "vouchers" USING btree ("code" text_ops);--> statement-breakpoint
CREATE INDEX "wishlists_userId_idx" ON "wishlists" USING btree ("userId" text_ops);--> statement-breakpoint
CREATE UNIQUE INDEX "wishlists_userId_productId_key" ON "wishlists" USING btree ("userId" text_ops,"productId" text_ops);