import { VouchersService } from './vouchers.service';
import { CreateVoucherDto } from './dto/create-voucher.dto';
export declare class VouchersController {
    private vouchersService;
    constructor(vouchersService: VouchersService);
    create(dto: CreateVoucherDto): Promise<{
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
    }>;
    findAll(): Promise<{
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
    }[]>;
    validate(req: any, body: {
        code: string;
        subtotal: number;
    }): Promise<{
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
        discount: number;
    }>;
    remove(id: string): Promise<{
        message: string;
    }>;
}
