import { IsEnum, IsOptional, IsString, IsDateString, IsBoolean, IsNumber } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { TaskPriority, TaskStatus } from 'src/common/enums/task.status.enum';

export class CreateTaskDto {
  @ApiProperty({
    example: 'Create Task API',
    description: 'Task title',
  })
  @IsString()
  title: string;
  @ApiPropertyOptional({
    example: 'Implement task creation endpoint',
    description: 'Task description',
  })
  @IsOptional()
  @IsString()
  description?: string;
  @ApiPropertyOptional({
    enum: TaskStatus,
    default: TaskStatus.TODO,
    example: TaskStatus.TODO,
    description: 'Current task status',
  })
  @IsOptional()
  @IsEnum(TaskStatus)
  status?: TaskStatus;
  @ApiPropertyOptional({
    enum: TaskPriority,
    default: TaskPriority.MEDIUM,
    example: TaskPriority.HIGH,
    description: 'Task priority level',
  })
  @IsOptional()
  @IsEnum(TaskPriority)
  priority?: TaskPriority;
  @ApiPropertyOptional({
    example: '2026-08-01',
  })
  @IsOptional()
  @IsDateString()
  dueDate?: string;
  @ApiPropertyOptional({
    default: false,
    example: false,
    description: 'Task completion status',
  })
  @IsOptional()
  @IsBoolean()
  isCompleted?: boolean;
  @ApiPropertyOptional({ example: 5, description: 'آیدی کاربر' })
  @IsOptional()
  @IsNumber()
  assigneeId?: number;
}

export class AssignTaskDto {
  @ApiProperty({
    example: 5,
    description: 'آیدی کاربر',
    required: true,
  })
  @IsNumber()
  assigneeId: number;
}
