import {
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  IsObject,
  MaxLength,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { NotificationType } from 'src/common/enums/notification-type.enum';
import { NotificationResource } from 'src/common/enums/notification-resource.enum';

export class CreateNotficationDto {
  @ApiProperty({
    description: 'آیدی کاربر گیرنده نوتیفیکیشن',
    example: 12,
  })
  @IsNumber()
  @IsNotEmpty()
  receiverId: number;

  @ApiProperty({
    description: 'نوع نوتیفیکیشن',
    enum: NotificationType,
    example: 'FOLLOW',
  })
  @IsEnum(NotificationType)
  @IsNotEmpty()
  type: NotificationType;

  @ApiProperty({
    description: 'عنوان نوتیفیکیشن',
    example: 'فالو جدید',
    maxLength: 150,
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(150)
  title: string;

  @ApiProperty({
    description: 'متن نوتیفیکیشن',
    example: 'علی شما را دنبال کرد',
  })
  @IsString()
  @IsNotEmpty()
  message: string;

  @ApiPropertyOptional({
    description: 'نوع منبع مرتبط با نوتیفیکیشن',
    enum: NotificationResource,
    example: NotificationResource.USER,
  })
  @IsEnum(NotificationResource)
  @IsOptional()
  resourceType?: NotificationResource;

  @ApiPropertyOptional({
    description: 'آیدی منبع مرتبط',
    example: 45,
  })
  @IsNumber()
  @IsOptional()
  resourceId?: number;

  @ApiPropertyOptional({
    description: 'اطلاعات اضافی (اختیاری)',
    example: { username: 'ali', postId: 10 },
  })
  @IsObject()
  @IsOptional()
  metadata?: Record<string, any>;

  @ApiPropertyOptional({
    description: 'لینک اکشن وقتی روی نوتیفیکیشن کلیک شد',
    example: '/profile/ali',
  })
  @IsString()
  @IsOptional()
  actionUrl?: string;
}
