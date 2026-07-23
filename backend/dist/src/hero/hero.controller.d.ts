import { HeroService } from './hero.service';
import { UpdateHeroBannerDto } from './dto/update-hero-banner.dto';
export declare class HeroController {
    private heroService;
    constructor(heroService: HeroService);
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
    reset(): Promise<{
        message: string;
    }>;
}
