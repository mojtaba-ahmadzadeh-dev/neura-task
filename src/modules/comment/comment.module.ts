import { Module } from "@nestjs/common";
import { CommentService } from "./comment.service";
import { CommentController } from "./comment.controller";
import { TypeOrmModule } from "@nestjs/typeorm";
import { CommentEntity } from "./entities/comment.entity";
import { TaskEntity } from "../task/entities/task.entity";
import { JwtService } from "@nestjs/jwt";
import { UserRepository } from "../user/repository/user.repository";
import { UserEntity } from "../user/entity/user.entity";

@Module({
  imports: [TypeOrmModule.forFeature([UserEntity, CommentEntity, TaskEntity])],
  controllers: [CommentController],
  providers: [CommentService, JwtService, UserRepository],
})
export class CommentModule {}
