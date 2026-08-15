CREATE INDEX "addresses_userId_idx" ON "addresses" USING btree ("userId" text_ops);--> statement-breakpoint
CREATE INDEX "chats_sender_receiver_idx" ON "chats" USING btree ("senderId" text_ops,"receiverId" text_ops,"createdAt");--> statement-breakpoint
CREATE INDEX "chats_receiver_sender_idx" ON "chats" USING btree ("receiverId" text_ops,"senderId" text_ops,"createdAt");--> statement-breakpoint
CREATE INDEX "complaints_userId_idx" ON "complaints" USING btree ("userId" text_ops);--> statement-breakpoint
CREATE INDEX "complaints_mitraId_idx" ON "complaints" USING btree ("mitraId" text_ops);--> statement-breakpoint
CREATE INDEX "order_items_orderId_idx" ON "order_items" USING btree ("orderId" text_ops);--> statement-breakpoint
CREATE INDEX "orders_userId_idx" ON "orders" USING btree ("userId" text_ops);--> statement-breakpoint
CREATE INDEX "orders_status_idx" ON "orders" USING btree ("status");--> statement-breakpoint
CREATE INDEX "product_types_productId_idx" ON "product_types" USING btree ("productId" text_ops);--> statement-breakpoint
CREATE INDEX "products_categoryId_idx" ON "products" USING btree ("categoryId" text_ops);--> statement-breakpoint
CREATE INDEX "products_status_filters_idx" ON "products" USING btree ("isActive" bool_ops);--> statement-breakpoint
CREATE INDEX "rental_items_mitraId_idx" ON "rental_items" USING btree ("mitraId" text_ops);--> statement-breakpoint
CREATE INDEX "rentals_userId_idx" ON "rentals" USING btree ("userId" text_ops);--> statement-breakpoint
CREATE INDEX "rentals_mitraId_idx" ON "rentals" USING btree ("mitraId" text_ops);--> statement-breakpoint
CREATE INDEX "rentals_rentalItemId_idx" ON "rentals" USING btree ("rentalItemId" text_ops);--> statement-breakpoint
CREATE INDEX "services_mitraId_idx" ON "services" USING btree ("mitraId" text_ops);--> statement-breakpoint
CREATE INDEX "services_categoryId_idx" ON "services" USING btree ("categoryId" text_ops);--> statement-breakpoint
CREATE INDEX "ticket_messages_senderId_idx" ON "ticket_messages" USING btree ("senderId" text_ops);--> statement-breakpoint
CREATE INDEX "tickets_userId_idx" ON "tickets" USING btree ("userId" text_ops);--> statement-breakpoint
CREATE INDEX "voucher_uses_userId_idx" ON "voucher_uses" USING btree ("userId" text_ops);