import { IsString, IsNotEmpty, IsDateString, IsBoolean } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateAcademicYearDto {
  @ApiProperty({ example: '2026-2027', description: 'Academic Year Name' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ example: '2026-06-01' })
  @IsDateString()
  startDate: Date;

  @ApiProperty({ example: '2027-05-31' })
  @IsDateString()
  endDate: Date;

  @ApiPropertyOptional({ example: true, description: 'Is this the current active academic year?' })
  @IsBoolean()
  isActive?: boolean;
}
