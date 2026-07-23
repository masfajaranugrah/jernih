import { PrismaService } from '../prisma/prisma.service';
import { UpdateHeroBannerDto } from './dto/update-hero-banner.dto';
export declare class HeroService {
    private prisma;
    constructor(prisma: PrismaService);
    findAll(): Promise<{
        id: string;
        description: string | null;
        isActive: boolean;
        updatedAt: Date;
        title: string;
        position: number;
        badge: string | null;
        titleSuffix: string | null;
        subtitle: string | null;
        tagline: string | null;
        ctaText: string | null;
        ctaColor: string | null;
        ctaTextColor: string | null;
        bgColor: string;
        imageUrl: string | null;
        imageAlt: string | null;
        linkHref: string | null;
        align: string;
    }[]>;
    findByPosition(position: number): Promise<{
        id: string;
        description: string | null;
        isActive: boolean;
        updatedAt: Date;
        title: string;
        position: number;
        badge: string | null;
        titleSuffix: string | null;
        subtitle: string | null;
        tagline: string | null;
        ctaText: string | null;
        ctaColor: string | null;
        ctaTextColor: string | null;
        bgColor: string;
        imageUrl: string | null;
        imageAlt: string | null;
        linkHref: string | null;
        align: string;
    }>;
    upsert(position: number, dto: UpdateHeroBannerDto): Promise<{
        id: string;
        description: string | null;
        isActive: boolean;
        updatedAt: Date;
        title: string;
        position: number;
        badge: string | null;
        titleSuffix: string | null;
        subtitle: string | null;
        tagline: string | null;
        ctaText: string | null;
        ctaColor: string | null;
        ctaTextColor: string | null;
        bgColor: string;
        imageUrl: string | null;
        imageAlt: string | null;
        linkHref: string | null;
        align: string;
    }>;
    resetAll(): Promise<{
        message: string;
    }>;
}
