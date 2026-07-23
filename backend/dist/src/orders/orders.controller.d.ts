import { OrdersService } from './orders.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderStatusDto } from './dto/update-order-status.dto';
import { UploadPaymentDto } from './dto/upload-payment.dto';
export declare class OrdersController {
    private ordersService;
    constructor(ordersService: OrdersService);
    create(req: any, dto: CreateOrderDto): Promise<{
        address: {
            id: string;
            userId: string;
            createdAt: Date;
            updatedAt: Date;
            phone: string;
            city: string;
            province: string;
            label: string;
            recipient: string;
            street: string;
            postalCode: string;
            isDefault: boolean;
        };
        items: {
            id: string;
            productId: string | null;
            name: string;
            price: import("@prisma/client/runtime/library").Decimal;
            orderId: string;
            subtotal: import("@prisma/client/runtime/library").Decimal;
            quantity: number;
            serviceId: string | null;
        }[];
    } & {
        id: string;
        userId: string;
        createdAt: Date;
        updatedAt: Date;
        status: import(".prisma/client").$Enums.OrderStatus;
        orderNumber: string | null;
        addressId: string | null;
        voucherUseId: string | null;
        subtotal: import("@prisma/client/runtime/library").Decimal;
        discountAmount: import("@prisma/client/runtime/library").Decimal;
        shippingCost: import("@prisma/client/runtime/library").Decimal;
        total: import("@prisma/client/runtime/library").Decimal;
        notes: string | null;
        paymentMethod: string | null;
        paymentProof: string | null;
        paidAt: Date | null;
        shippingCourier: string | null;
        trackingNumber: string | null;
    }>;
    findAll(req: any, status?: string): Promise<({
        user: {
            id: string;
            name: string;
            email: string;
        };
        address: {
            id: string;
            userId: string;
            createdAt: Date;
            updatedAt: Date;
            phone: string;
            city: string;
            province: string;
            label: string;
            recipient: string;
            street: string;
            postalCode: string;
            isDefault: boolean;
        };
        items: ({
            product: {
                id: string;
                name: string;
                images: string[];
            };
            service: {
                id: string;
                name: string;
                images: string[];
            };
        } & {
            id: string;
            productId: string | null;
            name: string;
            price: import("@prisma/client/runtime/library").Decimal;
            orderId: string;
            subtotal: import("@prisma/client/runtime/library").Decimal;
            quantity: number;
            serviceId: string | null;
        })[];
    } & {
        id: string;
        userId: string;
        createdAt: Date;
        updatedAt: Date;
        status: import(".prisma/client").$Enums.OrderStatus;
        orderNumber: string | null;
        addressId: string | null;
        voucherUseId: string | null;
        subtotal: import("@prisma/client/runtime/library").Decimal;
        discountAmount: import("@prisma/client/runtime/library").Decimal;
        shippingCost: import("@prisma/client/runtime/library").Decimal;
        total: import("@prisma/client/runtime/library").Decimal;
        notes: string | null;
        paymentMethod: string | null;
        paymentProof: string | null;
        paidAt: Date | null;
        shippingCourier: string | null;
        trackingNumber: string | null;
    })[]>;
    findOne(req: any, id: string): Promise<{
        user: {
            id: string;
            name: string;
            email: string;
            phone: string;
        };
        address: {
            id: string;
            userId: string;
            createdAt: Date;
            updatedAt: Date;
            phone: string;
            city: string;
            province: string;
            label: string;
            recipient: string;
            street: string;
            postalCode: string;
            isDefault: boolean;
        };
        items: ({
            product: {
                id: string;
                name: string;
                images: string[];
            };
            service: {
                id: string;
                name: string;
                images: string[];
            };
        } & {
            id: string;
            productId: string | null;
            name: string;
            price: import("@prisma/client/runtime/library").Decimal;
            orderId: string;
            subtotal: import("@prisma/client/runtime/library").Decimal;
            quantity: number;
            serviceId: string | null;
        })[];
        voucherUse: {
            voucher: {
                id: string;
                createdAt: Date;
                description: string | null;
                isActive: boolean;
                updatedAt: Date;
                value: import("@prisma/client/runtime/library").Decimal;
                code: string;
                type: import(".prisma/client").$Enums.VoucherType;
                minPurchase: import("@prisma/client/runtime/library").Decimal;
                maxDiscount: import("@prisma/client/runtime/library").Decimal | null;
                quota: number;
                usedCount: number;
                startDate: Date | null;
                endDate: Date | null;
            };
        } & {
            id: string;
            userId: string;
            voucherId: string;
            usedAt: Date;
        };
    } & {
        id: string;
        userId: string;
        createdAt: Date;
        updatedAt: Date;
        status: import(".prisma/client").$Enums.OrderStatus;
        orderNumber: string | null;
        addressId: string | null;
        voucherUseId: string | null;
        subtotal: import("@prisma/client/runtime/library").Decimal;
        discountAmount: import("@prisma/client/runtime/library").Decimal;
        shippingCost: import("@prisma/client/runtime/library").Decimal;
        total: import("@prisma/client/runtime/library").Decimal;
        notes: string | null;
        paymentMethod: string | null;
        paymentProof: string | null;
        paidAt: Date | null;
        shippingCourier: string | null;
        trackingNumber: string | null;
    }>;
    updateStatus(id: string, dto: UpdateOrderStatusDto): Promise<{
        id: string;
        userId: string;
        createdAt: Date;
        updatedAt: Date;
        status: import(".prisma/client").$Enums.OrderStatus;
        orderNumber: string | null;
        addressId: string | null;
        voucherUseId: string | null;
        subtotal: import("@prisma/client/runtime/library").Decimal;
        discountAmount: import("@prisma/client/runtime/library").Decimal;
        shippingCost: import("@prisma/client/runtime/library").Decimal;
        total: import("@prisma/client/runtime/library").Decimal;
        notes: string | null;
        paymentMethod: string | null;
        paymentProof: string | null;
        paidAt: Date | null;
        shippingCourier: string | null;
        trackingNumber: string | null;
    }>;
    sendBotMessage(req: any, id: string): Promise<{
        message: string;
    }>;
    uploadPayment(req: any, id: string, dto: UploadPaymentDto): Promise<{
        id: string;
        userId: string;
        createdAt: Date;
        updatedAt: Date;
        status: import(".prisma/client").$Enums.OrderStatus;
        orderNumber: string | null;
        addressId: string | null;
        voucherUseId: string | null;
        subtotal: import("@prisma/client/runtime/library").Decimal;
        discountAmount: import("@prisma/client/runtime/library").Decimal;
        shippingCost: import("@prisma/client/runtime/library").Decimal;
        total: import("@prisma/client/runtime/library").Decimal;
        notes: string | null;
        paymentMethod: string | null;
        paymentProof: string | null;
        paidAt: Date | null;
        shippingCourier: string | null;
        trackingNumber: string | null;
    }>;
}
