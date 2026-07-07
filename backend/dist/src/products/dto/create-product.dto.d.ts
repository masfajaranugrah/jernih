export declare class CreateProductDto {
    categoryId?: string;
    name: string;
    slug: string;
    description?: string;
    price: number;
    oldPrice?: number;
    stock: number;
    images?: string[];
    isActive?: boolean;
}
