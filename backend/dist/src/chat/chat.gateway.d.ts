import { OnGatewayConnection, OnGatewayDisconnect } from '@nestjs/websockets';
import { JwtService } from '@nestjs/jwt';
import { Server, Socket } from 'socket.io';
import { PrismaService } from '../prisma/prisma.service';
export declare class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
    private jwtService;
    private prisma;
    server: Server;
    private readonly connections;
    constructor(jwtService: JwtService, prisma: PrismaService);
    private extractToken;
    handleConnection(client: Socket): Promise<void>;
    handleDisconnect(client: Socket): Promise<void>;
    handleTyping(client: Socket, body: {
        receiverId?: string;
    }): void;
    handlePresenceQuery(client: Socket, body: {
        userIds?: string[];
    }): Promise<void>;
    emitNewMessage(msg: {
        senderId: string;
        receiverId: string;
    }): void;
    emitDeleted(senderId: string, receiverId: string, messageId: string): void;
    emitRead(readerId: string, senderId: string): void;
    emitTicketEvent(event: 'ticket:new' | 'ticket:message' | 'ticket:update', userIds: string[], payload: unknown): void;
}
