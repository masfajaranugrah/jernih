import { VoucherType } from '@prisma/client';
export declare class CreateVoucherDto {
    code: string;
    description?: string;
    type: VoucherType;
    value: number;
    minPurchase?: number;
    maxDiscount?: number;
    quota?: number;
    isActive?: boolean;
    startDate?: string;
    endDate?: string;
}
