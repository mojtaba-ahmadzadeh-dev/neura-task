import { UserEntity } from "src/modules/user/entity/user.entity";
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from "typeorm";

export enum TaskStatus {
  TODO = "TODO",
  IN_PROGRESS = "IN_PROGRESS",
  DONE = "DONE",
}

export enum TaskPriority {
  LOW = "LOW",
  MEDIUM = "MEDIUM",
  HIGH = "HIGH",
}

@Entity("tasks")
export class TaskEntity {
  @PrimaryGeneratedColumn("increment")
  id: number;

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

  @Column({ default: false })
  isCompleted: boolean;

  @Column({ name: "assignee_id", nullable: true })
  assigneeId?: number;
  @ManyToOne(() => UserEntity, { nullable: true, eager: false })
  @JoinColumn({ name: "assignee_id" })
  assignee?: UserEntity;
  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
