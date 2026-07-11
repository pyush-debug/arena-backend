import { IsString, IsNotEmpty, IsOptional, IsNumber, IsBoolean, IsDateString } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateVisitorDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  phone: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  purpose: string;

  @ApiProperty()
  @IsDateString()
  @IsNotEmpty()
  checkIn: Date;

  @ApiPropertyOptional()
  @IsDateString()
  @IsOptional()
  checkOut?: Date;

}
