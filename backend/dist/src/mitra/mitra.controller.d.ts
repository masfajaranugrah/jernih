import { MitraService } from './mitra.service';
import { CreateMitraDto } from './dto/create-mitra.dto';
import { UpdateMitraDto } from './dto/update-mitra.dto';
export declare class MitraController {
    private mitraService;
    constructor(mitraService: MitraService);
    create(req: any, dto: CreateMitraDto): Promise<{
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
    findAll(city?: string): Promise<({
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
    findMe(req: any): Promise<{
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
    update(req: any, id: string, dto: UpdateMitraDto): Promise<{
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
