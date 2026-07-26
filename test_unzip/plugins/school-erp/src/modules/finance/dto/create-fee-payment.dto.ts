import { IsString, IsNotEmpty, IsOptional, IsNumber, IsBoolean, IsDateString } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateFeePaymentDto {
  @ApiProperty()
  @IsNumber()
  @IsNotEmpty()
  studentId: number;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  receiptNo: string;

  @ApiProperty()
  @IsNumber()
  @IsNotEmpty()
  amount: number;

  @ApiProperty()
  @IsNumber()
  @IsNotEmpty()
  discount: number;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  paymentMode: string;

  @ApiProperty()
  @IsDateString()
  @IsNotEmpty()
  paymentDate: Date;

}
