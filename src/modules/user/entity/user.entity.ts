import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from "typeorm";
import { OtpEntity } from "./otp.entity";
import { RoleEntity } from "src/modules/rbac/entities/role.entity";

@Entity("users")
export class UserEntity {
  @PrimaryGeneratedColumn("increment")
  id: number;
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
  @Column({ name: "role_id" })
  roleId: number;
  @ManyToOne(() => RoleEntity, {
    eager: false,
    nullable: false,
  })
  @JoinColumn({ name: "role_id" })
  role: RoleEntity;
  @Column({ default: false })
  isEmailVerified: boolean;
  @Column({ nullable: true })
  emailVerificationToken?: string;
  @Column({ nullable: true, type: "timestamp" })
  emailVerificationExpires?: Date;
  @Column({ nullable: true })
  resetPasswordToken?: string;
  @Column({ nullable: true, type: "timestamp" })
  resetPasswordExpires?: Date;
  @Column({ default: true })
  isActive: boolean;
  @CreateDateColumn()
  createdAt: Date;
  @UpdateDateColumn()
  updatedAt: Date;
  @OneToOne(() => OtpEntity, (otp) => otp.user)
  @JoinColumn()
  otp: OtpEntity;
}
