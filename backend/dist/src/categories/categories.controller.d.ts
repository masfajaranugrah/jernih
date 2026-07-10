import { CategoriesService } from './categories.service';
export declare class CategoriesController {
    private categoriesService;
    constructor(categoriesService: CategoriesService);
    findAll(): Promise<{
        id: string;
        name: string;
        slug: string;
        icon: string | null;
        createdAt: Date;
    }[]>;
    findOne(id: string): Promise<{
        id: string;
        name: string;
        slug: string;
        icon: string | null;
        createdAt: Date;
    }>;
    create(dto: {
        name: string;
        slug?: string;
        icon?: string;
    }): Promise<{
        id: string;
        name: string;
        slug: string;
        icon: string | null;
        createdAt: Date;
    }>;
    update(id: string, dto: {
        name?: string;
        slug?: string;
        icon?: string;
    }): Promise<{
        id: string;
        name: string;
        slug: string;
        icon: string | null;
        createdAt: Date;
    }>;
    remove(id: string): Promise<{
        id: string;
        name: string;
        slug: string;
        icon: string | null;
        createdAt: Date;
    }>;
}
