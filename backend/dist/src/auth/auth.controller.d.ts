import { AuthService } from './auth.service';
import { RegisterDto, LoginDto } from './dto/auth.dto';
export declare class AuthController {
    private authService;
    constructor(authService: AuthService);
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
            createdAt: Date;
            updatedAt: Date;
        };
        access_token: string;
    }>;
    getMe(req: any): Promise<{
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
}
