import { PrismaService } from '../prisma/prisma.service';
export declare class CategoriesService {
    private prisma;
    constructor(prisma: PrismaService);
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
