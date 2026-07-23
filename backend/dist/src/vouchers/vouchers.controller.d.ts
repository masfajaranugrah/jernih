import { VouchersService } from './vouchers.service';
import { CreateVoucherDto } from './dto/create-voucher.dto';
export declare class VouchersController {
    private vouchersService;
    constructor(vouchersService: VouchersService);
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
    findAvailable(req: any): Promise<{
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
    validate(req: any, body: {
        code: string;
        subtotal: number;
    }): Promise<{
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
