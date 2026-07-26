import { HttpException } from '@nestjs/common';

export class BaseException extends HttpException {
  constructor(
    message: string,
    status: number = 400,
    public code?: string,
  ) {
    super({ success: false, message, code }, status);
  }
}

export class BaseResponse<T> {
  public readonly success = true;
  public readonly timestamp = new Date().toISOString();

  constructor(
    public data: T,
    public message: string = 'Success',
    public meta?: Record<string, unknown>,
  ) {}
}
