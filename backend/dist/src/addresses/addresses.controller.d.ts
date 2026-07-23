import { AddressesService } from './addresses.service';
import { CreateAddressDto } from './dto/create-address.dto';
import { UpdateAddressDto } from './dto/update-address.dto';
export declare class AddressesController {
    private addressesService;
    constructor(addressesService: AddressesService);
    create(req: any, dto: CreateAddressDto): Promise<{
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
    findAll(req: any): Promise<{
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
    findOne(req: any, id: string): Promise<{
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
    update(id: string, req: any, dto: UpdateAddressDto): Promise<{
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
    remove(req: any, id: string): Promise<{
        message: string;
    }>;
}
