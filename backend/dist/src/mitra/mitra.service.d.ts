import { PrismaService } from '../prisma/prisma.service';
import { CreateMitraDto } from './dto/create-mitra.dto';
import { UpdateMitraDto } from './dto/update-mitra.dto';
export declare class MitraService {
    private prisma;
    constructor(prisma: PrismaService);
    create(userId: string, dto: CreateMitraDto): Promise<{
        id: string;
        isActive: boolean;
        createdAt: Date;
        updatedAt: Date;
        userId: string;
        storeName: string;
        description: string | null;
        logo: string | null;
        banner: string | null;
        address: string | null;
        city: string | null;
        province: string | null;
        isVerified: boolean;
        rating: number;
        totalReviews: number;
    }>;
    findAll(query?: {
        city?: string;
        isVerified?: boolean;
    }): Promise<({
        user: {
            email: string;
            name: string;
            avatar: string;
        };
        _count: {
            services: number;
        };
    } & {
        id: string;
        isActive: boolean;
        createdAt: Date;
        updatedAt: Date;
        userId: string;
        storeName: string;
        description: string | null;
        logo: string | null;
        banner: string | null;
        address: string | null;
        city: string | null;
        province: string | null;
        isVerified: boolean;
        rating: number;
        totalReviews: number;
    })[]>;
    findOne(id: string): Promise<{
        user: {
            email: string;
            name: string;
            avatar: string;
        };
        _count: {
            rentals: number;
            services: number;
        };
        services: {
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
        }[];
    } & {
        id: string;
        isActive: boolean;
        createdAt: Date;
        updatedAt: Date;
        userId: string;
        storeName: string;
        description: string | null;
        logo: string | null;
        banner: string | null;
        address: string | null;
        city: string | null;
        province: string | null;
        isVerified: boolean;
        rating: number;
        totalReviews: number;
    }>;
    findByUser(userId: string): Promise<{
        _count: {
            rentals: number;
            services: number;
        };
    } & {
        id: string;
        isActive: boolean;
        createdAt: Date;
        updatedAt: Date;
        userId: string;
        storeName: string;
        description: string | null;
        logo: string | null;
        banner: string | null;
        address: string | null;
        city: string | null;
        province: string | null;
        isVerified: boolean;
        rating: number;
        totalReviews: number;
    }>;
    update(id: string, dto: UpdateMitraDto): Promise<{
        id: string;
        isActive: boolean;
        createdAt: Date;
        updatedAt: Date;
        userId: string;
        storeName: string;
        description: string | null;
        logo: string | null;
        banner: string | null;
        address: string | null;
        city: string | null;
        province: string | null;
        isVerified: boolean;
        rating: number;
        totalReviews: number;
    }>;
    updateSafe(id: string, dto: UpdateMitraDto, userId: string): Promise<{
        id: string;
        isActive: boolean;
        createdAt: Date;
        updatedAt: Date;
        userId: string;
        storeName: string;
        description: string | null;
        logo: string | null;
        banner: string | null;
        address: string | null;
        city: string | null;
        province: string | null;
        isVerified: boolean;
        rating: number;
        totalReviews: number;
    }>;
    verify(id: string): Promise<{
        id: string;
        isActive: boolean;
        createdAt: Date;
        updatedAt: Date;
        userId: string;
        storeName: string;
        description: string | null;
        logo: string | null;
        banner: string | null;
        address: string | null;
        city: string | null;
        province: string | null;
        isVerified: boolean;
        rating: number;
        totalReviews: number;
    }>;
}
