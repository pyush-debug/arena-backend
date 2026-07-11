import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { CustomLoggerService } from '../logger/custom-logger.service';
import { Request, Response } from 'express';

/**
 * Global Exception Filter to catch all errors and map them to the
 * standard error envelope defined in api_conventions.md.
 */
@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  constructor(private readonly logger: CustomLoggerService) {}

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    const status =
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;

    const errorResponse =
      exception instanceof HttpException
        ? exception.getResponse()
        : { message: 'Internal server error' };

    let message = 'An unexpected error occurred';
    let details: string[] = [];

    if (typeof errorResponse === 'string') {
      message = errorResponse;
    } else if (typeof errorResponse === 'object') {
      message = ((errorResponse as { message?: string | string[] }).message as string) || message;
      if (Array.isArray(message)) {
        details = message;
        message = 'Validation Failed';
      }
    }

    if (status === HttpStatus.INTERNAL_SERVER_ERROR) {
      this.logger.error(
        `[${request.method}] ${request.url}`,
        exception instanceof Error ? exception.stack : 'Unknown Stack',
        'GlobalExceptionFilter',
      );
    }

    response.status(status).json({
      success: false,
      error: {
        code: this.mapStatusToCode(status),
        message,
        details: details.length > 0 ? details : undefined,
      },
      timestamp: new Date().toISOString(),
    });
  }

  private mapStatusToCode(status: number): string {
    switch (status) {
      case 400:
        return 'BAD_REQUEST';
      case 401:
        return 'UNAUTHORIZED';
      case 403:
        return 'FORBIDDEN';
      case 404:
        return 'NOT_FOUND';
      case 429:
        return 'TOO_MANY_REQUESTS';
      default:
        return 'INTERNAL_ERROR';
    }
  }
}
