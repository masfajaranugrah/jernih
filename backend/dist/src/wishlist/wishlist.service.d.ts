import { PrismaService } from '../prisma/prisma.service';
export declare class WishlistService {
    private prisma;
    constructor(prisma: PrismaService);
    findAll(userId: string): Promise<({
        product: {
            category: {
                id: string;
                name: string;
                slug: string;
            };
        } & {
            id: string;
            createdAt: Date;
            name: string;
            slug: string;
            categoryId: string | null;
            description: string | null;
            price: import("@prisma/client/runtime/library").Decimal;
            oldPrice: import("@prisma/client/runtime/library").Decimal | null;
            stock: number;
            images: string[];
            isActive: boolean;
            rating: number;
            totalSold: number;
            updatedAt: Date;
        };
    } & {
        id: string;
        userId: string;
        productId: string;
        createdAt: Date;
    })[]>;
    add(userId: string, productId: string): Promise<{
        product: {
            id: string;
            createdAt: Date;
            name: string;
            slug: string;
            categoryId: string | null;
            description: string | null;
            price: import("@prisma/client/runtime/library").Decimal;
            oldPrice: import("@prisma/client/runtime/library").Decimal | null;
            stock: number;
            images: string[];
            isActive: boolean;
            rating: number;
            totalSold: number;
            updatedAt: Date;
        };
    } & {
        id: string;
        userId: string;
        productId: string;
        createdAt: Date;
    }>;
    remove(userId: string, productId: string): Promise<{
        message: string;
    }>;
}
