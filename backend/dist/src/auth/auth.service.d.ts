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
            tokenVersion: number;
            id: string;
            email: string;
            name: string;
            role: import(".prisma/client").$Enums.Role;
            phone: string;
            createdAt: Date;
        };
        access_token: string;
    }>;
    login(dto: LoginDto): Promise<{
        user: {
            isActive: boolean;
            tokenVersion: number;
            id: string;
            email: string;
            name: string;
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
    getMe(userId: string): Promise<{
        id: string;
        email: string;
        name: string;
        role: import(".prisma/client").$Enums.Role;
        phone: string;
        avatar: string;
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
            role: import(".prisma/client").$Enums.Role;
            phone: string;
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
