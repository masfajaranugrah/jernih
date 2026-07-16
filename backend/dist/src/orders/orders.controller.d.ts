import { OrdersService } from './orders.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderStatusDto } from './dto/update-order-status.dto';
export declare class OrdersController {
    private ordersService;
    constructor(ordersService: OrdersService);
    create(req: any, dto: CreateOrderDto): Promise<{
        address: {
            id: string;
            createdAt: Date;
            phone: string;
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
            subtotal: import("@prisma/client/runtime/library").Decimal;
            quantity: number;
            productId: string | null;
            serviceId: string | null;
            orderId: string;
        }[];
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        userId: string;
        total: import("@prisma/client/runtime/library").Decimal;
        status: import(".prisma/client").$Enums.OrderStatus;
        notes: string | null;
        addressId: string | null;
        voucherUseId: string | null;
        subtotal: import("@prisma/client/runtime/library").Decimal;
        discountAmount: import("@prisma/client/runtime/library").Decimal;
        shippingCost: import("@prisma/client/runtime/library").Decimal;
        paymentMethod: string | null;
        paymentProof: string | null;
        paidAt: Date | null;
    }>;
    findAll(req: any, status?: string): Promise<({
        user: {
            id: string;
            name: string;
            email: string;
        };
        address: {
            id: string;
            createdAt: Date;
            phone: string;
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
            subtotal: import("@prisma/client/runtime/library").Decimal;
            quantity: number;
            productId: string | null;
            serviceId: string | null;
            orderId: string;
        }[];
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        userId: string;
        total: import("@prisma/client/runtime/library").Decimal;
        status: import(".prisma/client").$Enums.OrderStatus;
        notes: string | null;
        addressId: string | null;
        voucherUseId: string | null;
        subtotal: import("@prisma/client/runtime/library").Decimal;
        discountAmount: import("@prisma/client/runtime/library").Decimal;
        shippingCost: import("@prisma/client/runtime/library").Decimal;
        paymentMethod: string | null;
        paymentProof: string | null;
        paidAt: Date | null;
    })[]>;
    findOne(id: string): Promise<{
        user: {
            id: string;
            name: string;
            email: string;
            phone: string;
        };
        address: {
            id: string;
            createdAt: Date;
            phone: string;
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
                createdAt: Date;
                isActive: boolean;
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
            subtotal: import("@prisma/client/runtime/library").Decimal;
            quantity: number;
            productId: string | null;
            serviceId: string | null;
            orderId: string;
        })[];
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        userId: string;
        total: import("@prisma/client/runtime/library").Decimal;
        status: import(".prisma/client").$Enums.OrderStatus;
        notes: string | null;
        addressId: string | null;
        voucherUseId: string | null;
        subtotal: import("@prisma/client/runtime/library").Decimal;
        discountAmount: import("@prisma/client/runtime/library").Decimal;
        shippingCost: import("@prisma/client/runtime/library").Decimal;
        paymentMethod: string | null;
        paymentProof: string | null;
        paidAt: Date | null;
    }>;
    updateStatus(id: string, dto: UpdateOrderStatusDto): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        userId: string;
        total: import("@prisma/client/runtime/library").Decimal;
        status: import(".prisma/client").$Enums.OrderStatus;
        notes: string | null;
        addressId: string | null;
        voucherUseId: string | null;
        subtotal: import("@prisma/client/runtime/library").Decimal;
        discountAmount: import("@prisma/client/runtime/library").Decimal;
        shippingCost: import("@prisma/client/runtime/library").Decimal;
        paymentMethod: string | null;
        paymentProof: string | null;
        paidAt: Date | null;
    }>;
}
