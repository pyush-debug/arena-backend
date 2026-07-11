import { IsString, IsNotEmpty, IsOptional, IsNumber, IsBoolean, IsDateString } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateTeacherDto {
  @ApiProperty()
  @IsNumber()
  @IsNotEmpty()
  userId: number;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  specialization?: string;

  @ApiProperty()
  @IsNumber()
  @IsNotEmpty()
  maxHoursPerWeek: number;

}
