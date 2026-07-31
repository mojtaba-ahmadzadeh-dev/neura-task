import { Column, Entity, Index, JoinColumn, ManyToOne } from "typeorm";
import { BaseEntity } from "../../../common/abestract/base.entity";
import { UserEntity } from "src/modules/user/entity/user.entity";
import { NotificationType } from "src/common/enums/notification-type.enum";
import { NotificationResource } from "src/common/enums/notification-resource.enum";

@Entity("notifications")
export class NotificationEntity extends BaseEntity {
  @Index()
  @Column()
  receiverId: number;
  @Column({ nullable: true })
  senderId?: number;
  @Column({ type: "enum", enum: NotificationType })
  type: NotificationType;
  @Column({ length: 150 })
  title: string;
  @Column({ type: "text" })
  message: string;
  @Column({ type: "enum", enum: NotificationResource, nullable: true })
  resourceType?: NotificationResource;
  @Column({ nullable: true })
  resourceId?: number;
  @Column({ type: "json", nullable: true })
  metadata?: Record<string, any>;
  @Column({ default: false })
  isRead: boolean;
  @Column({ type: "timestamp", nullable: true })
  readAt?: Date;
  @Column({ default: false })
  isArchived: boolean;
  @Column({ nullable: true })
  actionUrl?: string;
  @ManyToOne(() => UserEntity, (user) => user.notifications, {
    onDelete: "CASCADE",
  })
  @JoinColumn({ name: "receiverId" })
  receiver: UserEntity;
  @ManyToOne(() => UserEntity, { nullable: true, onDelete: "SET NULL" })
  @JoinColumn({ name: "senderId" })
  sender?: UserEntity;
}
