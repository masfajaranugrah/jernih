import { PrismaService } from '../prisma/prisma.service';
export declare class SettingsService {
    private prisma;
    constructor(prisma: PrismaService);
    private readonly publicKeys;
    getSetting(key: string): Promise<any>;
    saveSetting(key: string, value: any): Promise<any>;
}
