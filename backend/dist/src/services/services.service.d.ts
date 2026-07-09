import { PrismaService } from '../prisma/prisma.service';
import { CreateServiceDto } from './dto/create-service.dto';
import { UpdateServiceDto } from './dto/update-service.dto';
export declare class ServicesService {
    private prisma;
    constructor(prisma: PrismaService);
    create(mitraId: string, dto: CreateServiceDto): Promise<{
        id: string;
        name: string;
        slug: string;
        createdAt: Date;
        isActive: boolean;
        updatedAt: Date;
        description: string | null;
        rating: number;
        categoryId: string | null;
        images: string[];
        mitraId: string;
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
        name: string;
        slug: string;
        createdAt: Date;
        isActive: boolean;
        updatedAt: Date;
        description: string | null;
        rating: number;
        categoryId: string | null;
        images: string[];
        mitraId: string;
        priceFrom: import("@prisma/client/runtime/library").Decimal;
        unit: string;
    })[]>;
    findOne(id: string): Promise<{
        category: {
            id: string;
            name: string;
            slug: string;
            icon: string | null;
            createdAt: Date;
        };
        mitra: {
            id: string;
            storeName: string;
            logo: string;
            city: string;
            rating: number;
        };
    } & {
        id: string;
        name: string;
        slug: string;
        createdAt: Date;
        isActive: boolean;
        updatedAt: Date;
        description: string | null;
        rating: number;
        categoryId: string | null;
        images: string[];
        mitraId: string;
        priceFrom: import("@prisma/client/runtime/library").Decimal;
        unit: string;
    }>;
    findBySlug(slug: string): Promise<{
        category: {
            id: string;
            name: string;
            slug: string;
            icon: string | null;
            createdAt: Date;
        };
        mitra: {
            id: string;
            storeName: string;
            logo: string;
            city: string;
            rating: number;
        };
    } & {
        id: string;
        name: string;
        slug: string;
        createdAt: Date;
        isActive: boolean;
        updatedAt: Date;
        description: string | null;
        rating: number;
        categoryId: string | null;
        images: string[];
        mitraId: string;
        priceFrom: import("@prisma/client/runtime/library").Decimal;
        unit: string;
    }>;
    update(id: string, dto: UpdateServiceDto): Promise<{
        id: string;
        name: string;
        slug: string;
        createdAt: Date;
        isActive: boolean;
        updatedAt: Date;
        description: string | null;
        rating: number;
        categoryId: string | null;
        images: string[];
        mitraId: string;
        priceFrom: import("@prisma/client/runtime/library").Decimal;
        unit: string;
    }>;
    remove(id: string): Promise<{
        message: string;
    }>;
}
