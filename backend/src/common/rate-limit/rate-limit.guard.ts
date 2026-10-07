import {
  Injectable,
  CanActivate,
  ExecutionContext,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Request } from 'express';

export const RATE_LIMIT_KEY = 'rateLimit';
export interface RateLimitOptions {
  windowMs: number;
  max: number;
  keyPrefix: string;
}

@Injectable()
export class RateLimitGuard implements CanActivate {
  private store: Map<string, { count: number; resetAt: number }> = new Map();

  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const options = this.reflector.getAllAndOverride<RateLimitOptions>(RATE_LIMIT_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (!options) return true;

    const request = context.switchToHttp().getRequest<Request>();
    const ip = request.ip ?? request.socket.remoteAddress ?? 'unknown';
    const key = `${options.keyPrefix}-${ip}`;
    const now = Date.now();

    let record = this.store.get(key);
    if (!record || now > record.resetAt) {
      record = { count: 1, resetAt: now + options.windowMs };
      this.store.set(key, record);
      return true;
    }

    if (record.count >= options.max) {
      // A bare Error surfaces as a 500 with no message, which the frontend then
      // shows as "something went wrong". 429 + a real message is actionable.
      const retryAfter = Math.ceil((record.resetAt - now) / 1000);
      throw new HttpException(
        `Too many attempts. Try again in ${retryAfter} second(s).`,
        HttpStatus.TOO_MANY_REQUESTS,
      );
    }
    record.count++;
    return true;
  }
}