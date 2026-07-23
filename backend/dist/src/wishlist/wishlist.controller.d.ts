declare class AddWishlistDto {
    productId: string;
}
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
            isActive: boolean;
            createdAt: Date;
            updatedAt: Date;
            slug: string;
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
    add(req: any, dto: AddWishlistDto): Promise<{
        product: {
            id: string;
            name: string;
            isActive: boolean;
            createdAt: Date;
            updatedAt: Date;
            slug: string;
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
export {};
