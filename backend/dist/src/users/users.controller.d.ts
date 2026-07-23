import { UsersService } from './users.service';
import { UpdateUserDto } from './dto/update-user.dto';
export declare class UsersController {
    private usersService;
    constructor(usersService: UsersService);
    findAll(): Promise<{
        id: string;
        createdAt: Date;
        name: string;
        isActive: boolean;
        email: string;
        phone: string;
        avatar: string;
        role: import(".prisma/client").$Enums.Role;
    }[]>;
    getMe(req: any): Promise<{
        id: string;
        createdAt: Date;
        name: string;
        _count: {
            wishlist: number;
            orders: number;
        };
        isActive: boolean;
        mitra: {
            id: string;
            storeName: string;
            isVerified: boolean;
        };
        email: string;
        phone: string;
        avatar: string;
        role: import(".prisma/client").$Enums.Role;
    }>;
    findOne(req: any, id: string): Promise<{
        id: string;
        createdAt: Date;
        name: string;
        _count: {
            wishlist: number;
            orders: number;
        };
        isActive: boolean;
        mitra: {
            id: string;
            storeName: string;
            isVerified: boolean;
        };
        email: string;
        phone: string;
        avatar: string;
        role: import(".prisma/client").$Enums.Role;
    }>;
    updateMe(req: any, dto: UpdateUserDto): Promise<{
        id: string;
        name: string;
        updatedAt: Date;
        email: string;
        phone: string;
        avatar: string;
        role: import(".prisma/client").$Enums.Role;
    }>;
    remove(id: string): Promise<{
        message: string;
    }>;
}
