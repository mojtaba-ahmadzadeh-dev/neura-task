import { Entity, Column, ManyToOne, JoinColumn, OneToMany } from 'typeorm';
import { TaskEntity } from '../../task/entities/task.entity';
import { BaseEntity } from '../../../common/abestract/base.entity';
import { UserEntity } from 'src/modules/user/entity/user.entity';

@Entity('comments')
export class CommentEntity extends BaseEntity {
  @Column('text')
  content: string;
  @Column()
  taskId: number;
  @Column()
  userId: number;
  @Column({ default: false })
  accepted: boolean;
  @Column({ nullable: true })
  parentId?: number;
  @ManyToOne(() => TaskEntity, (task) => task.comments, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'taskId' })
  task: TaskEntity;
  @ManyToOne(() => UserEntity, (user) => user.comments, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'userId' })
  user: UserEntity;
  @ManyToOne(() => CommentEntity, (comment) => comment.replies, {
    nullable: true,
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'parentId' })
  parent?: CommentEntity;
  @OneToMany(() => CommentEntity, (comment) => comment.parent)
  replies: CommentEntity[];
}
