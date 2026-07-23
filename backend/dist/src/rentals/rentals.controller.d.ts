import { RentalsService } from './rentals.service';
import { CreateRentalDto } from './dto/create-rental.dto';
import { UpdateRentalDto } from './dto/update-rental.dto';
import { CreateRentalItemDto } from './dto/create-rental-item.dto';
import { UpdateRentalItemDto } from './dto/update-rental-item.dto';
export declare class RentalsController {
    private rentalsService;
    constructor(rentalsService: RentalsService);
    findAllItems(search?: string, all?: string): Promise<{
        id: string;
        name: string;
        isActive: boolean;
        createdAt: Date;
        updatedAt: Date;
        slug: string;
        description: string | null;
        rating: number;
        images: string[];
        mitraId: string | null;
        pricePerDay: import("@prisma/client/runtime/library").Decimal;
        deposit: import("@prisma/client/runtime/library").Decimal | null;
    }[]>;
    findItemById(id: string): Promise<{
        id: string;
        name: string;
        isActive: boolean;
        createdAt: Date;
        updatedAt: Date;
        slug: string;
        description: string | null;
        rating: number;
        images: string[];
        mitraId: string | null;
        pricePerDay: import("@prisma/client/runtime/library").Decimal;
        deposit: import("@prisma/client/runtime/library").Decimal | null;
    }>;
    findItemBySlug(slug: string): Promise<{
        id: string;
        name: string;
        isActive: boolean;
        createdAt: Date;
        updatedAt: Date;
        slug: string;
        description: string | null;
        rating: number;
        images: string[];
        mitraId: string | null;
        pricePerDay: import("@prisma/client/runtime/library").Decimal;
        deposit: import("@prisma/client/runtime/library").Decimal | null;
    }>;
    createItem(dto: CreateRentalItemDto): Promise<{
        id: string;
        name: string;
        isActive: boolean;
        createdAt: Date;
        updatedAt: Date;
        slug: string;
        description: string | null;
        rating: number;
        images: string[];
        mitraId: string | null;
        pricePerDay: import("@prisma/client/runtime/library").Decimal;
        deposit: import("@prisma/client/runtime/library").Decimal | null;
    }>;
    updateItem(id: string, dto: UpdateRentalItemDto): Promise<{
        id: string;
        name: string;
        isActive: boolean;
        createdAt: Date;
        updatedAt: Date;
        slug: string;
        description: string | null;
        rating: number;
        images: string[];
        mitraId: string | null;
        pricePerDay: import("@prisma/client/runtime/library").Decimal;
        deposit: import("@prisma/client/runtime/library").Decimal | null;
    }>;
    removeItem(id: string): Promise<{
        id: string;
        name: string;
        isActive: boolean;
        createdAt: Date;
        updatedAt: Date;
        slug: string;
        description: string | null;
        rating: number;
        images: string[];
        mitraId: string | null;
        pricePerDay: import("@prisma/client/runtime/library").Decimal;
        deposit: import("@prisma/client/runtime/library").Decimal | null;
    }>;
    create(req: any, dto: CreateRentalDto): Promise<{
        rentalItem: {
            id: string;
            name: string;
            isActive: boolean;
            createdAt: Date;
            updatedAt: Date;
            slug: string;
            description: string | null;
            rating: number;
            images: string[];
            mitraId: string | null;
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
    findAll(req: any, mitraId?: string): Promise<({
        user: {
            id: string;
            email: string;
            name: string;
        };
        rentalItem: {
            id: string;
            name: string;
            isActive: boolean;
            createdAt: Date;
            updatedAt: Date;
            slug: string;
            description: string | null;
            rating: number;
            images: string[];
            mitraId: string | null;
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
    findOne(req: any, id: string): Promise<{
        user: {
            id: string;
            email: string;
            name: string;
            phone: string;
        };
        mitra: {
            id: string;
            storeName: string;
        };
        rentalItem: {
            id: string;
            name: string;
            isActive: boolean;
            createdAt: Date;
            updatedAt: Date;
            slug: string;
            description: string | null;
            rating: number;
            images: string[];
            mitraId: string | null;
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
}
