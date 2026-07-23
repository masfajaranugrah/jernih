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
    add(req: any, dto: AddWishlistDto): Promise<{
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
    remove(req: any, productId: string): Promise<{
        message: string;
    }>;
}
export {};
