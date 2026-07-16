import { PrismaService } from '../prisma/prisma.service';
import { CreateMitraDto } from './dto/create-mitra.dto';
import { UpdateMitraDto } from './dto/update-mitra.dto';
export declare class MitraService {
    private prisma;
    constructor(prisma: PrismaService);
    create(userId: string, dto: CreateMitraDto): Promise<{
        id: string;
        createdAt: Date;
        isActive: boolean;
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
        _count: {
            services: number;
        };
        user: {
            name: string;
            email: string;
            avatar: string;
        };
    } & {
        id: string;
        createdAt: Date;
        isActive: boolean;
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
        services: {
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
            mitraId: string | null;
            priceFrom: import("@prisma/client/runtime/library").Decimal;
            unit: string;
        }[];
        _count: {
            services: number;
            rentals: number;
        };
        user: {
            name: string;
            email: string;
            avatar: string;
        };
    } & {
        id: string;
        createdAt: Date;
        isActive: boolean;
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
            services: number;
            rentals: number;
        };
    } & {
        id: string;
        createdAt: Date;
        isActive: boolean;
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
        createdAt: Date;
        isActive: boolean;
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
        createdAt: Date;
        isActive: boolean;
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
