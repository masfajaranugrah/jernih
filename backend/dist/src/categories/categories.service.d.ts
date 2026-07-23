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
        createdAt: Date;
        name: string;
        slug: string;
        icon: string | null;
    }>;
    findAll(): Promise<{
        id: string;
        createdAt: Date;
        name: string;
        slug: string;
        icon: string | null;
    }[]>;
    findOne(id: string): Promise<{
        id: string;
        createdAt: Date;
        name: string;
        slug: string;
        icon: string | null;
    }>;
    update(id: string, dto: {
        name?: string;
        slug?: string;
        icon?: string;
    }): Promise<{
        id: string;
        createdAt: Date;
        name: string;
        slug: string;
        icon: string | null;
    }>;
    remove(id: string): Promise<{
        id: string;
        createdAt: Date;
        name: string;
        slug: string;
        icon: string | null;
    }>;
}
