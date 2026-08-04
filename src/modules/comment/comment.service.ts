import {
  Inject,
  Injectable,
  Scope,
  NotFoundException,
  UnauthorizedException,
  ForbiddenException,
} from '@nestjs/common';
import { CreateCommentDto } from './dto/create-comment.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { CommentEntity } from './entities/comment.entity';
import { IsNull, Repository } from 'typeorm';
import { TaskEntity } from '../task/entities/task.entity';
import { REQUEST } from '@nestjs/core';
import type { Request } from 'express';
import { paginationGenerator, paginationSolver } from 'src/common/utils/pagination.utils';
import { PaginationDto } from 'src/common/dto/pagination.dto';
import { CommentMessage } from 'src/common/enums/message.enum';
import { UpdateCommentDto } from './dto/update-comment.dto';

@Injectable({ scope: Scope.REQUEST })
export class CommentService {
  constructor(
    @InjectRepository(CommentEntity)
    private commentRepository: Repository<CommentEntity>,
    @InjectRepository(TaskEntity)
    private taskRepository: Repository<TaskEntity>,
    @Inject(REQUEST) private request: Request,
  ) {}

  async create(taskId: number, createCommentDto: CreateCommentDto) {
    const userId = this.request.user?.id;

    if (!userId) {
      throw new UnauthorizedException(CommentMessage.USER_UNAUTHORIZED);
    }

    const task = await this.taskRepository.findOne({
      where: { id: taskId },
    });

    if (!task) {
      throw new NotFoundException(CommentMessage.TASK_NOT_FOUND);
    }

    const { content, parentId, ...rest } = createCommentDto;

    const comment = this.commentRepository.create({
      content,
      parentId,
      taskId,
      userId,
      accepted: false,
      ...rest,
    });

    return this.commentRepository.save(comment);
  }
  async findAll(paginationDto: PaginationDto) {
    const { page, limit, skip } = paginationSolver(paginationDto);

    const [comments, totalCount] = await this.commentRepository.findAndCount({
      where: {
        accepted: true,
      },
      relations: {
        user: true,
        task: true,
        parent: true,
        replies: {
          user: true,
        },
      },
      order: {
        id: 'DESC',
      },
      skip,
      take: limit,
    });

    const pagination = paginationGenerator(totalCount, page, limit);

    return {
      data: comments,
      pagination,
    };
  }
  async findAllByTask(taskId: number, paginationDto: PaginationDto) {
    const task = await this.taskRepository.findOne({ where: { id: taskId } });
    if (!task) {
      throw new NotFoundException(CommentMessage.TASK_NOT_FOUND);
    }

    const { page, limit, skip } = paginationSolver(paginationDto);

    const [comments, totalCount] = await this.commentRepository.findAndCount({
      where: {
        taskId,
        parentId: IsNull(),
        accepted: true,
      },
      relations: {
        user: true,
        replies: {
          user: true,
        },
      },
      order: {
        id: 'DESC',
      },
      skip,
      take: limit,
    });

    const pagination = paginationGenerator(totalCount, page, limit);

    return {
      data: comments,
      pagination,
    };
  }
  async findOne(id: number) {
    const comment = await this.commentRepository.findOne({
      where: { id, accepted: true },
      relations: {
        user: true,
        task: true,
        parent: true,
        replies: {
          user: true,
        },
      },
    });

    if (!comment) {
      throw new NotFoundException(CommentMessage.COMMENT_NOT_FOUND);
    }

    return comment;
  }
  async remove(id: number) {
    const comment = await this.commentRepository.findOne({ where: { id } });

    if (!comment) {
      throw new NotFoundException(CommentMessage.COMMENT_NOT_FOUND);
    }

    await this.commentRepository.remove(comment);

    return {
      message: CommentMessage.COMMENT_DELETED_SUCCESSFULLY,
    };
  }
  async accept(id: number) {
    const userId = this.request.user?.id;

    if (!userId) {
      throw new UnauthorizedException(CommentMessage.USER_UNAUTHORIZED);
    }

    const comment = await this.commentRepository.findOne({
      where: { id },
    });

    if (!comment) {
      throw new NotFoundException(CommentMessage.COMMENT_NOT_FOUND);
    }

    comment.accepted = !comment.accepted;
    await this.commentRepository.save(comment);

    return {
      message: comment.accepted
        ? CommentMessage.COMMENT_ACCEPTED_SUCCESSFULLY
        : CommentMessage.COMMENT_REJECTED_SUCCESSFULLY,
      accepted: comment.accepted,
    };
  }
  async update(id: number, updateCommentDto: UpdateCommentDto) {
    const userId = this.request.user?.id;

    if (!userId) {
      throw new UnauthorizedException(CommentMessage.USER_UNAUTHORIZED);
    }

    const comment = await this.commentRepository.findOne({
      where: { id },
    });

    if (!comment) {
      throw new NotFoundException(CommentMessage.COMMENT_NOT_FOUND);
    }

    if (comment.userId !== userId) {
      throw new ForbiddenException(CommentMessage.USER_UNAUTHORIZED);
    }

    const { content, ...rest } = updateCommentDto;

    Object.assign(comment, {
      ...(content !== undefined && { content }),
      ...rest,
    });

    await this.commentRepository.save(comment);

    return {
      message: CommentMessage.COMMENT_UPDATED_SUCCESSFULLY,
      data: comment,
    };
  }
}
