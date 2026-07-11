import { IsString, IsNotEmpty, IsOptional, IsNumber, IsBoolean, IsDateString } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateHomeworkDto {
  @ApiProperty()
  @IsNumber()
  @IsNotEmpty()
  classId: number;

  @ApiPropertyOptional()
  @IsNumber()
  @IsOptional()
  sectionId?: number;

  @ApiPropertyOptional()
  @IsNumber()
  @IsOptional()
  subjectId?: number;

  @ApiProperty()
  @IsDateString()
  @IsNotEmpty()
  homeworkDate: Date;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  description: string;

}
