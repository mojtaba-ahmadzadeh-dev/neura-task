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
} from "@nestjs/common";
import { CommentService } from "./comment.service";
import { CreateCommentDto } from "./dto/create-comment.dto";
import { UpdateCommentDto } from "./dto/update-comment.dto";
import { RbacGuard } from "../rbac/guards/rbac.guard";
import { PaginationDto } from "src/common/dto/pagination.dto";
import { Pagination } from "src/common/decorators/pagination.decorator";

@Controller("comment")
@UseGuards(RbacGuard)
export class CommentController {
  constructor(private readonly commentService: CommentService) {}

  @Post(":taskId/comments")
  async create(
    @Param("taskId", ParseIntPipe) taskId: number,
    @Body() createCommentDto: CreateCommentDto,
  ) {
    return this.commentService.create(taskId, createCommentDto);
  }

  @Get(":taskId/comments")
  @Pagination() // decorator شما
  async findAllTask(
    @Param("taskId", ParseIntPipe) taskId: number,
    @Query() paginationDto: PaginationDto,
  ) {
    return this.commentService.findAllByTask(taskId, paginationDto);
  }

  @Get()
  @Pagination()
  async findAll(@Query() paginationDto: PaginationDto) {
    return this.commentService.findAll(paginationDto);
  }

  @Get(":id")
  async findOne(@Param("id", ParseIntPipe) id: number) {
    return this.commentService.findOne(id);
  }

  @Delete(":id")
  async remove(@Param("id", ParseIntPipe) id: number) {
    return this.commentService.remove(id);
  }
}
