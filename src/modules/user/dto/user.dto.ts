import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEmail, IsInt, IsNotEmpty, IsOptional, IsString, Length } from 'class-validator';

export class UpdateUserRoleDto {
  @ApiProperty({ example: 2, description: 'شناسه نقش جدید کاربر' })
  @IsNotEmpty()
  @IsInt()
  roleId: number;
}

export class UpdateUserDto {
  @ApiPropertyOptional({ example: 'علی' })
  @IsOptional()
  @IsString()
  @Length(2, 50)
  firstName?: string;
  @ApiPropertyOptional({ example: 'رضایی' })
  @IsOptional()
  @IsString()
  @Length(2, 50)
  lastName?: string;
  @ApiPropertyOptional({ example: 'user@example.com' })
  @IsOptional()
  @IsEmail()
  email?: string;
  @ApiPropertyOptional({
    type: 'string',
    format: 'binary',
    description: 'فایل آواتار کاربر',
  })
  @IsOptional()
  avatar?: any; // فایل توسط Multer هندل میشه، نه class-validator
}
