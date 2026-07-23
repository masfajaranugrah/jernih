import { NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
export declare class CsrfOriginMiddleware implements NestMiddleware {
    private allowedOrigins;
    constructor();
    use(req: Request, res: Response, next: NextFunction): void | Response<any, Record<string, any>>;
}
