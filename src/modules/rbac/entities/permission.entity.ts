import { Entity, Column, ManyToMany, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { RoleEntity } from './role.entity';
import { BaseEntity } from '../../../common/abestract/base.entity';
import { EntityNames } from '../../../common/enums/entity.enum';

@Entity(EntityNames.Permissions)
export class PermissionEntity extends BaseEntity {
  @Column({
    unique: true,
  })
  name: string;
  @Column({
    nullable: true,
    default: '',
  })
  description?: string;
  @ManyToMany(() => RoleEntity, (role) => role.permissions)
  roles: RoleEntity[];
  @CreateDateColumn()
  createdAt: Date;
  @UpdateDateColumn()
  updatedAt: Date;
}
