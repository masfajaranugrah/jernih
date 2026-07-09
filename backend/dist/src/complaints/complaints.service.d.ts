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
        createdAt: Date;
        updatedAt: Date;
        userId: string;
        description: string;
        images: string[];
        mitraId: string | null;
        status: import(".prisma/client").$Enums.ComplaintStatus;
        orderId: string | null;
        title: string;
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
        createdAt: Date;
        updatedAt: Date;
        userId: string;
        description: string;
        images: string[];
        mitraId: string | null;
        status: import(".prisma/client").$Enums.ComplaintStatus;
        orderId: string | null;
        title: string;
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
            createdAt: Date;
            updatedAt: Date;
            userId: string;
            total: import("@prisma/client/runtime/library").Decimal;
            notes: string | null;
            status: import(".prisma/client").$Enums.OrderStatus;
            addressId: string | null;
            paymentMethod: string | null;
            shippingCost: import("@prisma/client/runtime/library").Decimal;
            voucherUseId: string | null;
            subtotal: import("@prisma/client/runtime/library").Decimal;
            discountAmount: import("@prisma/client/runtime/library").Decimal;
            paymentProof: string | null;
            paidAt: Date | null;
        };
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        userId: string;
        description: string;
        images: string[];
        mitraId: string | null;
        status: import(".prisma/client").$Enums.ComplaintStatus;
        orderId: string | null;
        title: string;
        resolution: string | null;
    }>;
    update(id: string, dto: UpdateComplaintDto): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        userId: string;
        description: string;
        images: string[];
        mitraId: string | null;
        status: import(".prisma/client").$Enums.ComplaintStatus;
        orderId: string | null;
        title: string;
        resolution: string | null;
    }>;
}
