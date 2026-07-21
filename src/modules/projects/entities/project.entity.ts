import {
  Entity,
  Column,
  ManyToOne,
  ManyToMany,
  JoinTable,
  OneToMany,
  Index,
} from "typeorm";
import { EntityNames } from "../../../common/enums/entity.enum";
import { TaskEntity } from "../../task/entities/task.entity";
import { BaseEntity } from "../../../common/abestract/base.entity";
import { UserEntity } from "../../../modules/user/entity/user.entity";

@Entity(EntityNames.Projects)
export class ProjectEntity extends BaseEntity {
  @Index()
  @Column({ type: "varchar", length: 255 })
  title: string;
  @Column({ type: "text", nullable: true })
  description?: string;
  @Column({
    type: "enum",
    enum: ["active", "on_hold", "completed", "archived", "cancelled"],
    default: "active",
  })
  status: string;
  @Column({ type: "varchar", length: 7, nullable: true })
  color?: string;
  @Column({ type: "varchar", length: 100, nullable: true })
  icon?: string;
  @Column({ type: "varchar", nullable: true })
  coverImage?: string;
  @Column({ type: "timestamp", nullable: true })
  startDate?: Date;
  @Column({ type: "timestamp", nullable: true })
  endDate?: Date;
  @Column({ type: "timestamp", nullable: true })
  dueDate?: Date;
  @ManyToOne(() => UserEntity, (user) => user.ownedProjects, {
    nullable: false,
  })
  owner: UserEntity;
  @Column()
  ownerId: number;
  @ManyToMany(() => UserEntity, (user) => user.projects, { cascade: true })
  @JoinTable({
    name: "project_members",
    joinColumn: { name: "projectId" },
    inverseJoinColumn: { name: "userId" },
  })
  members: UserEntity[];
  @OneToMany(() => TaskEntity, (task) => task.project, { cascade: true })
  tasks: TaskEntity[];
  @Column({ type: "json", nullable: true })
  settings?: {
    isPrivate?: boolean;
    allowGuest?: boolean;
    notificationEnabled?: boolean;
    defaultView?: "list" | "board" | "timeline" | "calendar";
  };
  @Column({ default: 0 })
  taskCount: number;
  @Column({ default: 0 })
  completedTaskCount: number;
  @Column({ type: "decimal", precision: 5, scale: 2, default: 0 })
  progress: number;
}
