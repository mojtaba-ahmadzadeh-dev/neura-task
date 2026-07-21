import { Column, Entity, OneToOne, PrimaryGeneratedColumn } from "typeorm";
import { UserEntity } from "./user.entity";
import { EntityNames } from "../../../common/enums/entity.enum";
import { BaseEntity } from "../../../common/abestract/base.entity";

@Entity(EntityNames.Otp)
export class OtpEntity extends BaseEntity {
  @Column()
  code: string;
  @Column()
  expiresIn: Date;
  @Column()
  userId: number;
  @Column({ nullable: true })
  method: string;
  @OneToOne(() => UserEntity, (user) => user.otp, { onDelete: "CASCADE" })
  user: UserEntity;
}
