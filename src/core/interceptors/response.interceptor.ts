import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

export interface Response<T> {
  success: boolean;
  data: T;
  meta?: any;
  timestamp: string;
}

/**
 * Standard Response Interceptor matching API Conventions.
 * Wraps all outgoing successful responses in `{ success: true, data: ..., timestamp }`.
 */
@Injectable()
export class ResponseInterceptor<T> implements NestInterceptor<T, Response<T>> {
  intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Observable<Response<T>> {
    return next.handle().pipe(
      map((res: { data?: T; meta?: Record<string, unknown> } | T) => {
        const isObj = res && typeof res === 'object';
        const data =
          isObj && 'data' in res ? (res as { data: T }).data : (res as T);
        const meta =
          isObj && 'meta' in res
            ? (res as { meta: Record<string, unknown> }).meta
            : undefined;

        return {
          success: true,
          data,
          ...(meta && { meta }),
          timestamp: new Date().toISOString(),
        };
      }),
    );
  }
}
