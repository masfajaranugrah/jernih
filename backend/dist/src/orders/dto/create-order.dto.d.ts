export declare class OrderItemDto {
    productId?: string;
    serviceId?: string;
    quantity?: number;
}
export declare class CreateOrderDto {
    items: OrderItemDto[];
    addressId?: string;
    voucherCode?: string;
    notes?: string;
    paymentMethod?: string;
    shippingCost?: number;
}
