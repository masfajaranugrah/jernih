import { ComplaintStatus } from '@prisma/client';
export declare class UpdateComplaintDto {
    status?: ComplaintStatus;
    resolution?: string;
}
