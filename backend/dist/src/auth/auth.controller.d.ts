import { AuthService } from './auth.service';
import { RegisterDto, LoginDto } from './dto/auth.dto';
export declare class AuthController {
    private authService;
    constructor(authService: AuthService);
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
    getMe(req: any): Promise<{
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
    logout(req: any): Promise<{
        message: string;
    }>;
    refresh(req: any): Promise<{
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
