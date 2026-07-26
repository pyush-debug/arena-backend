import { IsString, IsNotEmpty, IsOptional, IsNumber, IsBoolean, IsDateString } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateAttendanceDto {
  @ApiProperty()
  @IsNumber()
  @IsNotEmpty()
  studentId: number;

  @ApiProperty()
  @IsDateString()
  @IsNotEmpty()
  attendanceDate: Date;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  status: string;

  @ApiPropertyOptional()
  @IsNumber()
  @IsOptional()
  academicYearId?: number;

}
