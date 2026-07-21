import {
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsPhoneNumber,
  IsString,
  MaxLength,
  MinLength,
  ValidateIf,
} from "class-validator";
import { ApiProperty } from "@nestjs/swagger";

export enum RegisterMethod {
  PHONE = "phone",
  EMAIL = "email",
}

export class RegisterDto {
  @ApiProperty({ enum: RegisterMethod, example: "phone" })
  @IsEnum(RegisterMethod)
  @IsNotEmpty()
  method: RegisterMethod;
  @ApiProperty({ required: false, example: "09123456789" })
  @IsOptional()
  @IsPhoneNumber("IR")
  @ValidateIf((o) => o.method === RegisterMethod.PHONE)
  phone?: string;
  @ApiProperty({ required: false, example: "user@example.com" })
  @IsOptional()
  @IsEmail()
  @ValidateIf((o) => o.method === RegisterMethod.EMAIL)
  email?: string;
  @ApiProperty({ required: false, example: "StrongPass123" })
  @IsOptional()
  @IsString()
  @MinLength(8)
  @ValidateIf((o) => o.method === RegisterMethod.EMAIL)
  password?: string;
}

export class VerifyOtpDto {
  @ApiProperty({ enum: RegisterMethod, example: "phone" })
  @IsEnum(RegisterMethod)
  @IsNotEmpty()
  method: RegisterMethod;
  @ApiProperty({ required: false, example: "09123456789" })
  @IsOptional()
  @IsPhoneNumber("IR")
  @ValidateIf((o) => o.method === RegisterMethod.PHONE)
  phone?: string;
  @ApiProperty({ required: false, example: "user@example.com" })
  @IsOptional()
  @IsEmail()
  @ValidateIf((o) => o.method === RegisterMethod.EMAIL)
  email?: string;
  @ApiProperty({ example: "123456" })
  @IsString()
  @IsNotEmpty()
  code: string;
}

export class LoginDto {
  @ApiProperty({ enum: RegisterMethod, example: "email" })
  @IsEnum(RegisterMethod)
  @IsNotEmpty()
  method: RegisterMethod;
  @ApiProperty({ required: false, example: "09123456789" })
  @IsOptional()
  @IsPhoneNumber("IR")
  @ValidateIf((o) => o.method === RegisterMethod.PHONE)
  phone?: string;
  @ApiProperty({ required: false, example: "user@example.com" })
  @IsOptional()
  @IsEmail()
  @ValidateIf((o) => o.method === RegisterMethod.EMAIL)
  email?: string;
  @ApiProperty({ required: false, example: "StrongPass123" })
  @IsOptional()
  @IsString()
  @MinLength(8)
  @ValidateIf((o) => o.method === RegisterMethod.EMAIL)
  password?: string;
  @ApiProperty({ required: false, example: "123456" })
  @IsOptional()
  @IsString()
  @ValidateIf((o) => o.method === RegisterMethod.PHONE)
  code?: string;
}
export class ForgotPasswordDto {
  @ApiProperty({ example: "user@example.com" })
  @IsEmail()
  @IsNotEmpty()
  email: string;
}

export class ResetPasswordDto {
  @ApiProperty({ example: "user@example.com" })
  @IsEmail()
  @IsNotEmpty()
  email: string;
  @ApiProperty({ example: "123456" })
  @IsString()
  @IsNotEmpty()
  code: string;
  @ApiProperty({ example: "NewStrongPass123" })
  @IsString()
  @IsNotEmpty()
  @MinLength(8)
  newPassword: string;
}
