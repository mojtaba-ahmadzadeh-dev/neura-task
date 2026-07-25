// src/modules/attachment/attachment.service.ts
import {
  Injectable,
  BadRequestException,
  InternalServerErrorException,
  Scope,
  Inject,
} from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { CreateAttachmentDto } from "./dto/create-attachment.dto";
import { S3Service } from "../s3/s3.service";
import { AttachmentEntity } from "./entities/attachment.entity";
import { REQUEST } from "@nestjs/core";
import type { Request } from "express";

@Injectable({ scope: Scope.REQUEST })
export class AttachmentService {
  constructor(
    @InjectRepository(AttachmentEntity)
    private readonly attachmentRepo: Repository<AttachmentEntity>,
    private readonly s3Service: S3Service,
    @Inject(REQUEST) private readonly request: Request,
  ) {}

  async create(
    file: Express.Multer.File,
    createAttachmentDto: CreateAttachmentDto,
  ): Promise<AttachmentEntity> {
    if (!file) {
      throw new BadRequestException("فایلی ارسال نشده است");
    }

    try {
      const uploaded = await this.s3Service.uploadFile(file, "attachments");

      // گرفتن یوزر از ریکوئست
      const userId = (this.request as any).user?.id ?? null;

      const attachment = this.attachmentRepo.create({
        originalName: file.originalname,
        key: uploaded.Key,
        url: uploaded.Location,
        mimetype: file.mimetype,
        size: file.size,
        uploadedById: userId,
      });

      return await this.attachmentRepo.save(attachment);
    } catch (error) {
      console.error("خطا در آپلود فایل به S3:", error);
      throw new InternalServerErrorException("خطا در آپلود فایل");
    }
  }

  async remove(id: number) {
    const attachment = await this.attachmentRepo.findOneBy({ id });

    if (!attachment) {
      throw new BadRequestException("فایل پیدا نشد");
    }

    await this.s3Service.deleteFile(attachment.key);
    await this.attachmentRepo.remove(attachment);

    return { message: "فایل با موفقیت حذف شد" };
  }
}