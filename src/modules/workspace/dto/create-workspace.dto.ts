import { ApiProperty } from "@nestjs/swagger";
import { IsEmail, IsEnum, IsNotEmpty, IsOptional, IsString, MaxLength } from "class-validator";
import { Roles } from "src/common/enums/role.enum";

export class CreateWorkspaceDto {
  @ApiProperty({ example: "پروژه مدیریت تیمی" })
  @IsNotEmpty()
  @IsString()
  @MaxLength(120)
  name: string;

  @ApiProperty({ required: false, example: "توضیحات workspace" })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  description?: string;
}

export class CreateInviteDto {
  @ApiProperty({ example: "user@example.com" })
  @IsEmail({}, { message: "ایمیل معتبر نیست" })
  email: string;

  @ApiProperty({ enum: Roles, required: false, example: Roles.MEMBER })
  @IsOptional()
  @IsEnum(Roles, { message: "نقش نامعتبر است" })
  role?: Roles;
}

export class UpdateMemberRoleDto {
  @ApiProperty({ enum: Roles, example: Roles.Admin })
  @IsEnum(Roles, { message: "نقش نامعتبر است" })
  role: Roles;
}