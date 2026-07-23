import { PrismaService } from '../prisma/prisma.service';
import { CreateServiceDto } from './dto/create-service.dto';
import { UpdateServiceDto } from './dto/update-service.dto';
export declare class ServicesService {
    private prisma;
    constructor(prisma: PrismaService);
    create(dto: CreateServiceDto): Promise<{
        id: string;
        name: string;
        isActive: boolean;
        createdAt: Date;
        updatedAt: Date;
        slug: string;
        description: string | null;
        rating: number;
        categoryId: string | null;
        images: string[];
        mitraId: string | null;
        priceFrom: import("@prisma/client/runtime/library").Decimal;
        unit: string;
    }>;
    findAll(query?: {
        search?: string;
        categoryId?: string;
        mitraId?: string;
    }): Promise<({
        mitra: {
            id: string;
            storeName: string;
            city: string;
        };
        category: {
            id: string;
            name: string;
        };
    } & {
        id: string;
        name: string;
        isActive: boolean;
        createdAt: Date;
        updatedAt: Date;
        slug: string;
        description: string | null;
        rating: number;
        categoryId: string | null;
        images: string[];
        mitraId: string | null;
        priceFrom: import("@prisma/client/runtime/library").Decimal;
        unit: string;
    })[]>;
    findOne(id: string): Promise<{
        mitra: {
            id: string;
            storeName: string;
            logo: string;
            city: string;
            rating: number;
        };
        category: {
            id: string;
            name: string;
            createdAt: Date;
            slug: string;
            icon: string | null;
        };
    } & {
        id: string;
        name: string;
        isActive: boolean;
        createdAt: Date;
        updatedAt: Date;
        slug: string;
        description: string | null;
        rating: number;
        categoryId: string | null;
        images: string[];
        mitraId: string | null;
        priceFrom: import("@prisma/client/runtime/library").Decimal;
        unit: string;
    }>;
    findBySlug(slug: string): Promise<{
        mitra: {
            id: string;
            storeName: string;
            logo: string;
            city: string;
            rating: number;
        };
        category: {
            id: string;
            name: string;
            createdAt: Date;
            slug: string;
            icon: string | null;
        };
    } & {
        id: string;
        name: string;
        isActive: boolean;
        createdAt: Date;
        updatedAt: Date;
        slug: string;
        description: string | null;
        rating: number;
        categoryId: string | null;
        images: string[];
        mitraId: string | null;
        priceFrom: import("@prisma/client/runtime/library").Decimal;
        unit: string;
    }>;
    update(id: string, dto: UpdateServiceDto): Promise<{
        id: string;
        name: string;
        isActive: boolean;
        createdAt: Date;
        updatedAt: Date;
        slug: string;
        description: string | null;
        rating: number;
        categoryId: string | null;
        images: string[];
        mitraId: string | null;
        priceFrom: import("@prisma/client/runtime/library").Decimal;
        unit: string;
    }>;
    remove(id: string): Promise<{
        message: string;
    }>;
}
