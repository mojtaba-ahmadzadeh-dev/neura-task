import { EntityNames } from "src/common/enums/entity.enum";
import { UserEntity } from "../../../modules/user/entity/user.entity";
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  OneToMany,
} from "typeorm";
import {
  TaskPriority,
  TaskStatus,
} from "../../../common/enums/task.status.enum";
import { BaseEntity } from "../../../common/abestract/base.entity";
import { ProjectEntity } from "src/modules/projects/entities/project.entity";
import { CommentEntity } from "src/modules/comment/entities/comment.entity";

@Entity(EntityNames.Tasks)
export class TaskEntity extends BaseEntity {
  @Column({ length: 150 })
  title: string;
  @Column({ type: "text", nullable: true })
  description?: string;
  @Column({
    type: "enum",
    enum: TaskStatus,
    default: TaskStatus.TODO,
  })
  status: TaskStatus;
  @Column({
    type: "enum",
    enum: TaskPriority,
    default: TaskPriority.MEDIUM,
  })
  priority: TaskPriority;
  @Column({ type: "date", nullable: true })
  dueDate?: Date;
  @Column({ name: "assignee_id", nullable: true })
  assigneeId?: number;
  @ManyToOne(() => UserEntity, { nullable: true, eager: false })
  @JoinColumn({ name: "assignee_id" })
  assignee?: UserEntity;
  @CreateDateColumn()
  createdAt: Date;
  @UpdateDateColumn()
  updatedAt: Date;
  @OneToMany(() => CommentEntity, (comment) => comment.task, {
    cascade: true,
  })
  comments: CommentEntity[];
}
