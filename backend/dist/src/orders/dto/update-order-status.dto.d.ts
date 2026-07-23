import { OrderStatus } from '@prisma/client';
export declare class UpdateOrderStatusDto {
    status: OrderStatus;
    shippingCourier?: string;
    trackingNumber?: string;
}
