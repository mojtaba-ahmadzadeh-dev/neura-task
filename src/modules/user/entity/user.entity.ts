import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToMany,
  ManyToOne,
  OneToMany,
  OneToOne,
  UpdateDateColumn,
} from 'typeorm';
import { OtpEntity } from './otp.entity';
import { RoleEntity } from 'src/modules/rbac/entities/role.entity';
import { EntityNames } from '../../../common/enums/entity.enum';
import { BaseEntity } from '../../../common/abestract/base.entity';
import { ProjectEntity } from 'src/modules/projects/entities/project.entity';
import { CommentEntity } from 'src/modules/comment/entities/comment.entity';
import { AutomationEntity } from 'src/modules/automation/entities/automation.entity';
import { NotificationEntity } from 'src/modules/notfication/entities/notfication.entity';

@Entity(EntityNames.User)
export class UserEntity extends BaseEntity {
  @Column({ nullable: true })
  firstName: string;
  @Column({ nullable: true })
  lastName: string;
  @Column({ unique: true, nullable: true })
  phone: string;
  @Column({ unique: true, nullable: true })
  email: string;
  @Column({ select: false, nullable: true })
  password: string;
  @Column({ default: false })
  isPhoneVerified: boolean;
  @Column({ nullable: true })
  avatar?: string;
  @Column({ name: 'role_id' })
  roleId: number;
  @ManyToOne(() => RoleEntity, {
    eager: false,
    nullable: false,
  })
  @JoinColumn({ name: 'role_id' })
  role: RoleEntity;
  @Column({ default: false })
  isEmailVerified: boolean;
  @Column({ default: true })
  isActive: boolean;
  @CreateDateColumn()
  createdAt: Date;
  @UpdateDateColumn()
  updatedAt: Date;
  @OneToOne(() => OtpEntity, (otp) => otp.user)
  @JoinColumn()
  otp: OtpEntity;
  @ManyToMany(() => ProjectEntity, (project) => project.members)
  projects: ProjectEntity[];
  @OneToMany(() => CommentEntity, (comment) => comment.user)
  comments: CommentEntity[];
  @OneToMany(() => AutomationEntity, (automation) => automation.user)
  automations: AutomationEntity[];
  @OneToMany(() => NotificationEntity, (notification) => notification.receiver)
  notifications: NotificationEntity[];
}
