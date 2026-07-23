import {
  Entity,
  Column,
  ManyToOne,
  ManyToMany,
  JoinTable,
  OneToMany,
  Index,
  JoinColumn,
} from "typeorm";
import { EntityNames } from "../../../common/enums/entity.enum";
import { BaseEntity } from "../../../common/abestract/base.entity";
import { UserEntity } from "../../../modules/user/entity/user.entity";
import { Workspace } from "src/modules/workspace/entities/workspace.entity";

@Entity(EntityNames.Projects)
export class ProjectEntity extends BaseEntity {
  @Index()
  @Column({ type: "varchar", length: 255 })
  title: string;
  @Column({ type: "text", nullable: true })
  description?: string;
  @Column()
  createBy: number;
  @ManyToOne(() => Workspace, { nullable: false, onDelete: "CASCADE" })
  @JoinColumn({ name: "workspaceId" })
  workspace: Workspace;
  @Column()
  workspaceId: number;
  @ManyToMany(() => UserEntity, (user) => user.projects, {
    cascade: true,
  })
   @JoinTable()
  members: UserEntity[];
}
