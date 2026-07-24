import { Inject, Injectable, Scope, NotFoundException } from "@nestjs/common";
import { CreateCommentDto } from "./dto/create-comment.dto";
import { InjectRepository } from "@nestjs/typeorm";
import { CommentEntity } from "./entities/comment.entity";
import { Repository } from "typeorm";
import { TaskEntity } from "../task/entities/task.entity";
import { REQUEST } from "@nestjs/core";
import type { Request } from "express";

@Injectable({ scope: Scope.REQUEST })
export class CommentService {
  constructor(
    @InjectRepository(CommentEntity)
    private commentRepository: Repository<CommentEntity>,

    @InjectRepository(TaskEntity)
    private taskRepository: Repository<TaskEntity>,

    @Inject(REQUEST) private request: Request
  ) {}

  async create(taskId: number, createCommentDto: CreateCommentDto) {
    const userId = this.request.user?.id

    if (!userId) {
      throw new Error("User not authenticated");
    }

    const task = await this.taskRepository.findOne({
      where: { id: taskId },
    });

    if (!task) {
      throw new NotFoundException(`Task with ID ${taskId} not found`);
    }

    // destructuring DTO + اضافه کردن userId و taskId
    const { content, parentId, ...rest } = createCommentDto;

    const comment = this.commentRepository.create({
      content,
      parentId,
      taskId,
      userId,
      ...rest, // اگر فیلدهای اضافی در آینده اضافه شد
    });

    return this.commentRepository.save(comment);
  }
}