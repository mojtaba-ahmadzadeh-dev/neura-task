import { IsNotEmpty, IsOptional, IsString, IsEnum, IsDateString, IsObject, IsArray, IsNumber } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateProjectDto {
  @ApiProperty({
    description: 'عنوان پروژه',
    example: 'وبسایت فروشگاهی',
    required: true,
  })
  @IsNotEmpty({ message: 'عنوان پروژه الزامی است' })
  @IsString()
  title: string;

  @ApiPropertyOptional({
    description: 'توضیحات پروژه',
    example: 'پروژه توسعه وبسایت فروشگاهی با پنل مدیریت',
  })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({
    description: 'وضعیت پروژه',
    enum: ['active', 'on_hold', 'completed', 'archived', 'cancelled'],
    default: 'active',
    example: 'active',
  })
  @IsOptional()
  @IsEnum(['active', 'on_hold', 'completed', 'archived', 'cancelled'])
  status?: string = 'active';

  @ApiPropertyOptional({
    description: 'رنگ پروژه (هگز)',
    example: '#3b82f6',
  })
  @IsOptional()
  @IsString()
  color?: string;

  @ApiPropertyOptional({
    description: 'آیکون پروژه',
    example: '📊',
  })
  @IsOptional()
  @IsString()
  icon?: string;

  @ApiPropertyOptional({
    description: 'تصویر کاور پروژه',
    example: 'https://example.com/cover.jpg',
  })
  @IsOptional()
  @IsString()
  coverImage?: string;

  @ApiPropertyOptional({
    description: 'تاریخ شروع پروژه',
    example: '2026-08-01',
  })
  @IsOptional()
  @IsDateString()
  startDate?: string;

  @ApiPropertyOptional({
    description: 'تاریخ پایان پروژه',
    example: '2026-12-31',
  })
  @IsOptional()
  @IsDateString()
  endDate?: string;

  @ApiPropertyOptional({
    description: 'تاریخ تحویل (due date)',
    example: '2026-11-15',
  })
  @IsOptional()
  @IsDateString()
  dueDate?: string;

  @ApiPropertyOptional({
    description: 'تنظیمات پروژه',
    default: {
      isPrivate: true,
      allowGuest: false,
      notificationEnabled: true,
      defaultView: 'board',
    },
    example: {
      isPrivate: true,
      allowGuest: false,
      notificationEnabled: true,
      defaultView: 'board',
    },
  })
  @IsOptional()
  @IsObject()
  settings?: {
    isPrivate?: boolean;
    allowGuest?: boolean;
    notificationEnabled?: boolean;
    defaultView?: 'list' | 'board' | 'timeline' | 'calendar';
  };

  @ApiPropertyOptional({
    description: 'آی‌دی کاربرانی که به عنوان عضو اضافه شوند',
    type: [Number],
    example: [2, 5, 8],
    default: [],
  })
  @IsOptional()
  @IsArray()
  @IsNumber({}, { each: true })
  memberIds?: number[] = [];
}