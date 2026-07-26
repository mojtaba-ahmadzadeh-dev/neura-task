// src/modules/automation/dto/create-automation.dto.ts
import {
  IsEnum,
  IsInt,
  IsBoolean,
  IsOptional,
  IsArray,
  ArrayNotEmpty,
  Matches,
  IsString,
  ValidateIf,
} from "class-validator";
import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { AutomationType } from "src/common/enums/automation-type.enum";
import { DayOfWeek } from "src/common/enums/day-of-week.enum";
import { Type } from "class-transformer";
import { PaginationDto } from "src/common/dto/pagination.dto";

export class CreateAutomationDto {
  @ApiProperty({ enum: AutomationType, example: AutomationType.RECURRING })
  @IsEnum(AutomationType, {
    message: "type باید یکی از مقادیر recurring یا reminder باشد",
  })
  type: AutomationType;
  @ApiProperty({ example: 10, description: "شناسه تسک مرتبط" })
  @IsInt({ message: "taskId باید عدد صحیح باشد" })
  taskId: number;
  @ApiProperty({ example: 3, description: "شناسه ورک‌اسپیس" })
  @IsInt({ message: "workspaceId باید عدد صحیح باشد" })
  workspaceId: number;
  @ApiPropertyOptional({ default: true })
  @IsOptional()
  @IsBoolean()
  active?: boolean;
  @ApiPropertyOptional({
    enum: DayOfWeek,
    isArray: true,
    example: [DayOfWeek.MONDAY, DayOfWeek.WEDNESDAY],
  })
  @ValidateIf((dto) => dto.type === AutomationType.RECURRING)
  @IsArray({ message: "daysOfWeek باید آرایه‌ای از روزها باشد" })
  @ArrayNotEmpty({
    message: "برای automation از نوع recurring حداقل یک روز باید مشخص شود",
  })
  @IsEnum(DayOfWeek, { each: true, message: "مقدار نامعتبر برای روز هفته" })
  daysOfWeek?: DayOfWeek[];
  @ApiProperty({
    example: "09:00:00",
    description: "زمان اجرا به فرمت HH:mm:ss",
  })
  @Matches(/^([01]\d|2[0-3]):([0-5]\d):([0-5]\d)$/, {
    message: "timeOfDay باید با فرمت HH:mm:ss باشد",
  })
  timeOfDay: string;
  @ApiPropertyOptional({ default: "Asia/Tehran" })
  @IsOptional()
  @IsString()
  timezone?: string;
}

export class FilterAutomationDto extends PaginationDto {}