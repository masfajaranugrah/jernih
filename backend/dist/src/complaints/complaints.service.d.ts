import { PrismaService } from '../prisma/prisma.service';
import { CreateComplaintDto } from './dto/create-complaint.dto';
import { UpdateComplaintDto } from './dto/update-complaint.dto';
export declare class ComplaintsService {
    private prisma;
    constructor(prisma: PrismaService);
    create(userId: string, dto: CreateComplaintDto): Promise<{
        user: {
            id: string;
            name: string;
            email: string;
        };
    } & {
        id: string;
        userId: string;
        createdAt: Date;
        description: string;
        images: string[];
        updatedAt: Date;
        mitraId: string | null;
        orderId: string | null;
        title: string;
        status: import(".prisma/client").$Enums.ComplaintStatus;
        resolution: string | null;
    }>;
    findAll(userId?: string): Promise<({
        user: {
            id: string;
            name: string;
        };
        order: {
            id: string;
            total: import("@prisma/client/runtime/library").Decimal;
        };
    } & {
        id: string;
        userId: string;
        createdAt: Date;
        description: string;
        images: string[];
        updatedAt: Date;
        mitraId: string | null;
        orderId: string | null;
        title: string;
        status: import(".prisma/client").$Enums.ComplaintStatus;
        resolution: string | null;
    })[]>;
    findOne(id: string): Promise<{
        user: {
            id: string;
            name: string;
            email: string;
        };
        mitra: {
            id: string;
            storeName: string;
        };
        order: {
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
        };
    } & {
        id: string;
        userId: string;
        createdAt: Date;
        description: string;
        images: string[];
        updatedAt: Date;
        mitraId: string | null;
        orderId: string | null;
        title: string;
        status: import(".prisma/client").$Enums.ComplaintStatus;
        resolution: string | null;
    }>;
    findOneSafe(id: string, requesterId: string, requesterRole: string): Promise<{
        user: {
            id: string;
            name: string;
            email: string;
        };
        mitra: {
            id: string;
            storeName: string;
        };
        order: {
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
        };
    } & {
        id: string;
        userId: string;
        createdAt: Date;
        description: string;
        images: string[];
        updatedAt: Date;
        mitraId: string | null;
        orderId: string | null;
        title: string;
        status: import(".prisma/client").$Enums.ComplaintStatus;
        resolution: string | null;
    }>;
    update(id: string, dto: UpdateComplaintDto): Promise<{
        id: string;
        userId: string;
        createdAt: Date;
        description: string;
        images: string[];
        updatedAt: Date;
        mitraId: string | null;
        orderId: string | null;
        title: string;
        status: import(".prisma/client").$Enums.ComplaintStatus;
        resolution: string | null;
    }>;
}
