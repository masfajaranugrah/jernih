import { WishlistService } from './wishlist.service';
export declare class WishlistController {
    private wishlistService;
    constructor(wishlistService: WishlistService);
    findAll(req: any): Promise<({
        product: {
            category: {
                id: string;
                name: string;
                slug: string;
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
            oldPrice: import("@prisma/client/runtime/library").Decimal | null;
            categoryId: string | null;
            price: import("@prisma/client/runtime/library").Decimal;
            stock: number;
            images: string[];
            totalSold: number;
        };
    } & {
        id: string;
        createdAt: Date;
        userId: string;
        productId: string;
    })[]>;
    add(req: any, productId: string): Promise<{
        product: {
            id: string;
            name: string;
            slug: string;
            createdAt: Date;
            isActive: boolean;
            updatedAt: Date;
            description: string | null;
            rating: number;
            oldPrice: import("@prisma/client/runtime/library").Decimal | null;
            categoryId: string | null;
            price: import("@prisma/client/runtime/library").Decimal;
            stock: number;
            images: string[];
            totalSold: number;
        };
    } & {
        id: string;
        createdAt: Date;
        userId: string;
        productId: string;
    }>;
    remove(req: any, productId: string): Promise<{
        message: string;
    }>;
}
