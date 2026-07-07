import { UsersService } from './users.service';
import { UpdateUserDto } from './dto/update-user.dto';
export declare class UsersController {
    private usersService;
    constructor(usersService: UsersService);
    findAll(): Promise<{
        id: string;
        name: string;
        createdAt: Date;
        email: string;
        phone: string;
        avatar: string;
        role: import(".prisma/client").$Enums.Role;
        isActive: boolean;
    }[]>;
    getMe(req: any): Promise<{
        id: string;
        name: string;
        createdAt: Date;
        _count: {
            orders: number;
            wishlist: number;
        };
        email: string;
        phone: string;
        avatar: string;
        role: import(".prisma/client").$Enums.Role;
        isActive: boolean;
        mitra: {
            id: string;
            storeName: string;
            isVerified: boolean;
        };
    }>;
    findOne(id: string): Promise<{
        id: string;
        name: string;
        createdAt: Date;
        _count: {
            orders: number;
            wishlist: number;
        };
        email: string;
        phone: string;
        avatar: string;
        role: import(".prisma/client").$Enums.Role;
        isActive: boolean;
        mitra: {
            id: string;
            storeName: string;
            isVerified: boolean;
        };
    }>;
    updateMe(req: any, dto: UpdateUserDto): Promise<{
        id: string;
        name: string;
        email: string;
        phone: string;
        avatar: string;
        role: import(".prisma/client").$Enums.Role;
        updatedAt: Date;
    }>;
    remove(id: string): Promise<{
        message: string;
    }>;
}
