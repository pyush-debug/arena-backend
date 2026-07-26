import { IsString, IsNotEmpty, IsOptional, IsNumber, IsBoolean, IsDateString } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateReportCardDto {
  @ApiProperty()
  @IsNumber()
  @IsNotEmpty()
  studentId: number;

  @ApiProperty()
  @IsNumber()
  @IsNotEmpty()
  academicYearId: number;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  term: string;

  @ApiProperty()
  @IsNumber()
  @IsNotEmpty()
  totalMarks: number;

  @ApiProperty()
  @IsNumber()
  @IsNotEmpty()
  obtainedMarks: number;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  grade?: string;

  @ApiProperty()
  @IsBoolean()
  @IsNotEmpty()
  isPublished: boolean;

}
