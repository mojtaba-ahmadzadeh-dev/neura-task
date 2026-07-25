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
import { PaginationDto } from "src/common/dto/pagination.dto";
import {
  paginationGenerator,
  paginationSolver,
} from "src/common/utils/pagination.utils";
import { AttachmentMessage } from "src/common/enums/message.enum";

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
      throw new BadRequestException(AttachmentMessage.FILE_NOT_PROVIDED);
    }

    try {
      const uploaded = await this.s3Service.uploadFile(file, "attachments");

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
      throw new InternalServerErrorException(
        AttachmentMessage.ERROR_UPLOADING_ATTACHMENT,
      );
    }
  }
  async findAll(paginationDto: PaginationDto) {
    const { page, limit, skip } = paginationSolver(paginationDto);

    const [attachments, count] = await this.attachmentRepo.findAndCount({
      order: { id: "DESC" },
      skip,
      take: limit,
    });

    return {
      attachments,
      pagination: paginationGenerator(count, page, limit),
    };
  }
  async findOne(id: number) {
    const attachment = await this.attachmentRepo.findOneBy({ id });

    if (!attachment) {
      throw new BadRequestException(AttachmentMessage.ATTACHMENT_NOT_FOUND);
    }

    return attachment;
  }
  async remove(id: number) {
    const attachment = await this.attachmentRepo.findOneBy({ id });

    if (!attachment) {
      throw new BadRequestException(AttachmentMessage.ATTACHMENT_NOT_FOUND);
    }

    await this.s3Service.deleteFile(attachment.key);
    await this.attachmentRepo.remove(attachment);

    return { message: AttachmentMessage.ATTACHMENT_DELETED_SUCCESSFULLY };
  }
}
