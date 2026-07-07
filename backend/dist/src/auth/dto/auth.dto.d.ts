import { Role } from '@prisma/client';
export declare class RegisterDto {
    email: string;
    password: string;
    name: string;
    phone?: string;
    role?: Role;
}
export declare class LoginDto {
    email: string;
    password: string;
}
