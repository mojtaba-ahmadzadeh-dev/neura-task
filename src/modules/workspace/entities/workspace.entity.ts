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
}