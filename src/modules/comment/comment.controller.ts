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
} from "@nestjs/common";
import { CommentService } from "./comment.service";
import { CreateCommentDto } from "./dto/create-comment.dto";
import { UpdateCommentDto } from "./dto/update-comment.dto";
import { RbacGuard } from "../rbac/guards/rbac.guard";

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
}
