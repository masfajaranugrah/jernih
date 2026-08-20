import { pgTable, uniqueIndex, text, timestamp, foreignKey, numeric, integer, boolean, serial, index, varchar, doublePrecision, pgEnum, jsonb } from "drizzle-orm/pg-core"
import { sql } from "drizzle-orm"

export const complaintStatus = pgEnum("ComplaintStatus", ['OPEN', 'IN_PROGRESS', 'RESOLVED', 'CLOSED'])
export const orderStatus = pgEnum("OrderStatus", ['PENDING', 'CONFIRMED', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED', 'REFUNDED', 'EXPIRED'])
export const rentalStatus = pgEnum("RentalStatus", ['PENDING', 'ACTIVE', 'RETURNED', 'CANCELLED'])
export const role = pgEnum("Role", ['CUSTOMER', 'MITRA', 'ADMIN'])
export const ticketCategory = pgEnum("TicketCategory", ['PEMBELIAN', 'PENGIRIMAN', 'LAINNYA'])
export const ticketPriority = pgEnum("TicketPriority", ['URGENT', 'SEDANG', 'LOW'])
export const ticketStatus = pgEnum("TicketStatus", ['OPEN', 'RESOLVED', 'CLOSED'])
export const voucherType = pgEnum("VoucherType", ['PERCENTAGE', 'FIXED'])
export const voucherCategory = pgEnum("VoucherCategory", ['DISCOUNT', 'SHIPPING'])
export const paymentStatus = pgEnum("PaymentStatus", ['PENDING', 'PAID', 'FAILED', 'EXPIRED', 'CANCELLED', 'REFUNDED', 'PARTIALLY_REFUNDED', 'AMOUNT_MISMATCH'])
export const promoStatus = pgEnum("PromoStatus", ['SCHEDULED', 'ACTIVE', 'EXPIRED', 'DISABLED'])


export const systemSettings = pgTable("system_settings", {
	id: text().primaryKey().notNull(),
	key: text().notNull(),
	value: text().notNull(),
	updatedAt: timestamp({ precision: 3, mode: 'date' }).$defaultFn(() => new Date()).$onUpdate(() => new Date()).notNull(),
}, (table) => [
	uniqueIndex("system_settings_key_key").using("btree", table.key.asc().nullsLast().op("text_ops")),
]);

export const productTypes = pgTable("product_types", {
	id: text().primaryKey().notNull(),
	productId: text().notNull(),
	name: text().notNull(),
	price: numeric({ precision: 12, scale:  2 }).notNull(),
	oldPrice: numeric({ precision: 12, scale:  2 }),
	stock: integer().default(0).notNull(),
	isActive: boolean().default(true).notNull(),
	createdAt: timestamp({ precision: 3, mode: 'date' }).default(sql`CURRENT_TIMESTAMP`).notNull(),
	updatedAt: timestamp({ precision: 3, mode: 'date' }).$defaultFn(() => new Date()).$onUpdate(() => new Date()).notNull(),
}, (table) => [
	index("product_types_productId_idx").using("btree", table.productId.asc().nullsLast().op("text_ops")),
	foreignKey({
			columns: [table.productId],
			foreignColumns: [products.id],
			name: "product_types_productId_fkey"
		}).onUpdate("cascade").onDelete("cascade"),
]);

export const tickets = pgTable("tickets", {
	id: text().primaryKey().notNull(),
	number: serial().notNull(),
	userId: text().notNull(),
	category: ticketCategory().notNull(),
	priority: ticketPriority().notNull(),
	status: ticketStatus().default('OPEN').notNull(),
	subject: text().notNull(),
	createdAt: timestamp({ precision: 3, mode: 'date' }).default(sql`CURRENT_TIMESTAMP`).notNull(),
	updatedAt: timestamp({ precision: 3, mode: 'date' }).$defaultFn(() => new Date()).$onUpdate(() => new Date()).notNull(),
}, (table) => [
	uniqueIndex("tickets_number_key").using("btree", table.number.asc().nullsLast().op("int4_ops")),
	index("tickets_userId_idx").using("btree", table.userId.asc().nullsLast().op("text_ops")),
	foreignKey({
			columns: [table.userId],
			foreignColumns: [users.id],
			name: "tickets_userId_fkey"
		}).onUpdate("cascade").onDelete("restrict"),
]);

export const ticketMessages = pgTable("ticket_messages", {
	id: text().primaryKey().notNull(),
	ticketId: text().notNull(),
	senderId: text().notNull(),
	message: text().notNull(),
	imageUrl: text(),
	isRead: boolean().default(false).notNull(),
	createdAt: timestamp({ precision: 3, mode: 'date' }).default(sql`CURRENT_TIMESTAMP`).notNull(),
}, (table) => [
	index("ticket_messages_ticketId_createdAt_idx").using("btree", table.ticketId.asc().nullsLast().op("text_ops"), table.createdAt.asc().nullsLast().op("text_ops")),
	index("ticket_messages_senderId_idx").using("btree", table.senderId.asc().nullsLast().op("text_ops")),
	foreignKey({
			columns: [table.ticketId],
			foreignColumns: [tickets.id],
			name: "ticket_messages_ticketId_fkey"
		}).onUpdate("cascade").onDelete("cascade"),
	foreignKey({
			columns: [table.senderId],
			foreignColumns: [users.id],
			name: "ticket_messages_senderId_fkey"
		}).onUpdate("cascade").onDelete("restrict"),
]);

export const heroBanners = pgTable("hero_banners", {
	id: text().primaryKey().notNull(),
	position: integer().notNull(),
	badge: text(),
	title: text().notNull(),
	titleSuffix: text(),
	subtitle: text(),
	tagline: text(),
	description: text(),
	ctaText: text(),
	ctaColor: text(),
	ctaTextColor: text(),
	bgColor: text().default('#064e3b').notNull(),
	imageUrl: text(),
	imageAlt: text(),
	linkHref: text(),
	align: text().default('left').notNull(),
	isActive: boolean().default(true).notNull(),
	updatedAt: timestamp({ precision: 3, mode: 'date' }).$defaultFn(() => new Date()).$onUpdate(() => new Date()).notNull(),
}, (table) => [
	index("hero_banners_position_idx").using("btree", table.position.asc().nullsLast().op("int4_ops")),
]);

export const mitras = pgTable("mitras", {
	id: text().primaryKey().notNull(),
	userId: text().notNull(),
	storeName: text().notNull(),
	description: text(),
	logo: text(),
	banner: text(),
	address: text(),
	city: text(),
	province: text(),
	isVerified: boolean().default(false).notNull(),
	isActive: boolean().default(true).notNull(),
	rating: doublePrecision().default(0).notNull(),
	totalReviews: integer().default(0).notNull(),
	createdAt: timestamp({ precision: 3, mode: 'date' }).default(sql`CURRENT_TIMESTAMP`).notNull(),
	updatedAt: timestamp({ precision: 3, mode: 'date' }).$defaultFn(() => new Date()).$onUpdate(() => new Date()).notNull(),
}, (table) => [
	uniqueIndex("mitras_userId_key").using("btree", table.userId.asc().nullsLast().op("text_ops")),
	foreignKey({
			columns: [table.userId],
			foreignColumns: [users.id],
			name: "mitras_userId_fkey"
		}).onUpdate("cascade").onDelete("cascade"),
]);

export const products = pgTable("products", {
	id: text().primaryKey().notNull(),
	categoryId: text(),
	name: text().notNull(),
	slug: text().notNull(),
	description: text(),
	price: numeric({ precision: 12, scale:  2 }).notNull(),
	oldPrice: numeric({ precision: 12, scale:  2 }),
	stock: integer().default(0).notNull(),
	images: text().array(),
	isActive: boolean().default(true).notNull(),
	rating: doublePrecision().default(0).notNull(),
	totalSold: integer().default(0).notNull(),
	createdAt: timestamp({ precision: 3, mode: 'date' }).default(sql`CURRENT_TIMESTAMP`).notNull(),
	updatedAt: timestamp({ precision: 3, mode: 'date' }).$defaultFn(() => new Date()).$onUpdate(() => new Date()).notNull(),
}, (table) => [
	uniqueIndex("products_slug_key").using("btree", table.slug.asc().nullsLast().op("text_ops")),
	index("products_categoryId_idx").using("btree", table.categoryId.asc().nullsLast().op("text_ops")),
	index("products_status_filters_idx").using("btree", table.isActive.asc().nullsLast().op("bool_ops")),
	foreignKey({
			columns: [table.categoryId],
			foreignColumns: [categories.id],
			name: "products_categoryId_fkey"
		}).onUpdate("cascade").onDelete("set null"),
]);

export const productPromos = pgTable("product_promos", {
	id: text().primaryKey().notNull(),
	productId: text().notNull(),
	title: text().notNull(),
	subtitle: text(),
	bannerImage: text(),
	bannerBg: text().default('#064e3b').notNull(),
	promoPrice: numeric({ precision: 12, scale: 2 }).notNull(),
	discountPercent: numeric({ precision: 5, scale: 2 }).default('0').notNull(),
	status: promoStatus().default('ACTIVE').notNull(),
	quota: integer(),
	soldCount: integer().default(0).notNull(),
	startDate: timestamp({ precision: 3, mode: 'date' }).notNull(),
	endDate: timestamp({ precision: 3, mode: 'date' }).notNull(),
	createdAt: timestamp({ precision: 3, mode: 'date' }).default(sql`CURRENT_TIMESTAMP`).notNull(),
	updatedAt: timestamp({ precision: 3, mode: 'date' }).$defaultFn(() => new Date()).$onUpdate(() => new Date()).notNull(),
}, (table) => [
	index("product_promos_productId_idx").using("btree", table.productId.asc().nullsLast().op("text_ops")),
	index("product_promos_status_idx").using("btree", table.status.asc().nullsLast()),
	foreignKey({
			columns: [table.productId],
			foreignColumns: [products.id],
			name: "product_promos_productId_fkey"
		}).onUpdate("cascade").onDelete("cascade"),
]);

export const productReviews = pgTable("product_reviews", {
	id: text().primaryKey().notNull(),
	productId: text().notNull(),
	userId: text().notNull(),
	orderId: text().notNull(),
	orderItemId: text().notNull(),
	rating: integer().notNull(),
	comment: text(),
	createdAt: timestamp({ precision: 3, mode: 'date' }).default(sql`CURRENT_TIMESTAMP`).notNull(),
	updatedAt: timestamp({ precision: 3, mode: 'date' }).$defaultFn(() => new Date()).$onUpdate(() => new Date()).notNull(),
}, (table) => [
	uniqueIndex("product_reviews_orderItemId_key").using("btree", table.orderItemId.asc().nullsLast().op("text_ops")),
	index("product_reviews_productId_idx").using("btree", table.productId.asc().nullsLast().op("text_ops")),
	index("product_reviews_userId_idx").using("btree", table.userId.asc().nullsLast().op("text_ops")),
	foreignKey({
			columns: [table.productId],
			foreignColumns: [products.id],
			name: "product_reviews_productId_fkey"
		}).onUpdate("cascade").onDelete("cascade"),
	foreignKey({
			columns: [table.userId],
			foreignColumns: [users.id],
			name: "product_reviews_userId_fkey"
		}).onUpdate("cascade").onDelete("restrict"),
	foreignKey({
			columns: [table.orderId],
			foreignColumns: [orders.id],
			name: "product_reviews_orderId_fkey"
		}).onUpdate("cascade").onDelete("cascade"),
	foreignKey({
			columns: [table.orderItemId],
			foreignColumns: [orderItems.id],
			name: "product_reviews_orderItemId_fkey"
		}).onUpdate("cascade").onDelete("cascade"),
]);

export const categories = pgTable("categories", {
	id: text().primaryKey().notNull(),
	name: text().notNull(),
	slug: text().notNull(),
	icon: text(),
	createdAt: timestamp({ precision: 3, mode: 'date' }).default(sql`CURRENT_TIMESTAMP`).notNull(),
}, (table) => [
	uniqueIndex("categories_name_key").using("btree", table.name.asc().nullsLast().op("text_ops")),
	uniqueIndex("categories_slug_key").using("btree", table.slug.asc().nullsLast().op("text_ops")),
]);

export const services = pgTable("services", {
	id: text().primaryKey().notNull(),
	mitraId: text(),
	categoryId: text(),
	name: text().notNull(),
	slug: text().notNull(),
	description: text(),
	priceFrom: numeric({ precision: 12, scale:  2 }).notNull(),
	unit: text().default('project').notNull(),
	images: text().array(),
	isActive: boolean().default(true).notNull(),
	rating: doublePrecision().default(0).notNull(),
	createdAt: timestamp({ precision: 3, mode: 'date' }).default(sql`CURRENT_TIMESTAMP`).notNull(),
	updatedAt: timestamp({ precision: 3, mode: 'date' }).$defaultFn(() => new Date()).$onUpdate(() => new Date()).notNull(),
}, (table) => [
	uniqueIndex("services_slug_key").using("btree", table.slug.asc().nullsLast().op("text_ops")),
	index("services_mitraId_idx").using("btree", table.mitraId.asc().nullsLast().op("text_ops")),
	index("services_categoryId_idx").using("btree", table.categoryId.asc().nullsLast().op("text_ops")),
	foreignKey({
			columns: [table.mitraId],
			foreignColumns: [mitras.id],
			name: "services_mitraId_fkey"
		}).onUpdate("cascade").onDelete("set null"),
	foreignKey({
			columns: [table.categoryId],
			foreignColumns: [categories.id],
			name: "services_categoryId_fkey"
		}).onUpdate("cascade").onDelete("set null"),
]);

export const rentals = pgTable("rentals", {
	id: text().primaryKey().notNull(),
	userId: text().notNull(),
	mitraId: text().notNull(),
	rentalItemId: text().notNull(),
	startDate: timestamp({ precision: 3, mode: 'date' }).notNull(),
	endDate: timestamp({ precision: 3, mode: 'date' }).notNull(),
	totalDays: integer().notNull(),
	totalPrice: numeric({ precision: 12, scale:  2 }).notNull(),
	status: rentalStatus().default('PENDING').notNull(),
	notes: text(),
	createdAt: timestamp({ precision: 3, mode: 'date' }).default(sql`CURRENT_TIMESTAMP`).notNull(),
	updatedAt: timestamp({ precision: 3, mode: 'date' }).$defaultFn(() => new Date()).$onUpdate(() => new Date()).notNull(),
}, (table) => [
	index("rentals_userId_idx").using("btree", table.userId.asc().nullsLast().op("text_ops")),
	index("rentals_mitraId_idx").using("btree", table.mitraId.asc().nullsLast().op("text_ops")),
	index("rentals_rentalItemId_idx").using("btree", table.rentalItemId.asc().nullsLast().op("text_ops")),
	foreignKey({
			columns: [table.userId],
			foreignColumns: [users.id],
			name: "rentals_userId_fkey"
		}).onUpdate("cascade").onDelete("restrict"),
	foreignKey({
			columns: [table.mitraId],
			foreignColumns: [mitras.id],
			name: "rentals_mitraId_fkey"
		}).onUpdate("cascade").onDelete("restrict"),
	foreignKey({
			columns: [table.rentalItemId],
			foreignColumns: [rentalItems.id],
			name: "rentals_rentalItemId_fkey"
		}).onUpdate("cascade").onDelete("restrict"),
]);

export const rentalItems = pgTable("rental_items", {
	id: text().primaryKey().notNull(),
	mitraId: text(),
	name: text().notNull(),
	slug: text().notNull(),
	description: text(),
	pricePerDay: numeric({ precision: 12, scale:  2 }).notNull(),
	deposit: numeric({ precision: 12, scale:  2 }),
	images: text().array(),
	isActive: boolean().default(true).notNull(),
	rating: doublePrecision().default(0).notNull(),
	createdAt: timestamp({ precision: 3, mode: 'date' }).default(sql`CURRENT_TIMESTAMP`).notNull(),
	updatedAt: timestamp({ precision: 3, mode: 'date' }).$defaultFn(() => new Date()).$onUpdate(() => new Date()).notNull(),
}, (table) => [
	uniqueIndex("rental_items_slug_key").using("btree", table.slug.asc().nullsLast().op("text_ops")),
	index("rental_items_mitraId_idx").using("btree", table.mitraId.asc().nullsLast().op("text_ops")),
]);

export const addresses = pgTable("addresses", {
	id: text().primaryKey().notNull(),
	userId: text().notNull(),
	label: text().default('Rumah').notNull(),
	recipient: text().notNull(),
	phone: text().notNull(),
	street: text().notNull(),
	city: text().notNull(),
	province: text().notNull(),
	postalCode: text().notNull(),
	isDefault: boolean().default(false).notNull(),
	createdAt: timestamp({ precision: 3, mode: 'date' }).default(sql`CURRENT_TIMESTAMP`).notNull(),
	updatedAt: timestamp({ precision: 3, mode: 'date' }).$defaultFn(() => new Date()).$onUpdate(() => new Date()).notNull(),
}, (table) => [
	index("addresses_userId_idx").using("btree", table.userId.asc().nullsLast().op("text_ops")),
	foreignKey({
			columns: [table.userId],
			foreignColumns: [users.id],
			name: "addresses_userId_fkey"
		}).onUpdate("cascade").onDelete("cascade"),
]);

export const voucherUses = pgTable("voucher_uses", {
	id: text().primaryKey().notNull(),
	voucherId: text().notNull(),
	userId: text().notNull(),
	usedAt: timestamp({ precision: 3, mode: 'date' }).default(sql`CURRENT_TIMESTAMP`).notNull(),
}, (table) => [
	uniqueIndex("voucher_uses_voucherId_userId_key").using("btree", table.voucherId.asc().nullsLast().op("text_ops"), table.userId.asc().nullsLast().op("text_ops")),
	index("voucher_uses_userId_idx").using("btree", table.userId.asc().nullsLast().op("text_ops")),
	foreignKey({
			columns: [table.voucherId],
			foreignColumns: [vouchers.id],
			name: "voucher_uses_voucherId_fkey"
		}).onUpdate("cascade").onDelete("restrict"),
	foreignKey({
			columns: [table.userId],
			foreignColumns: [users.id],
			name: "voucher_uses_userId_fkey"
		}).onUpdate("cascade").onDelete("restrict"),
]);

export const orderItems = pgTable("order_items", {
	id: text().primaryKey().notNull(),
	orderId: text().notNull(),
	productId: text(),
	serviceId: text(),
	name: text().notNull(),
	price: numeric({ precision: 12, scale:  2 }).notNull(),
	quantity: integer().default(1).notNull(),
	subtotal: numeric({ precision: 12, scale:  2 }).notNull(),
}, (table) => [
	index("order_items_orderId_idx").using("btree", table.orderId.asc().nullsLast().op("text_ops")),
	foreignKey({
			columns: [table.orderId],
			foreignColumns: [orders.id],
			name: "order_items_orderId_fkey"
		}).onUpdate("cascade").onDelete("cascade"),
	foreignKey({
			columns: [table.productId],
			foreignColumns: [products.id],
			name: "order_items_productId_fkey"
		}).onUpdate("cascade").onDelete("set null"),
	foreignKey({
			columns: [table.serviceId],
			foreignColumns: [services.id],
			name: "order_items_serviceId_fkey"
		}).onUpdate("cascade").onDelete("set null"),
]);

// Voucher yang dipakai pada sebuah order (maksimal 1 DISCOUNT + 1 SHIPPING).
// Menyimpan snapshot voucher agar histori order tetap benar walau voucher diubah.
export const orderVouchers = pgTable("order_vouchers", {
	id: text().primaryKey().notNull(),
	orderId: text().notNull(),
	voucherId: text().notNull(),
	voucherCode: text().notNull(),
	voucherCategory: voucherCategory().notNull(),
	discountAmount: numeric({ precision: 12, scale:  2 }).default('0').notNull(),
	createdAt: timestamp({ precision: 3, mode: 'date' }).default(sql`CURRENT_TIMESTAMP`).notNull(),
}, (table) => [
	index("order_vouchers_orderId_idx").using("btree", table.orderId.asc().nullsLast().op("text_ops")),
	foreignKey({
			columns: [table.orderId],
			foreignColumns: [orders.id],
			name: "order_vouchers_orderId_fkey"
		}).onUpdate("cascade").onDelete("cascade"),
	foreignKey({
			columns: [table.voucherId],
			foreignColumns: [vouchers.id],
			name: "order_vouchers_voucherId_fkey"
		}).onUpdate("cascade").onDelete("restrict"),
]);

export const vouchers = pgTable("vouchers", {
	id: text().primaryKey().notNull(),
	code: text().notNull(),
	name: text(),
	description: text(),
	// Kategori voucher: DISCOUNT → potongan harga barang, SHIPPING → potongan ongkir
	category: voucherCategory().default('DISCOUNT').notNull(),
	type: voucherType().default('PERCENTAGE').notNull(),
	value: numeric({ precision: 10, scale:  2 }).notNull(),
	minPurchase: numeric({ precision: 12, scale:  2 }).default('0').notNull(),
	maxDiscount: numeric({ precision: 12, scale:  2 }),
	quota: integer().default(100).notNull(),
	usedCount: integer().default(0).notNull(),
	isActive: boolean().default(true).notNull(),
	startDate: timestamp({ precision: 3, mode: 'date' }),
	endDate: timestamp({ precision: 3, mode: 'date' }),
	createdAt: timestamp({ precision: 3, mode: 'date' }).default(sql`CURRENT_TIMESTAMP`).notNull(),
	updatedAt: timestamp({ precision: 3, mode: 'date' }).$defaultFn(() => new Date()).$onUpdate(() => new Date()).notNull(),
}, (table) => [
	uniqueIndex("vouchers_code_key").using("btree", table.code.asc().nullsLast().op("text_ops")),
]);

export const complaints = pgTable("complaints", {
	id: text().primaryKey().notNull(),
	userId: text().notNull(),
	mitraId: text(),
	orderId: text(),
	title: text().notNull(),
	description: text().notNull(),
	images: text().array(),
	status: complaintStatus().default('OPEN').notNull(),
	resolution: text(),
	createdAt: timestamp({ precision: 3, mode: 'date' }).default(sql`CURRENT_TIMESTAMP`).notNull(),
	updatedAt: timestamp({ precision: 3, mode: 'date' }).$defaultFn(() => new Date()).$onUpdate(() => new Date()).notNull(),
}, (table) => [
	uniqueIndex("complaints_orderId_key").using("btree", table.orderId.asc().nullsLast().op("text_ops")),
	index("complaints_userId_idx").using("btree", table.userId.asc().nullsLast().op("text_ops")),
	index("complaints_mitraId_idx").using("btree", table.mitraId.asc().nullsLast().op("text_ops")),
	foreignKey({
			columns: [table.userId],
			foreignColumns: [users.id],
			name: "complaints_userId_fkey"
		}).onUpdate("cascade").onDelete("restrict"),
	foreignKey({
			columns: [table.mitraId],
			foreignColumns: [mitras.id],
			name: "complaints_mitraId_fkey"
		}).onUpdate("cascade").onDelete("set null"),
	foreignKey({
			columns: [table.orderId],
			foreignColumns: [orders.id],
			name: "complaints_orderId_fkey"
		}).onUpdate("cascade").onDelete("set null"),
]);

export const wishlists = pgTable("wishlists", {
	id: text().primaryKey().notNull(),
	userId: text().notNull(),
	productId: text().notNull(),
	createdAt: timestamp({ precision: 3, mode: 'date' }).default(sql`CURRENT_TIMESTAMP`).notNull(),
}, (table) => [
	index("wishlists_userId_idx").using("btree", table.userId.asc().nullsLast().op("text_ops")),
	uniqueIndex("wishlists_userId_productId_key").using("btree", table.userId.asc().nullsLast().op("text_ops"), table.productId.asc().nullsLast().op("text_ops")),
	foreignKey({
			columns: [table.userId],
			foreignColumns: [users.id],
			name: "wishlists_userId_fkey"
		}).onUpdate("cascade").onDelete("cascade"),
	foreignKey({
			columns: [table.productId],
			foreignColumns: [products.id],
			name: "wishlists_productId_fkey"
		}).onUpdate("cascade").onDelete("cascade"),
]);

export const chats = pgTable("chats", {
	id: text().primaryKey().notNull(),
	senderId: text().notNull(),
	receiverId: text().notNull(),
	message: text().notNull(),
	imageUrl: text(),
	isRead: boolean().default(false).notNull(),
	createdAt: timestamp({ precision: 3, mode: 'date' }).default(sql`CURRENT_TIMESTAMP`).notNull(),
	isDeleted: boolean().default(false).notNull(),
	isSystem: boolean().default(false).notNull(),
	productId: text(),
	videoUrl: text(),
}, (table) => [
	index("chats_sender_receiver_idx").using("btree", table.senderId.asc().nullsLast().op("text_ops"), table.receiverId.asc().nullsLast().op("text_ops"), table.createdAt.asc().nullsLast()),
	index("chats_receiver_sender_idx").using("btree", table.receiverId.asc().nullsLast().op("text_ops"), table.senderId.asc().nullsLast().op("text_ops"), table.createdAt.asc().nullsLast()),
	foreignKey({
			columns: [table.receiverId],
			foreignColumns: [users.id],
			name: "chats_receiverId_fkey"
		}).onUpdate("cascade").onDelete("restrict"),
	foreignKey({
			columns: [table.productId],
			foreignColumns: [products.id],
			name: "chats_productId_fkey"
		}).onUpdate("cascade").onDelete("set null"),
	foreignKey({
			columns: [table.senderId],
			foreignColumns: [users.id],
			name: "chats_senderId_fkey"
		}).onUpdate("cascade").onDelete("restrict"),
]);

export const users = pgTable("users", {
	id: text().primaryKey().notNull(),
	email: text().notNull(),
	password: text().notNull(),
	name: text().notNull(),
	phone: text(),
	avatar: text(),
	role: role().default('CUSTOMER').notNull(),
	isActive: boolean().default(true).notNull(),
	createdAt: timestamp({ precision: 3, mode: 'date' }).default(sql`CURRENT_TIMESTAMP`).notNull(),
	updatedAt: timestamp({ precision: 3, mode: 'date' }).$defaultFn(() => new Date()).$onUpdate(() => new Date()).notNull(),
	lastSeenAt: timestamp({ precision: 3, mode: 'date' }),
	tokenVersion: integer().default(0).notNull(),
}, (table) => [
	uniqueIndex("users_email_key").using("btree", table.email.asc().nullsLast().op("text_ops")),
]);

export const orders = pgTable("orders", {
	id: text().primaryKey().notNull(),
	userId: text().notNull(),
	addressId: text(),
	voucherUseId: text(),
	status: orderStatus().default('PENDING').notNull(),
	subtotal: numeric({ precision: 12, scale:  2 }).notNull(),
	discountAmount: numeric({ precision: 12, scale:  2 }).default('0').notNull(),
	shippingDiscount: numeric({ precision: 12, scale:  2 }).default('0').notNull(),
	shippingCost: numeric({ precision: 12, scale:  2 }).default('0').notNull(),
	total: numeric({ precision: 12, scale:  2 }).notNull(),
	notes: text(),
	paymentMethod: text(),
	paymentProof: text(),
	paidAt: timestamp({ precision: 3, mode: 'date' }),
	createdAt: timestamp({ precision: 3, mode: 'date' }).default(sql`CURRENT_TIMESTAMP`).notNull(),
	updatedAt: timestamp({ precision: 3, mode: 'date' }).$defaultFn(() => new Date()).$onUpdate(() => new Date()).notNull(),
	orderNumber: text(),
	shippingCourier: text(),
	trackingNumber: text(),
	shippedAt: timestamp({ precision: 3, mode: 'date' }),
	receivedProof: text(),
	receivedAt: timestamp({ precision: 3, mode: 'date' }),
	completedAt: timestamp({ precision: 3, mode: 'date' }),
	// ── Snapshot alamat saat checkout (agar order lama tidak berubah walau alamat diedit) ──
	shippingName: text(),
	shippingPhone: text(),
	shippingAddress: text(),
	shippingProvince: text(),
	shippingCity: text(),
	shippingDistrict: text(),
	shippingPostalCode: text(),
	// ── Pilihan pengiriman (RajaOngkir) yang dipilih customer saat checkout ──
	shippingCourierCode: text(),
	shippingService: text(),
	shippingServiceDescription: text(),
	shippingEtd: text(),
	midtransTransactionId: text(),
	snapToken: text(),
	paymentFee: numeric({ precision: 12, scale:  2 }),
	idempotencyKey: text(),
}, (table) => [
	uniqueIndex("orders_orderNumber_key").using("btree", table.orderNumber.asc().nullsLast().op("text_ops")),
	uniqueIndex("orders_voucherUseId_key").using("btree", table.voucherUseId.asc().nullsLast().op("text_ops")),
	uniqueIndex("orders_idempotencyKey_key").using("btree", table.idempotencyKey.asc().nullsLast().op("text_ops")).where(sql`${table.idempotencyKey} IS NOT NULL`),
	index("orders_userId_idx").using("btree", table.userId.asc().nullsLast().op("text_ops")),
	index("orders_status_idx").using("btree", table.status.asc().nullsLast()),
	foreignKey({
			columns: [table.userId],
			foreignColumns: [users.id],
			name: "orders_userId_fkey"
		}).onUpdate("cascade").onDelete("restrict"),
	foreignKey({
			columns: [table.addressId],
			foreignColumns: [addresses.id],
			name: "orders_addressId_fkey"
		}).onUpdate("cascade").onDelete("set null"),
	foreignKey({
			columns: [table.voucherUseId],
			foreignColumns: [voucherUses.id],
			name: "orders_voucherUseId_fkey"
		}).onUpdate("cascade").onDelete("set null"),
]);

export const payments = pgTable("payments", {
	id: text().primaryKey().notNull(),
	orderId: text().notNull(),
	provider: text().default('MIDTRANS').notNull(),
	transactionId: text(),
	midtransOrderId: text().notNull(),
	paymentType: text(),
	status: paymentStatus().default('PENDING').notNull(),
	fraudStatus: text(),
	grossAmount: numeric({ precision: 12, scale:  2 }).notNull(),
	signatureKey: text(),
	settlementTime: timestamp({ precision: 3, mode: 'date' }),
	expiredAt: timestamp({ precision: 3, mode: 'date' }),
	rawResponse: jsonb(),
	createdAt: timestamp({ precision: 3, mode: 'date' }).default(sql`CURRENT_TIMESTAMP`).notNull(),
	updatedAt: timestamp({ precision: 3, mode: 'date' }).$defaultFn(() => new Date()).$onUpdate(() => new Date()).notNull(),
}, (table) => [
	index("payments_orderId_idx").using("btree", table.orderId.asc().nullsLast().op("text_ops")),
	// Satu transaksi Midtrans hanya boleh punya satu payment row (idempotency webhook)
	uniqueIndex("payments_transactionId_key").using("btree", table.transactionId.asc().nullsLast().op("text_ops")).where(sql`${table.transactionId} IS NOT NULL`),
	foreignKey({
			columns: [table.orderId],
			foreignColumns: [orders.id],
			name: "payments_orderId_fkey"
		}).onUpdate("cascade").onDelete("cascade"),
]);

export const paymentWebhookLogs = pgTable("payment_webhook_logs", {
	id: text().primaryKey().notNull(),
	provider: text().default('MIDTRANS').notNull(),
	eventType: text(),
	orderId: text(),
	transactionId: text(),
	transactionStatus: text(),
	dedupKey: text(),
	payload: jsonb(),
	signature: text(),
	processed: boolean().default(false).notNull(),
	processedAt: timestamp({ precision: 3, mode: 'date' }),
	error: text(),
	createdAt: timestamp({ precision: 3, mode: 'date' }).default(sql`CURRENT_TIMESTAMP`).notNull(),
}, (table) => [
	index("payment_webhook_logs_orderId_idx").using("btree", table.orderId.asc().nullsLast().op("text_ops")),
	index("payment_webhook_logs_transactionId_idx").using("btree", table.transactionId.asc().nullsLast().op("text_ops")),
	// Cegah webhook yang sama (transaksi + status) diproses/dilog lebih dari sekali
	uniqueIndex("payment_webhook_logs_dedup_key").using("btree", table.dedupKey.asc().nullsLast().op("text_ops")),
]);
