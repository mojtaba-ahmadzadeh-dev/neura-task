import {
  Inject,
  Injectable,
  Scope,
  NotFoundException,
  UnauthorizedException,
} from "@nestjs/common";
import { CreateNotficationDto } from "./dto/create-notfication.dto";
import { InjectRepository } from "@nestjs/typeorm";
import { NotificationEntity } from "./entities/notfication.entity";
import { Repository } from "typeorm";
import { NotificationGateway } from "./notification.gateway";
import { REQUEST } from "@nestjs/core";
import type { Request } from "express";

@Injectable({ scope: Scope.REQUEST })
export class NotficationService {
  constructor(
    @InjectRepository(NotificationEntity)
    private readonly notificationRepository: Repository<NotificationEntity>,
    private readonly notificationGateway: NotificationGateway,
    @Inject(REQUEST) private request: Request,
  ) {}

  async create(dto: CreateNotficationDto) {
    const user = (this.request as any).user;

    if (!user?.id) {
      throw new UnauthorizedException("کاربر احراز هویت نشده است");
    }

    const notification = this.notificationRepository.create({
      ...dto,
      senderId: user.id,
      isRead: false,
      isArchived: false,
    });

    const saved = await this.notificationRepository.save(notification);

    this.notificationGateway.sendToUser(saved.receiverId, {
      event: "new_notification",
      data: saved,
    });

    return saved;
  }
  async findAll() {
    const user = (this.request as any).user;

    const notifications = await this.notificationRepository.find();

    return notifications;
  }
  async findOne(id: number) {
    const notification = await this.notificationRepository.findOne({
      where: {
        id,
      },
    });

    if (!notification) {
      throw new NotFoundException("نوتیفیکیشن پیدا نشد");
    }

    return notification;
  }
  async remove(id: number) {
    const user = (this.request as any).user;

    if (!user?.id) {
      throw new UnauthorizedException("کاربر احراز هویت نشده است");
    }

    const notification = await this.notificationRepository.findOne({
      where: {
        id,
      },
    });

    if (!notification) {
      throw new NotFoundException("نوتیفیکیشن پیدا نشد");
    }

    await this.notificationRepository.remove(notification);

    return {
      message: "نوتیفیکیشن با موفقیت حذف شد",
    };
  }
}
