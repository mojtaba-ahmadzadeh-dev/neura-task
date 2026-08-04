import { UserEntity } from 'src/modules/user/entity/user.entity';
import { BaseEntity } from '../../../common/abestract/base.entity';
import { Column, Entity, ManyToOne, JoinColumn } from 'typeorm';

@Entity('attachment')
export class AttachmentEntity extends BaseEntity {
  @Column()
  originalName: string;
  @Column()
  key: string;
  @Column({ nullable: true })
  url: string;
  @Column()
  mimetype: string;
  @Column({ type: 'bigint' })
  size: number;
  @ManyToOne(() => UserEntity, { onDelete: 'SET NULL', nullable: true })
  @JoinColumn({ name: 'uploadedById' })
  uploadedBy: UserEntity;
  @Column({ nullable: true })
  uploadedById: number;
}
