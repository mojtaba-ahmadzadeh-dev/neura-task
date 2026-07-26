import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
  ManyToOne,
  JoinColumn,
  OneToMany,
} from "typeorm";
import { UserEntity } from "src/modules/user/entity/user.entity";
import { WorkspaceMember } from "./workspace-member.entity";
import { ProjectEntity } from "src/modules/projects/entities/project.entity";
import { AutomationEntity } from "src/modules/automation/entities/automation.entity";

@Entity("workspaces")
export class Workspace {
  @PrimaryGeneratedColumn("increment")
  id: number;
  @Column({ length: 120 })
  name: string;
  @Column({ length: 150, unique: true })
  slug: string;
  @Column({ type: "text", nullable: true })
  description: string;
  @Column({ default: true })
  isActive: boolean;
  @ManyToOne(() => UserEntity, { nullable: false, onDelete: "CASCADE" })
  @JoinColumn({ name: "ownerId" })
  owner: UserEntity;
  @Column()
  ownerId: number;
  @OneToMany(() => WorkspaceMember, (member) => member.workspace)
  members: WorkspaceMember[];
  @CreateDateColumn()
  createdAt: Date;
  @UpdateDateColumn()
  updatedAt: Date;
  @DeleteDateColumn()
  deletedAt?: Date;
  @OneToMany(() => ProjectEntity, (project) => project.workspace)
  projects: ProjectEntity[];
  @OneToMany(() => AutomationEntity, (automation) => automation.workspace)
  automations: AutomationEntity[];
}
