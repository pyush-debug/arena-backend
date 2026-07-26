import { IsString, IsNotEmpty, IsOptional, IsDateString, IsInt } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateStudentDto {
  @ApiProperty({ example: 'John Doe', description: 'Full name of the student' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiPropertyOptional({ example: 'ADM-2026-001', description: 'Admission Number' })
  @IsString()
  @IsOptional()
  admissionNo?: string;

  @ApiProperty({ example: '+1234567890', description: 'Contact Phone Number' })
  @IsString()
  @IsNotEmpty()
  phone: string;

  @ApiPropertyOptional({ example: 'john.doe@example.com' })
  @IsString()
  @IsOptional()
  email?: string;

  @ApiPropertyOptional({ example: '2010-05-15' })
  @IsDateString()
  @IsOptional()
  dob?: Date;

  @ApiPropertyOptional({ example: 'Active' })
  @IsString()
  @IsOptional()
  status?: string;

  @ApiProperty({ example: 1, description: 'Legacy Course / Class ID' })
  @IsInt()
  @IsNotEmpty()
  legacyCourseId: number;

  @ApiPropertyOptional({ example: 'Richard Doe' })
  @IsString()
  @IsOptional()
  fatherName?: string;

  @ApiPropertyOptional({ example: 'O+' })
  @IsString()
  @IsOptional()
  bloodGroup?: string;
}
