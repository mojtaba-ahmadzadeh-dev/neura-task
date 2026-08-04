import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, UpdateDateColumn } from 'typeorm';
import { BaseEntity } from '../../../common/abestract/base.entity';
import { DayOfWeek } from 'src/common/enums/day-of-week.enum';
import { TaskEntity } from 'src/modules/task/entities/task.entity';
import { UserEntity } from 'src/modules/user/entity/user.entity';
import { Workspace } from 'src/modules/workspace/entities/workspace.entity';
import { AutomationType } from 'src/common/enums/automation-type.enum';

@Entity('automation')
export class AutomationEntity extends BaseEntity {
  @Column({
    type: 'enum',
    enum: AutomationType,
  })
  type: AutomationType;
  @Column()
  taskId: number;
  @Column()
  userId: number;
  @Column({ type: 'boolean', default: true })
  active: boolean;
  @Column()
  workspaceId: number;
  @Column('simple-array')
  daysOfWeek: DayOfWeek[];
  @Column({ type: 'time' })
  timeOfDay: string;
  @Column({ default: 'Asia/Tehran' })
  timezone: string;
  @Column({ nullable: true })
  lastRunAt: Date;
  @Column({ nullable: true })
  nextRunAt: Date;
  @CreateDateColumn()
  createdAt: Date;
  @UpdateDateColumn()
  updatedAt: Date;
  @ManyToOne(() => TaskEntity, (task) => task.automations, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'taskId' })
  task: TaskEntity;
  @ManyToOne(() => UserEntity, (user) => user.automations, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'userId' })
  user: UserEntity;
  @ManyToOne(() => Workspace, (workspace) => workspace.automations, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'workspaceId' })
  workspace: Workspace;
}
