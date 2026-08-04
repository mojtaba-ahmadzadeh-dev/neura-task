import { Entity, Column, ManyToMany, CreateDateColumn, UpdateDateColumn, JoinTable } from 'typeorm';
import { PermissionEntity } from './permission.entity';
import { BaseEntity } from '../../../common/abestract/base.entity';
import { EntityNames } from '../../../common/enums/entity.enum';

@Entity(EntityNames.Roles)
export class RoleEntity extends BaseEntity {
  @Column({
    unique: true,
  })
  name: string;
  @ManyToMany(() => PermissionEntity, (permission) => permission.roles)
  @JoinTable({
    name: 'role_permissions',
    joinColumn: {
      name: 'roleId',
      referencedColumnName: 'id',
    },
    inverseJoinColumn: {
      name: 'permissionId',
      referencedColumnName: 'id',
    },
  })
  permissions: PermissionEntity[];
  @CreateDateColumn()
  createdAt: Date;
  @UpdateDateColumn()
  updatedAt: Date;
}
