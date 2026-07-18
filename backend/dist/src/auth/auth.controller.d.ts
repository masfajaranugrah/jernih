import { AuthService } from './auth.service';
import { RegisterDto, LoginDto } from './dto/auth.dto';
export declare class AuthController {
    private authService;
    constructor(authService: AuthService);
    register(dto: RegisterDto): Promise<{
        user: {
            id: string;
            name: string;
            createdAt: Date;
            email: string;
            phone: string;
            role: import(".prisma/client").$Enums.Role;
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
            name: string;
            createdAt: Date;
            email: string;
            phone: string | null;
            avatar: string | null;
            role: import(".prisma/client").$Enums.Role;
            isActive: boolean;
            lastSeenAt: Date | null;
            updatedAt: Date;
        };
        access_token: string;
    }>;
    getMe(req: any): Promise<{
        id: string;
        name: string;
        createdAt: Date;
        email: string;
        phone: string;
        avatar: string;
        role: import(".prisma/client").$Enums.Role;
        mitra: {
            id: string;
            storeName: string;
            logo: string;
            isVerified: boolean;
        };
    }>;
}
