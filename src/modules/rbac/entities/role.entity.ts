import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToMany,
  CreateDateColumn,
  UpdateDateColumn,
  JoinTable,
} from "typeorm";
import { PermissionEntity } from "./permission.entity";

@Entity("roles")
export class RoleEntity {
  @PrimaryGeneratedColumn("increment")
  id: number;
  @Column({
    unique: true,
  })
  name: string;
  @ManyToMany(() => PermissionEntity, (permission) => permission.roles)
  @JoinTable({
    name: "role_permissions",
    joinColumn: {
      name: "roleId",
      referencedColumnName: "id",
    },
    inverseJoinColumn: {
      name: "permissionId",
      referencedColumnName: "id",
    },
  })
  permissions: PermissionEntity[];
  @CreateDateColumn()
  createdAt: Date;
  @UpdateDateColumn()
  updatedAt: Date;
}
