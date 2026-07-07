import { PrismaService } from '../prisma/prisma.service';
export declare class SettingsService {
    private prisma;
    constructor(prisma: PrismaService);
    getSetting(key: string): Promise<any>;
    saveSetting(key: string, value: any): Promise<any>;
}
