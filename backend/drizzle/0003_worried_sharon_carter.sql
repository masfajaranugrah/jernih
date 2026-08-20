CREATE TYPE "public"."PaymentStatus" AS ENUM('PENDING', 'PAID', 'FAILED', 'EXPIRED', 'CANCELLED', 'REFUNDED', 'PARTIALLY_REFUNDED');--> statement-breakpoint
CREATE TABLE "payment_webhook_logs" (
	"id" text PRIMARY KEY NOT NULL,
	"provider" text DEFAULT 'MIDTRANS' NOT NULL,
	"eventType" text,
	"orderId" text,
	"transactionId" text,
	"transactionStatus" text,
	"dedupKey" text,
	"payload" jsonb,
	"signature" text,
	"processed" boolean DEFAULT false NOT NULL,
	"processedAt" timestamp (3),
	"error" text,
	"createdAt" timestamp (3) DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE TABLE "payments" (
	"id" text PRIMARY KEY NOT NULL,
	"orderId" text NOT NULL,
	"provider" text DEFAULT 'MIDTRANS' NOT NULL,
	"transactionId" text,
	"midtransOrderId" text NOT NULL,
	"paymentType" text,
	"status" "PaymentStatus" DEFAULT 'PENDING' NOT NULL,
	"fraudStatus" text,
	"grossAmount" numeric(12, 2) NOT NULL,
	"signatureKey" text,
	"settlementTime" timestamp (3),
	"expiredAt" timestamp (3),
	"rawResponse" jsonb,
	"createdAt" timestamp (3) DEFAULT CURRENT_TIMESTAMP NOT NULL,
	"updatedAt" timestamp (3) NOT NULL
);
--> statement-breakpoint
ALTER TABLE "orders" ADD COLUMN "idempotencyKey" text;--> statement-breakpoint
ALTER TABLE "payments" ADD CONSTRAINT "payments_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "public"."orders"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
CREATE INDEX "payment_webhook_logs_orderId_idx" ON "payment_webhook_logs" USING btree ("orderId" text_ops);--> statement-breakpoint
CREATE INDEX "payment_webhook_logs_transactionId_idx" ON "payment_webhook_logs" USING btree ("transactionId" text_ops);--> statement-breakpoint
CREATE UNIQUE INDEX "payment_webhook_logs_dedup_key" ON "payment_webhook_logs" USING btree ("dedupKey" text_ops);--> statement-breakpoint
CREATE INDEX "payments_orderId_idx" ON "payments" USING btree ("orderId" text_ops);--> statement-breakpoint
CREATE UNIQUE INDEX "payments_transactionId_key" ON "payments" USING btree ("transactionId" text_ops) WHERE "payments"."transactionId" IS NOT NULL;--> statement-breakpoint
CREATE UNIQUE INDEX "orders_idempotencyKey_key" ON "orders" USING btree ("idempotencyKey" text_ops) WHERE "orders"."idempotencyKey" IS NOT NULL;