import { PrismaService } from '../prisma/prisma.service';
import { UpdateHeroBannerDto } from './dto/update-hero-banner.dto';
export declare class HeroService {
    private prisma;
    constructor(prisma: PrismaService);
    findAll(): Promise<{
        id: string;
        isActive: boolean;
        updatedAt: Date;
        description: string | null;
        imageUrl: string | null;
        position: number;
        badge: string | null;
        title: string;
        titleSuffix: string | null;
        subtitle: string | null;
        tagline: string | null;
        ctaText: string | null;
        ctaColor: string | null;
        ctaTextColor: string | null;
        bgColor: string;
        imageAlt: string | null;
        linkHref: string | null;
        align: string;
    }[]>;
    findByPosition(position: number): Promise<{
        id: string;
        isActive: boolean;
        updatedAt: Date;
        description: string | null;
        imageUrl: string | null;
        position: number;
        badge: string | null;
        title: string;
        titleSuffix: string | null;
        subtitle: string | null;
        tagline: string | null;
        ctaText: string | null;
        ctaColor: string | null;
        ctaTextColor: string | null;
        bgColor: string;
        imageAlt: string | null;
        linkHref: string | null;
        align: string;
    }>;
    upsert(position: number, dto: UpdateHeroBannerDto): Promise<{
        id: string;
        isActive: boolean;
        updatedAt: Date;
        description: string | null;
        imageUrl: string | null;
        position: number;
        badge: string | null;
        title: string;
        titleSuffix: string | null;
        subtitle: string | null;
        tagline: string | null;
        ctaText: string | null;
        ctaColor: string | null;
        ctaTextColor: string | null;
        bgColor: string;
        imageAlt: string | null;
        linkHref: string | null;
        align: string;
    }>;
    resetAll(): Promise<{
        message: string;
    }>;
}
