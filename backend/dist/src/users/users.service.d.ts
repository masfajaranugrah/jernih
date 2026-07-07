import { PrismaService } from '../prisma/prisma.service';
import { UpdateUserDto } from './dto/update-user.dto';
export declare class UsersService {
    private prisma;
    constructor(prisma: PrismaService);
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
    update(id: string, dto: UpdateUserDto): Promise<{
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
