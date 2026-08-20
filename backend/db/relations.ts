import { relations } from 'drizzle-orm/relations';
import {
  users,
  mitras,
  categories,
  products,
  productReviews,
  productPromos,
  productTypes,
  services,
  rentalItems,
  rentals,
  orders,
  orderItems,
  orderVouchers,
  addresses,
  vouchers,
  voucherUses,
  chats,
  complaints,
  tickets,
  ticketMessages,
  heroBanners,
  wishlists,
  systemSettings,
  payments,
  paymentWebhookLogs,
} from './schema';

export const usersRelations = relations(users, ({ one, many }) => ({
  mitra: one(mitras, {
    fields: [users.id],
    references: [mitras.userId],
  }),
  addresses: many(addresses),
  orders: many(orders),
  rentals: many(rentals),
  wishlists: many(wishlists),
  complaints: many(complaints),
  voucherUses: many(voucherUses),
  tickets: many(tickets),
  ticketMessages: many(ticketMessages),
  chatsSent: many(chats, { relationName: 'SentMessages' }),
  chatsRecv: many(chats, { relationName: 'ReceivedMessages' }),
  productReviews: many(productReviews),
}));

export const mitrasRelations = relations(mitras, ({ one, many }) => ({
  user: one(users, {
    fields: [mitras.userId],
    references: [users.id],
  }),
  services: many(services),
  rentals: many(rentals),
  complaints: many(complaints),
}));

export const categoriesRelations = relations(categories, ({ many }) => ({
  products: many(products),
  services: many(services),
}));

export const productsRelations = relations(products, ({ one, many }) => ({
  category: one(categories, {
    fields: [products.categoryId],
    references: [categories.id],
  }),
  types: many(productTypes),
  orderItems: many(orderItems),
  wishlists: many(wishlists),
  chats: many(chats),
  reviews: many(productReviews),
  promos: many(productPromos),
}));

export const productPromosRelations = relations(productPromos, ({ one }) => ({
  product: one(products, {
    fields: [productPromos.productId],
    references: [products.id],
  }),
}));

export const productReviewsRelations = relations(productReviews, ({ one }) => ({
  product: one(products, {
    fields: [productReviews.productId],
    references: [products.id],
  }),
  user: one(users, {
    fields: [productReviews.userId],
    references: [users.id],
  }),
  order: one(orders, {
    fields: [productReviews.orderId],
    references: [orders.id],
  }),
  orderItem: one(orderItems, {
    fields: [productReviews.orderItemId],
    references: [orderItems.id],
  }),
}));

export const productTypesRelations = relations(productTypes, ({ one }) => ({
  product: one(products, {
    fields: [productTypes.productId],
    references: [products.id],
  }),
}));

export const servicesRelations = relations(services, ({ one, many }) => ({
  mitra: one(mitras, {
    fields: [services.mitraId],
    references: [mitras.id],
  }),
  category: one(categories, {
    fields: [services.categoryId],
    references: [categories.id],
  }),
  orderItems: many(orderItems),
}));

export const rentalItemsRelations = relations(rentalItems, ({ many }) => ({
  rentals: many(rentals),
}));

export const rentalsRelations = relations(rentals, ({ one }) => ({
  user: one(users, {
    fields: [rentals.userId],
    references: [users.id],
  }),
  mitra: one(mitras, {
    fields: [rentals.mitraId],
    references: [mitras.id],
  }),
  rentalItem: one(rentalItems, {
    fields: [rentals.rentalItemId],
    references: [rentalItems.id],
  }),
}));

export const ordersRelations = relations(orders, ({ one, many }) => ({
  user: one(users, {
    fields: [orders.userId],
    references: [users.id],
  }),
  address: one(addresses, {
    fields: [orders.addressId],
    references: [addresses.id],
  }),
  voucherUse: one(voucherUses, {
    fields: [orders.voucherUseId],
    references: [voucherUses.id],
  }),
  items: many(orderItems),
  complaint: many(complaints),
  payments: many(payments),
  orderVouchers: many(orderVouchers),
  productReviews: many(productReviews),
}));

export const paymentsRelations = relations(payments, ({ one }) => ({
  order: one(orders, {
    fields: [payments.orderId],
    references: [orders.id],
  }),
}));

export const paymentWebhookLogsRelations = relations(paymentWebhookLogs, () => ({}));

export const orderItemsRelations = relations(orderItems, ({ one }) => ({
  order: one(orders, {
    fields: [orderItems.orderId],
    references: [orders.id],
  }),
  product: one(products, {
    fields: [orderItems.productId],
    references: [products.id],
  }),
  service: one(services, {
    fields: [orderItems.serviceId],
    references: [services.id],
  }),
  review: one(productReviews, {
    fields: [orderItems.id],
    references: [productReviews.orderItemId],
  }),
}));

export const addressesRelations = relations(addresses, ({ one, many }) => ({
  user: one(users, {
    fields: [addresses.userId],
    references: [users.id],
  }),
  orders: many(orders),
}));

export const vouchersRelations = relations(vouchers, ({ many }) => ({
  uses: many(voucherUses),
  orderUses: many(orderVouchers),
}));

export const orderVouchersRelations = relations(orderVouchers, ({ one }) => ({
  order: one(orders, {
    fields: [orderVouchers.orderId],
    references: [orders.id],
  }),
  voucher: one(vouchers, {
    fields: [orderVouchers.voucherId],
    references: [vouchers.id],
  }),
}));

export const voucherUsesRelations = relations(voucherUses, ({ one, many }) => ({
  voucher: one(vouchers, {
    fields: [voucherUses.voucherId],
    references: [vouchers.id],
  }),
  user: one(users, {
    fields: [voucherUses.userId],
    references: [users.id],
  }),
  orders: many(orders),
}));

export const chatsRelations = relations(chats, ({ one }) => ({
  sender: one(users, {
    fields: [chats.senderId],
    references: [users.id],
    relationName: 'SentMessages',
  }),
  receiver: one(users, {
    fields: [chats.receiverId],
    references: [users.id],
    relationName: 'ReceivedMessages',
  }),
  product: one(products, {
    fields: [chats.productId],
    references: [products.id],
  }),
}));

export const complaintsRelations = relations(complaints, ({ one }) => ({
  user: one(users, {
    fields: [complaints.userId],
    references: [users.id],
  }),
  mitra: one(mitras, {
    fields: [complaints.mitraId],
    references: [mitras.id],
  }),
  order: one(orders, {
    fields: [complaints.orderId],
    references: [orders.id],
  }),
}));

export const ticketsRelations = relations(tickets, ({ one, many }) => ({
  user: one(users, {
    fields: [tickets.userId],
    references: [users.id],
  }),
  messages: many(ticketMessages),
}));

export const ticketMessagesRelations = relations(ticketMessages, ({ one }) => ({
  ticket: one(tickets, {
    fields: [ticketMessages.ticketId],
    references: [tickets.id],
  }),
  sender: one(users, {
    fields: [ticketMessages.senderId],
    references: [users.id],
  }),
}));

export const wishlistsRelations = relations(wishlists, ({ one }) => ({
  user: one(users, {
    fields: [wishlists.userId],
    references: [users.id],
  }),
  product: one(products, {
    fields: [wishlists.productId],
    references: [products.id],
  }),
}));

export const heroBannersRelations = relations(heroBanners, () => ({}));
export const systemSettingsRelations = relations(systemSettings, () => ({}));
