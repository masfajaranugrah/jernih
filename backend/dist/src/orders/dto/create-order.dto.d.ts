export declare class OrderItemDto {
    productId?: string;
    serviceId?: string;
    name?: string;
    price?: number;
    quantity?: number;
}
export declare class CreateOrderDto {
    items: OrderItemDto[];
    orderNumber?: string;
    addressId?: string;
    voucherCode?: string;
    notes?: string;
    paymentMethod?: string;
    shippingCost?: number;
}
