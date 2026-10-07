import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

export interface UnifiedResponse<T> {
  status: 'success';
  message: string;
  data: T;
}

@Injectable()
export class ResponseInterceptor<T> implements NestInterceptor<T, UnifiedResponse<T>> {
  intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Observable<UnifiedResponse<T>> {
    return next.handle().pipe(
      map((data) => ({
        status: 'success',
        message: this.getMessage(context),
        data,
      })),
    );
  }

  private getMessage(context: ExecutionContext): string {
    const request = context.switchToHttp().getRequest();
    const method = request.method;
    const path = request.route?.path || request.url;

    // You can customise messages based on method or path
    if (method === 'POST') return 'Resource created successfully';
    if (method === 'PUT' || method === 'PATCH') return 'Resource updated successfully';
    if (method === 'DELETE') return 'Resource deleted successfully';
    return 'Request successful';
  }
}