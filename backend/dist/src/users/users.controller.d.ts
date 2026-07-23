import { UsersService } from './users.service';
import { UpdateUserDto } from './dto/update-user.dto';
export declare class UsersController {
    private usersService;
    constructor(usersService: UsersService);
    findAll(): Promise<{
        id: string;
        email: string;
        name: string;
        phone: string;
        avatar: string;
        role: import(".prisma/client").$Enums.Role;
        isActive: boolean;
        createdAt: Date;
    }[]>;
    getMe(req: any): Promise<{
        id: string;
        email: string;
        name: string;
        phone: string;
        avatar: string;
        role: import(".prisma/client").$Enums.Role;
        isActive: boolean;
        createdAt: Date;
        mitra: {
            id: string;
            storeName: string;
            isVerified: boolean;
        };
        _count: {
            orders: number;
            wishlist: number;
        };
    }>;
    findOne(req: any, id: string): Promise<{
        id: string;
        email: string;
        name: string;
        phone: string;
        avatar: string;
        role: import(".prisma/client").$Enums.Role;
        isActive: boolean;
        createdAt: Date;
        mitra: {
            id: string;
            storeName: string;
            isVerified: boolean;
        };
        _count: {
            orders: number;
            wishlist: number;
        };
    }>;
    updateMe(req: any, dto: UpdateUserDto): Promise<{
        id: string;
        email: string;
        name: string;
        phone: string;
        avatar: string;
        role: import(".prisma/client").$Enums.Role;
        updatedAt: Date;
    }>;
    remove(id: string): Promise<{
        message: string;
    }>;
}
