import { PrismaService } from '../prisma/prisma.service';
import { CreateServiceDto } from './dto/create-service.dto';
import { UpdateServiceDto } from './dto/update-service.dto';
export declare class ServicesService {
    private prisma;
    constructor(prisma: PrismaService);
    create(dto: CreateServiceDto): Promise<{
        id: string;
        createdAt: Date;
        name: string;
        slug: string;
        categoryId: string | null;
        description: string | null;
        images: string[];
        isActive: boolean;
        rating: number;
        updatedAt: Date;
        mitraId: string | null;
        priceFrom: import("@prisma/client/runtime/library").Decimal;
        unit: string;
    }>;
    findAll(query?: {
        search?: string;
        categoryId?: string;
        mitraId?: string;
    }): Promise<({
        category: {
            id: string;
            name: string;
        };
        mitra: {
            id: string;
            storeName: string;
            city: string;
        };
    } & {
        id: string;
        createdAt: Date;
        name: string;
        slug: string;
        categoryId: string | null;
        description: string | null;
        images: string[];
        isActive: boolean;
        rating: number;
        updatedAt: Date;
        mitraId: string | null;
        priceFrom: import("@prisma/client/runtime/library").Decimal;
        unit: string;
    })[]>;
    findOne(id: string): Promise<{
        category: {
            id: string;
            createdAt: Date;
            name: string;
            slug: string;
            icon: string | null;
        };
        mitra: {
            id: string;
            rating: number;
            storeName: string;
            logo: string;
            city: string;
        };
    } & {
        id: string;
        createdAt: Date;
        name: string;
        slug: string;
        categoryId: string | null;
        description: string | null;
        images: string[];
        isActive: boolean;
        rating: number;
        updatedAt: Date;
        mitraId: string | null;
        priceFrom: import("@prisma/client/runtime/library").Decimal;
        unit: string;
    }>;
    findBySlug(slug: string): Promise<{
        category: {
            id: string;
            createdAt: Date;
            name: string;
            slug: string;
            icon: string | null;
        };
        mitra: {
            id: string;
            rating: number;
            storeName: string;
            logo: string;
            city: string;
        };
    } & {
        id: string;
        createdAt: Date;
        name: string;
        slug: string;
        categoryId: string | null;
        description: string | null;
        images: string[];
        isActive: boolean;
        rating: number;
        updatedAt: Date;
        mitraId: string | null;
        priceFrom: import("@prisma/client/runtime/library").Decimal;
        unit: string;
    }>;
    update(id: string, dto: UpdateServiceDto): Promise<{
        id: string;
        createdAt: Date;
        name: string;
        slug: string;
        categoryId: string | null;
        description: string | null;
        images: string[];
        isActive: boolean;
        rating: number;
        updatedAt: Date;
        mitraId: string | null;
        priceFrom: import("@prisma/client/runtime/library").Decimal;
        unit: string;
    }>;
    remove(id: string): Promise<{
        message: string;
    }>;
}
