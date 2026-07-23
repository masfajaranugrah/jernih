import { PrismaService } from '../prisma/prisma.service';
import { CreateAddressDto } from './dto/create-address.dto';
import { UpdateAddressDto } from './dto/update-address.dto';
export declare class AddressesService {
    private prisma;
    constructor(prisma: PrismaService);
    create(userId: string, dto: CreateAddressDto): Promise<{
        id: string;
        userId: string;
        createdAt: Date;
        updatedAt: Date;
        phone: string;
        city: string;
        province: string;
        label: string;
        recipient: string;
        street: string;
        postalCode: string;
        isDefault: boolean;
    }>;
    findAll(userId: string): Promise<{
        id: string;
        userId: string;
        createdAt: Date;
        updatedAt: Date;
        phone: string;
        city: string;
        province: string;
        label: string;
        recipient: string;
        street: string;
        postalCode: string;
        isDefault: boolean;
    }[]>;
    findOne(id: string): Promise<{
        id: string;
        userId: string;
        createdAt: Date;
        updatedAt: Date;
        phone: string;
        city: string;
        province: string;
        label: string;
        recipient: string;
        street: string;
        postalCode: string;
        isDefault: boolean;
    }>;
    findOneSafe(id: string, requesterId: string, requesterRole: string): Promise<{
        id: string;
        userId: string;
        createdAt: Date;
        updatedAt: Date;
        phone: string;
        city: string;
        province: string;
        label: string;
        recipient: string;
        street: string;
        postalCode: string;
        isDefault: boolean;
    }>;
    update(id: string, userId: string, dto: UpdateAddressDto): Promise<{
        id: string;
        userId: string;
        createdAt: Date;
        updatedAt: Date;
        phone: string;
        city: string;
        province: string;
        label: string;
        recipient: string;
        street: string;
        postalCode: string;
        isDefault: boolean;
    }>;
    updateSafe(id: string, userId: string, dto: UpdateAddressDto): Promise<{
        id: string;
        userId: string;
        createdAt: Date;
        updatedAt: Date;
        phone: string;
        city: string;
        province: string;
        label: string;
        recipient: string;
        street: string;
        postalCode: string;
        isDefault: boolean;
    }>;
    remove(id: string): Promise<{
        message: string;
    }>;
    removeSafe(id: string, requesterId: string, requesterRole: string): Promise<{
        message: string;
    }>;
}
