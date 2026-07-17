import { OnGatewayConnection, OnGatewayDisconnect } from '@nestjs/websockets';
import { JwtService } from '@nestjs/jwt';
import { Server, Socket } from 'socket.io';
export declare class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
    private jwtService;
    server: Server;
    private readonly connections;
    private readonly lastSeen;
    constructor(jwtService: JwtService);
    private extractToken;
    handleConnection(client: Socket): void;
    handleDisconnect(client: Socket): void;
    handleTyping(client: Socket, body: {
        receiverId?: string;
    }): void;
    handlePresenceQuery(client: Socket, body: {
        userIds?: string[];
    }): void;
    emitNewMessage(msg: {
        senderId: string;
        receiverId: string;
    }): void;
    emitDeleted(senderId: string, receiverId: string, messageId: string): void;
    emitRead(readerId: string, senderId: string): void;
    emitTicketEvent(event: 'ticket:new' | 'ticket:message' | 'ticket:update', userIds: string[], payload: unknown): void;
}
