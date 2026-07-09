import { ProductsService } from './products.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
export declare class ProductsController {
    private productsService;
    constructor(productsService: ProductsService);
    createForAdmin(mitraId: string, dto: CreateProductDto): Promise<{
        id: string;
        mitraId: string;
        categoryId: string | null;
        name: string;
        slug: string;
        description: string | null;
        price: import("@prisma/client/runtime/library").Decimal;
        oldPrice: import("@prisma/client/runtime/library").Decimal | null;
        stock: number;
        images: string[];
        isActive: boolean;
        rating: number;
        totalSold: number;
        createdAt: Date;
        updatedAt: Date;
    }>;
    create(req: any, dto: CreateProductDto): Promise<{
        id: string;
        mitraId: string;
        categoryId: string | null;
        name: string;
        slug: string;
        description: string | null;
        price: import("@prisma/client/runtime/library").Decimal;
        oldPrice: import("@prisma/client/runtime/library").Decimal | null;
        stock: number;
        images: string[];
        isActive: boolean;
        rating: number;
        totalSold: number;
        createdAt: Date;
        updatedAt: Date;
    }>;
    findAll(search?: string, categoryId?: string, mitraId?: string, minPrice?: number, maxPrice?: number, page?: number, limit?: number): Promise<{
        data: ({
            mitra: {
                id: string;
                storeName: string;
                city: string;
            };
            category: {
                id: string;
                name: string;
                slug: string;
            };
        } & {
            id: string;
            mitraId: string;
            categoryId: string | null;
            name: string;
            slug: string;
            description: string | null;
            price: import("@prisma/client/runtime/library").Decimal;
            oldPrice: import("@prisma/client/runtime/library").Decimal | null;
            stock: number;
            images: string[];
            isActive: boolean;
            rating: number;
            totalSold: number;
            createdAt: Date;
            updatedAt: Date;
        })[];
        meta: {
            total: number;
            page: number;
            limit: number;
            totalPages: number;
        };
    }>;
    findBySlug(slug: string): Promise<{
        mitra: {
            id: string;
            rating: number;
            storeName: string;
            logo: string;
            city: string;
        };
        category: {
            id: string;
            name: string;
            slug: string;
            createdAt: Date;
            icon: string | null;
        };
    } & {
        id: string;
        mitraId: string;
        categoryId: string | null;
        name: string;
        slug: string;
        description: string | null;
        price: import("@prisma/client/runtime/library").Decimal;
        oldPrice: import("@prisma/client/runtime/library").Decimal | null;
        stock: number;
        images: string[];
        isActive: boolean;
        rating: number;
        totalSold: number;
        createdAt: Date;
        updatedAt: Date;
    }>;
    findOne(id: string): Promise<{
        mitra: {
            id: string;
            rating: number;
            storeName: string;
            logo: string;
            city: string;
        };
        category: {
            id: string;
            name: string;
            slug: string;
            createdAt: Date;
            icon: string | null;
        };
    } & {
        id: string;
        mitraId: string;
        categoryId: string | null;
        name: string;
        slug: string;
        description: string | null;
        price: import("@prisma/client/runtime/library").Decimal;
        oldPrice: import("@prisma/client/runtime/library").Decimal | null;
        stock: number;
        images: string[];
        isActive: boolean;
        rating: number;
        totalSold: number;
        createdAt: Date;
        updatedAt: Date;
    }>;
    update(id: string, dto: UpdateProductDto): Promise<{
        id: string;
        mitraId: string;
        categoryId: string | null;
        name: string;
        slug: string;
        description: string | null;
        price: import("@prisma/client/runtime/library").Decimal;
        oldPrice: import("@prisma/client/runtime/library").Decimal | null;
        stock: number;
        images: string[];
        isActive: boolean;
        rating: number;
        totalSold: number;
        createdAt: Date;
        updatedAt: Date;
    }>;
    remove(id: string): Promise<{
        message: string;
    }>;
}
