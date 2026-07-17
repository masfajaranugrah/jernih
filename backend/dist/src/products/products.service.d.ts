import { PrismaService } from '../prisma/prisma.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
export declare class ProductsService {
    private prisma;
    constructor(prisma: PrismaService);
    create(dto: CreateProductDto): Promise<{
        types: {
            id: string;
            name: string;
            createdAt: Date;
            isActive: boolean;
            updatedAt: Date;
            oldPrice: import("@prisma/client/runtime/library").Decimal | null;
            price: import("@prisma/client/runtime/library").Decimal;
            stock: number;
            productId: string;
        }[];
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
    }>;
    findAll(query?: {
        search?: string;
        categoryId?: string;
        minPrice?: number;
        maxPrice?: number;
        page?: number;
        limit?: number;
    }): Promise<{
        data: ({
            category: {
                id: string;
                name: string;
                slug: string;
            };
            types: {
                id: string;
                name: string;
                createdAt: Date;
                isActive: boolean;
                updatedAt: Date;
                oldPrice: import("@prisma/client/runtime/library").Decimal | null;
                price: import("@prisma/client/runtime/library").Decimal;
                stock: number;
                productId: string;
            }[];
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
        })[];
        meta: {
            total: number;
            page: number;
            limit: number;
            totalPages: number;
        };
    }>;
    findOne(id: string): Promise<{
        category: {
            id: string;
            name: string;
            slug: string;
            icon: string | null;
            createdAt: Date;
        };
        types: {
            id: string;
            name: string;
            createdAt: Date;
            isActive: boolean;
            updatedAt: Date;
            oldPrice: import("@prisma/client/runtime/library").Decimal | null;
            price: import("@prisma/client/runtime/library").Decimal;
            stock: number;
            productId: string;
        }[];
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
    }>;
    findBySlug(slug: string): Promise<{
        category: {
            id: string;
            name: string;
            slug: string;
            icon: string | null;
            createdAt: Date;
        };
        types: {
            id: string;
            name: string;
            createdAt: Date;
            isActive: boolean;
            updatedAt: Date;
            oldPrice: import("@prisma/client/runtime/library").Decimal | null;
            price: import("@prisma/client/runtime/library").Decimal;
            stock: number;
            productId: string;
        }[];
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
    }>;
    update(id: string, dto: UpdateProductDto): Promise<{
        types: {
            id: string;
            name: string;
            createdAt: Date;
            isActive: boolean;
            updatedAt: Date;
            oldPrice: import("@prisma/client/runtime/library").Decimal | null;
            price: import("@prisma/client/runtime/library").Decimal;
            stock: number;
            productId: string;
        }[];
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
    }>;
    remove(id: string): Promise<{
        message: string;
    }>;
}
