import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsOptional, IsNumber } from 'class-validator';

export class CreateCommentDto {
  @ApiProperty({
    description: 'متن کامنت',
    example: 'این تسک باید تا آخر هفته تمام شود.',
    default: '',
  })
  @IsString()
  @IsNotEmpty()
  content: string;

  @ApiProperty({
    description: 'آیدی کامنت والد (برای ریپلای)',
    example: 15,
    required: false,
    nullable: true,
  })
  @IsOptional()
  @IsNumber()
  parentId?: number;
}
