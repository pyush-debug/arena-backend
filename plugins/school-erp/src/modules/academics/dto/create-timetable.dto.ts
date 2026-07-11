import { IsString, IsNotEmpty, IsOptional, IsNumber, IsBoolean, IsDateString } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateTimetableDto {
  @ApiProperty()
  @IsNumber()
  @IsNotEmpty()
  academicYearId: number;

  @ApiProperty()
  @IsNumber()
  @IsNotEmpty()
  sectionId: number;

  @ApiProperty()
  @IsNumber()
  @IsNotEmpty()
  subjectId: number;

  @ApiProperty()
  @IsNumber()
  @IsNotEmpty()
  teacherId: number;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  dayOfWeek: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  startTime: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  endTime: string;

}
