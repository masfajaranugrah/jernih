import { PrismaService } from '../prisma/prisma.service';
import { CreateMitraDto } from './dto/create-mitra.dto';
import { UpdateMitraDto } from './dto/update-mitra.dto';
export declare class MitraService {
    private prisma;
    constructor(prisma: PrismaService);
    create(userId: string, dto: CreateMitraDto): Promise<{
        id: string;
        userId: string;
        createdAt: Date;
        description: string | null;
        isActive: boolean;
        rating: number;
        updatedAt: Date;
        address: string | null;
        storeName: string;
        logo: string | null;
        banner: string | null;
        city: string | null;
        province: string | null;
        isVerified: boolean;
        totalReviews: number;
    }>;
    findAll(query?: {
        city?: string;
        isVerified?: boolean;
    }): Promise<({
        user: {
            name: string;
            email: string;
            avatar: string;
        };
        _count: {
            services: number;
        };
    } & {
        id: string;
        userId: string;
        createdAt: Date;
        description: string | null;
        isActive: boolean;
        rating: number;
        updatedAt: Date;
        address: string | null;
        storeName: string;
        logo: string | null;
        banner: string | null;
        city: string | null;
        province: string | null;
        isVerified: boolean;
        totalReviews: number;
    })[]>;
    findOne(id: string): Promise<{
        user: {
            name: string;
            email: string;
            avatar: string;
        };
        services: {
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
        }[];
        _count: {
            services: number;
            rentals: number;
        };
    } & {
        id: string;
        userId: string;
        createdAt: Date;
        description: string | null;
        isActive: boolean;
        rating: number;
        updatedAt: Date;
        address: string | null;
        storeName: string;
        logo: string | null;
        banner: string | null;
        city: string | null;
        province: string | null;
        isVerified: boolean;
        totalReviews: number;
    }>;
    findByUser(userId: string): Promise<{
        _count: {
            services: number;
            rentals: number;
        };
    } & {
        id: string;
        userId: string;
        createdAt: Date;
        description: string | null;
        isActive: boolean;
        rating: number;
        updatedAt: Date;
        address: string | null;
        storeName: string;
        logo: string | null;
        banner: string | null;
        city: string | null;
        province: string | null;
        isVerified: boolean;
        totalReviews: number;
    }>;
    update(id: string, dto: UpdateMitraDto): Promise<{
        id: string;
        userId: string;
        createdAt: Date;
        description: string | null;
        isActive: boolean;
        rating: number;
        updatedAt: Date;
        address: string | null;
        storeName: string;
        logo: string | null;
        banner: string | null;
        city: string | null;
        province: string | null;
        isVerified: boolean;
        totalReviews: number;
    }>;
    updateSafe(id: string, dto: UpdateMitraDto, userId: string): Promise<{
        id: string;
        userId: string;
        createdAt: Date;
        description: string | null;
        isActive: boolean;
        rating: number;
        updatedAt: Date;
        address: string | null;
        storeName: string;
        logo: string | null;
        banner: string | null;
        city: string | null;
        province: string | null;
        isVerified: boolean;
        totalReviews: number;
    }>;
    verify(id: string): Promise<{
        id: string;
        userId: string;
        createdAt: Date;
        description: string | null;
        isActive: boolean;
        rating: number;
        updatedAt: Date;
        address: string | null;
        storeName: string;
        logo: string | null;
        banner: string | null;
        city: string | null;
        province: string | null;
        isVerified: boolean;
        totalReviews: number;
    }>;
}
