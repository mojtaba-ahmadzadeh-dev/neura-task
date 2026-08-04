import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  ParseIntPipe,
  UseGuards,
  Query,
} from '@nestjs/common';
import { CommentService } from './comment.service';
import { CreateCommentDto } from './dto/create-comment.dto';
import { UpdateCommentDto } from './dto/update-comment.dto';
import { RbacGuard } from '../rbac/guards/rbac.guard';
import { PaginationDto } from 'src/common/dto/pagination.dto';
import { Pagination } from 'src/common/decorators/pagination.decorator';

@Controller('comment')
@UseGuards(RbacGuard)
export class CommentController {
  constructor(private readonly commentService: CommentService) {}

  @Post(':taskId/create')
  create(
    @Param('taskId', ParseIntPipe) taskId: number,
    @Body() createCommentDto: CreateCommentDto,
  ) {
    return this.commentService.create(taskId, createCommentDto);
  }

  @Get(':taskId')
  @Pagination()
  findAllTask(
    @Param('taskId', ParseIntPipe) taskId: number,
    @Query() paginationDto: PaginationDto,
  ) {
    return this.commentService.findAllByTask(taskId, paginationDto);
  }

  @Get()
  @Pagination()
  findAll(@Query() paginationDto: PaginationDto) {
    return this.commentService.findAll(paginationDto);
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.commentService.findOne(id);
  }

  @Delete(':id/delete')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.commentService.remove(id);
  }

  @Patch(':id/accept/admin')
  accept(@Param('id', ParseIntPipe) id: number) {
    return this.commentService.accept(id);
  }

  @Patch(':id/update')
  update(@Param('id', ParseIntPipe) id: number, @Body() updateCommentDto: UpdateCommentDto) {
    return this.commentService.update(id, updateCommentDto);
  }
}
