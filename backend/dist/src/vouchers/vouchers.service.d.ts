import { PrismaService } from '../prisma/prisma.service';
import { CreateVoucherDto } from './dto/create-voucher.dto';
export declare class VouchersService {
    private prisma;
    constructor(prisma: PrismaService);
    create(dto: CreateVoucherDto): Promise<{
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
    }>;
    findAll(): Promise<{
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
    }[]>;
    findAvailable(userId: string): Promise<{
        used: boolean;
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
    }[]>;
    findOne(id: string): Promise<{
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
    }>;
    validate(code: string, userId: string, subtotal: number): Promise<{
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
        discount: number;
    }>;
    remove(id: string): Promise<{
        message: string;
    }>;
}
