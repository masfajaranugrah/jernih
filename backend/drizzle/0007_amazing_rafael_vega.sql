CREATE TABLE "product_reviews" (
	"id" text PRIMARY KEY NOT NULL,
	"productId" text NOT NULL,
	"userId" text NOT NULL,
	"orderId" text NOT NULL,
	"orderItemId" text NOT NULL,
	"rating" integer NOT NULL,
	"comment" text,
	"createdAt" timestamp (3) DEFAULT CURRENT_TIMESTAMP NOT NULL,
	"updatedAt" timestamp (3) NOT NULL
);
--> statement-breakpoint
ALTER TABLE "orders" ADD COLUMN "shippedAt" timestamp (3);--> statement-breakpoint
ALTER TABLE "orders" ADD COLUMN "receivedProof" text;--> statement-breakpoint
ALTER TABLE "orders" ADD COLUMN "receivedAt" timestamp (3);--> statement-breakpoint
ALTER TABLE "orders" ADD COLUMN "completedAt" timestamp (3);--> statement-breakpoint
ALTER TABLE "product_reviews" ADD CONSTRAINT "product_reviews_productId_fkey" FOREIGN KEY ("productId") REFERENCES "public"."products"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "product_reviews" ADD CONSTRAINT "product_reviews_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE restrict ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "product_reviews" ADD CONSTRAINT "product_reviews_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "public"."orders"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "product_reviews" ADD CONSTRAINT "product_reviews_orderItemId_fkey" FOREIGN KEY ("orderItemId") REFERENCES "public"."order_items"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
CREATE UNIQUE INDEX "product_reviews_orderItemId_key" ON "product_reviews" USING btree ("orderItemId" text_ops);--> statement-breakpoint
CREATE INDEX "product_reviews_productId_idx" ON "product_reviews" USING btree ("productId" text_ops);--> statement-breakpoint
CREATE INDEX "product_reviews_userId_idx" ON "product_reviews" USING btree ("userId" text_ops);