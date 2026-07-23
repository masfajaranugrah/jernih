import { ProductsService } from './products.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
export declare class ProductsController {
    private productsService;
    constructor(productsService: ProductsService);
    create(dto: CreateProductDto): Promise<{
        types: {
            id: string;
            productId: string;
            createdAt: Date;
            name: string;
            price: import("@prisma/client/runtime/library").Decimal;
            oldPrice: import("@prisma/client/runtime/library").Decimal | null;
            stock: number;
            isActive: boolean;
            updatedAt: Date;
        }[];
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
    }>;
    findAll(search?: string, categoryId?: string, minPrice?: number, maxPrice?: number, page?: number, limit?: number, light?: string): Promise<{
        data: any[];
        meta: {
            total: number;
            page: number;
            limit: number;
            totalPages: number;
        };
    }>;
    findBySlug(slug: string): Promise<{
        category: {
            id: string;
            createdAt: Date;
            name: string;
            slug: string;
            icon: string | null;
        };
        types: {
            id: string;
            productId: string;
            createdAt: Date;
            name: string;
            price: import("@prisma/client/runtime/library").Decimal;
            oldPrice: import("@prisma/client/runtime/library").Decimal | null;
            stock: number;
            isActive: boolean;
            updatedAt: Date;
        }[];
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
    }>;
    findOne(id: string): Promise<{
        category: {
            id: string;
            createdAt: Date;
            name: string;
            slug: string;
            icon: string | null;
        };
        types: {
            id: string;
            productId: string;
            createdAt: Date;
            name: string;
            price: import("@prisma/client/runtime/library").Decimal;
            oldPrice: import("@prisma/client/runtime/library").Decimal | null;
            stock: number;
            isActive: boolean;
            updatedAt: Date;
        }[];
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
    }>;
    update(id: string, dto: UpdateProductDto): Promise<{
        types: {
            id: string;
            productId: string;
            createdAt: Date;
            name: string;
            price: import("@prisma/client/runtime/library").Decimal;
            oldPrice: import("@prisma/client/runtime/library").Decimal | null;
            stock: number;
            isActive: boolean;
            updatedAt: Date;
        }[];
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
    }>;
    remove(id: string): Promise<{
        message: string;
    }>;
}
