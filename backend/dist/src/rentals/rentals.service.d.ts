import { PrismaService } from '../prisma/prisma.service';
import { CreateRentalDto } from './dto/create-rental.dto';
import { UpdateRentalDto } from './dto/update-rental.dto';
export declare class RentalsService {
    private prisma;
    constructor(prisma: PrismaService);
    create(userId: string, dto: CreateRentalDto): Promise<{
        rentalItem: {
            id: string;
            name: string;
            slug: string;
            createdAt: Date;
            isActive: boolean;
            updatedAt: Date;
            description: string | null;
            rating: number;
            images: string[];
            mitraId: string;
            pricePerDay: import("@prisma/client/runtime/library").Decimal;
            deposit: import("@prisma/client/runtime/library").Decimal | null;
        };
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        userId: string;
        mitraId: string;
        rentalItemId: string;
        startDate: Date;
        endDate: Date;
        notes: string | null;
        status: import(".prisma/client").$Enums.RentalStatus;
        totalDays: number;
        totalPrice: import("@prisma/client/runtime/library").Decimal;
    }>;
    findAll(userId?: string, mitraId?: string): Promise<({
        user: {
            id: string;
            name: string;
            email: string;
        };
        rentalItem: {
            id: string;
            name: string;
            slug: string;
            createdAt: Date;
            isActive: boolean;
            updatedAt: Date;
            description: string | null;
            rating: number;
            images: string[];
            mitraId: string;
            pricePerDay: import("@prisma/client/runtime/library").Decimal;
            deposit: import("@prisma/client/runtime/library").Decimal | null;
        };
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        userId: string;
        mitraId: string;
        rentalItemId: string;
        startDate: Date;
        endDate: Date;
        notes: string | null;
        status: import(".prisma/client").$Enums.RentalStatus;
        totalDays: number;
        totalPrice: import("@prisma/client/runtime/library").Decimal;
    })[]>;
    findOne(id: string): Promise<{
        user: {
            id: string;
            name: string;
            email: string;
            phone: string;
        };
        mitra: {
            id: string;
            storeName: string;
        };
        rentalItem: {
            id: string;
            name: string;
            slug: string;
            createdAt: Date;
            isActive: boolean;
            updatedAt: Date;
            description: string | null;
            rating: number;
            images: string[];
            mitraId: string;
            pricePerDay: import("@prisma/client/runtime/library").Decimal;
            deposit: import("@prisma/client/runtime/library").Decimal | null;
        };
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        userId: string;
        mitraId: string;
        rentalItemId: string;
        startDate: Date;
        endDate: Date;
        notes: string | null;
        status: import(".prisma/client").$Enums.RentalStatus;
        totalDays: number;
        totalPrice: import("@prisma/client/runtime/library").Decimal;
    }>;
    update(id: string, dto: UpdateRentalDto): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        userId: string;
        mitraId: string;
        rentalItemId: string;
        startDate: Date;
        endDate: Date;
        notes: string | null;
        status: import(".prisma/client").$Enums.RentalStatus;
        totalDays: number;
        totalPrice: import("@prisma/client/runtime/library").Decimal;
    }>;
    findAllItems(query?: {
        search?: string;
    }): Promise<{
        id: string;
        name: string;
        slug: string;
        createdAt: Date;
        isActive: boolean;
        updatedAt: Date;
        description: string | null;
        rating: number;
        images: string[];
        mitraId: string;
        pricePerDay: import("@prisma/client/runtime/library").Decimal;
        deposit: import("@prisma/client/runtime/library").Decimal | null;
    }[]>;
}
