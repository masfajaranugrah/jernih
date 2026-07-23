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
            phone: string;
            createdAt: Date;
            updatedAt: Date;
            userId: string;
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
            name: string;
            price: import("@prisma/client/runtime/library").Decimal;
            productId: string | null;
            serviceId: string | null;
            quantity: number;
            subtotal: import("@prisma/client/runtime/library").Decimal;
            orderId: string;
        }[];
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        userId: string;
        total: import("@prisma/client/runtime/library").Decimal;
        notes: string | null;
        status: import(".prisma/client").$Enums.OrderStatus;
        orderNumber: string | null;
        addressId: string | null;
        paymentMethod: string | null;
        shippingCost: import("@prisma/client/runtime/library").Decimal;
        shippingCourier: string | null;
        trackingNumber: string | null;
        voucherUseId: string | null;
        subtotal: import("@prisma/client/runtime/library").Decimal;
        discountAmount: import("@prisma/client/runtime/library").Decimal;
        paymentProof: string | null;
        paidAt: Date | null;
    }>;
    findAll(req: any, status?: string): Promise<({
        user: {
            id: string;
            email: string;
            name: string;
        };
        address: {
            id: string;
            phone: string;
            createdAt: Date;
            updatedAt: Date;
            userId: string;
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
            name: string;
            price: import("@prisma/client/runtime/library").Decimal;
            productId: string | null;
            serviceId: string | null;
            quantity: number;
            subtotal: import("@prisma/client/runtime/library").Decimal;
            orderId: string;
        })[];
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        userId: string;
        total: import("@prisma/client/runtime/library").Decimal;
        notes: string | null;
        status: import(".prisma/client").$Enums.OrderStatus;
        orderNumber: string | null;
        addressId: string | null;
        paymentMethod: string | null;
        shippingCost: import("@prisma/client/runtime/library").Decimal;
        shippingCourier: string | null;
        trackingNumber: string | null;
        voucherUseId: string | null;
        subtotal: import("@prisma/client/runtime/library").Decimal;
        discountAmount: import("@prisma/client/runtime/library").Decimal;
        paymentProof: string | null;
        paidAt: Date | null;
    })[]>;
    findOne(req: any, id: string): Promise<{
        user: {
            id: string;
            email: string;
            name: string;
            phone: string;
        };
        address: {
            id: string;
            phone: string;
            createdAt: Date;
            updatedAt: Date;
            userId: string;
            city: string;
            province: string;
            label: string;
            recipient: string;
            street: string;
            postalCode: string;
            isDefault: boolean;
        };
        voucherUse: {
            voucher: {
                id: string;
                isActive: boolean;
                createdAt: Date;
                updatedAt: Date;
                description: string | null;
                startDate: Date | null;
                endDate: Date | null;
                code: string;
                type: import(".prisma/client").$Enums.VoucherType;
                value: import("@prisma/client/runtime/library").Decimal;
                minPurchase: import("@prisma/client/runtime/library").Decimal;
                maxDiscount: import("@prisma/client/runtime/library").Decimal | null;
                quota: number;
                usedCount: number;
            };
        } & {
            id: string;
            userId: string;
            voucherId: string;
            usedAt: Date;
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
            name: string;
            price: import("@prisma/client/runtime/library").Decimal;
            productId: string | null;
            serviceId: string | null;
            quantity: number;
            subtotal: import("@prisma/client/runtime/library").Decimal;
            orderId: string;
        })[];
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        userId: string;
        total: import("@prisma/client/runtime/library").Decimal;
        notes: string | null;
        status: import(".prisma/client").$Enums.OrderStatus;
        orderNumber: string | null;
        addressId: string | null;
        paymentMethod: string | null;
        shippingCost: import("@prisma/client/runtime/library").Decimal;
        shippingCourier: string | null;
        trackingNumber: string | null;
        voucherUseId: string | null;
        subtotal: import("@prisma/client/runtime/library").Decimal;
        discountAmount: import("@prisma/client/runtime/library").Decimal;
        paymentProof: string | null;
        paidAt: Date | null;
    }>;
    updateStatus(id: string, dto: UpdateOrderStatusDto): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        userId: string;
        total: import("@prisma/client/runtime/library").Decimal;
        notes: string | null;
        status: import(".prisma/client").$Enums.OrderStatus;
        orderNumber: string | null;
        addressId: string | null;
        paymentMethod: string | null;
        shippingCost: import("@prisma/client/runtime/library").Decimal;
        shippingCourier: string | null;
        trackingNumber: string | null;
        voucherUseId: string | null;
        subtotal: import("@prisma/client/runtime/library").Decimal;
        discountAmount: import("@prisma/client/runtime/library").Decimal;
        paymentProof: string | null;
        paidAt: Date | null;
    }>;
    sendBotMessage(req: any, id: string): Promise<{
        message: string;
    }>;
    uploadPayment(req: any, id: string, dto: UploadPaymentDto): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        userId: string;
        total: import("@prisma/client/runtime/library").Decimal;
        notes: string | null;
        status: import(".prisma/client").$Enums.OrderStatus;
        orderNumber: string | null;
        addressId: string | null;
        paymentMethod: string | null;
        shippingCost: import("@prisma/client/runtime/library").Decimal;
        shippingCourier: string | null;
        trackingNumber: string | null;
        voucherUseId: string | null;
        subtotal: import("@prisma/client/runtime/library").Decimal;
        discountAmount: import("@prisma/client/runtime/library").Decimal;
        paymentProof: string | null;
        paidAt: Date | null;
    }>;
}
