import { IsString, IsNotEmpty, IsOptional, IsNumber, IsBoolean, IsDateString } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateMarkDto {
  @ApiProperty()
  @IsNumber()
  @IsNotEmpty()
  studentId: number;

  @ApiProperty()
  @IsNumber()
  @IsNotEmpty()
  examId: number;

  @ApiPropertyOptional()
  @IsNumber()
  @IsOptional()
  subjectId?: number;

  @ApiProperty()
  @IsNumber()
  @IsNotEmpty()
  obtainedMarks: number;

  @ApiProperty()
  @IsNumber()
  @IsNotEmpty()
  totalMarks: number;

}
