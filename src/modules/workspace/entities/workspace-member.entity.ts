import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Workspace } from './workspace.entity';
import { UserEntity } from 'src/modules/user/entity/user.entity';
import { Roles } from 'src/common/enums/role.enum';

@Entity('workspace_members')
export class WorkspaceMember {
  @PrimaryGeneratedColumn('increment')
  id: number;
  @ManyToOne(() => Workspace, (workspace) => workspace.members, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'workspaceId' })
  workspace: Workspace;
  @Column()
  workspaceId: number;
  @ManyToOne(() => UserEntity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'userId' })
  user: UserEntity;
  @Column()
  userId: number;
  @Column({
    type: 'enum',
    enum: Roles,
    default: Roles.MEMBER,
  })
  role: Roles;
  @CreateDateColumn()
  joinedAt: Date;
}
