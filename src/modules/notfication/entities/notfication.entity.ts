import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from "typeorm";

export enum NotificationType {
  SYSTEM = "SYSTEM",
  ORDER = "ORDER",
  PAYMENT = "PAYMENT",
  MESSAGE = "MESSAGE",
  WARNING = "WARNING",
}

@Entity("notifications")
export class NotificationEntity {
  @PrimaryGeneratedColumn("increment")
  id: number;
  @Index()
  @Column()
  userId: number;
  @Column({ length: 150 })
  title: string;
  @Column({ type: "text" })
  message: string;
  @Column({
    type: "enum",
    enum: NotificationType,
    default: NotificationType.SYSTEM,
  })
  type: NotificationType;
  @Column({ default: false })
  isRead: boolean;
  @Column({ type: "json", nullable: true })
  data?: Record<string, any>;
  @CreateDateColumn()
  createdAt: Date;
  @UpdateDateColumn()
  updatedAt: Date;
}
