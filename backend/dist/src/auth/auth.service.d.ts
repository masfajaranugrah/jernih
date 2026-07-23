import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../prisma/prisma.service';
import { RegisterDto, LoginDto } from './dto/auth.dto';
export declare class AuthService {
    private prisma;
    private jwt;
    private config;
    constructor(prisma: PrismaService, jwt: JwtService, config: ConfigService);
    register(dto: RegisterDto): Promise<{
        user: {
            id: string;
            email: string;
            name: string;
            phone: string;
            role: import(".prisma/client").$Enums.Role;
            createdAt: Date;
        };
        access_token: string;
    }>;
    login(dto: LoginDto): Promise<{
        user: {
            mitra: {
                id: string;
                storeName: string;
            };
            id: string;
            email: string;
            name: string;
            phone: string | null;
            avatar: string | null;
            role: import(".prisma/client").$Enums.Role;
            isActive: boolean;
            lastSeenAt: Date | null;
            tokenVersion: number;
            createdAt: Date;
            updatedAt: Date;
        };
        access_token: string;
    }>;
    getMe(userId: string): Promise<{
        id: string;
        email: string;
        name: string;
        phone: string;
        avatar: string;
        role: import(".prisma/client").$Enums.Role;
        createdAt: Date;
        mitra: {
            id: string;
            storeName: string;
            logo: string;
            isVerified: boolean;
        };
    }>;
    private signToken;
    logout(userId: string): Promise<{
        message: string;
    }>;
    refreshToken(userId: string, email: string, role: string): Promise<{
        user: {
            id: string;
            email: string;
            name: string;
            phone: string;
            role: import(".prisma/client").$Enums.Role;
            createdAt: Date;
            mitra: {
                id: string;
                storeName: string;
                logo: string;
                isVerified: boolean;
            };
        };
        access_token: string;
    }>;
}
