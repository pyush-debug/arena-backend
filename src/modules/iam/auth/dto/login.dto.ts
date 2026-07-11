import { IsString, IsNotEmpty, IsOptional, IsNumber } from 'class-validator';

export class LoginDto {
  @IsString()
  @IsNotEmpty()
  username: string;

  @IsString()
  @IsNotEmpty()
  password: string;

  @IsNumber()
  @IsOptional()
  franchise_id?: number;

  @IsString()
  @IsOptional()
  device_id?: string;

  @IsString()
  @IsOptional()
  totp_code?: string;
}
