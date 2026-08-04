import {
  IsNotEmpty,
  IsOptional,
  IsString,
  IsNumber,
  MaxLength,
  MinLength,
  IsUUID,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { PaginationDto } from 'src/common/dto/pagination.dto';

export class CreateProjectDto {
  @ApiProperty({
    description: 'عنوان پروژه',
    example: 'پروژه توسعه وبسایت',
    minLength: 3,
    maxLength: 255,
    required: true,
  })
  @IsNotEmpty({ message: 'عنوان پروژه الزامی است' })
  @IsString({ message: 'عنوان باید رشته باشد' })
  @MinLength(3, { message: 'عنوان حداقل باید ۳ کاراکتر باشد' })
  @MaxLength(255, { message: 'عنوان حداکثر ۲۵۵ کاراکتر می‌تواند باشد' })
  title: string;

  @ApiPropertyOptional({
    description: 'توضیحات پروژه (اختیاری)',
    example: 'این پروژه برای توسعه وبسایت شرکت انجام می‌شود',
    nullable: true,
  })
  @IsOptional()
  @IsString({ message: 'توضیحات باید رشته باشد' })
  description?: string;

  @ApiProperty({
    description: 'شناسه ورک‌اسپیس مربوطه',
    example: 1,
    required: true,
    type: Number,
  })
  @IsNotEmpty({ message: 'شناسه ورک‌اسپیس الزامی است' })
  @IsNumber({}, { message: 'شناسه ورک‌اسپیس باید عدد باشد' })
  @Type(() => Number)
  workspaceId: number;
}

export class FindAllProjectsDto extends PaginationDto {
  @IsOptional()
  @IsUUID()
  workspaceId?: string;

  @IsOptional()
  @IsString()
  search?: string;
}
