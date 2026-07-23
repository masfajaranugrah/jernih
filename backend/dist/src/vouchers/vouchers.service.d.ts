import { PrismaService } from '../prisma/prisma.service';
import { CreateVoucherDto } from './dto/create-voucher.dto';
export declare class VouchersService {
    private prisma;
    constructor(prisma: PrismaService);
    create(dto: CreateVoucherDto): Promise<{
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
    }>;
    findAll(): Promise<{
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
    }[]>;
    findAvailable(userId: string): Promise<{
        used: boolean;
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
    }[]>;
    findOne(id: string): Promise<{
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
    }>;
    validate(code: string, userId: string, subtotal: number): Promise<{
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
        discount: number;
    }>;
    remove(id: string): Promise<{
        message: string;
    }>;
}
