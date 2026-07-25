import {
  Controller,
  Post,
  UploadedFile,
  UseInterceptors,
  Body,
  Delete,
  Param,
  ParseIntPipe,
  UseGuards,
  Get,
  Query,
} from "@nestjs/common";
import { FileInterceptor } from "@nestjs/platform-express";
import { memoryStorage } from "multer";
import { ApiConsumes, ApiBody, ApiTags, ApiOperation } from "@nestjs/swagger";
import { AttachmentService } from "./attachment.service";
import { CreateAttachmentDto } from "./dto/create-attachment.dto";
import { RbacGuard } from "../rbac/guards/rbac.guard";
import { Pagination } from "src/common/decorators/pagination.decorator";
import { PaginationDto } from "src/common/dto/pagination.dto";

@ApiTags("Attachment")
@UseGuards(RbacGuard)
@Controller("attachments")
export class AttachmentController {
  constructor(private readonly attachmentService: AttachmentService) {}

  @Post("upload")
  @ApiConsumes("multipart/form-data")
  @ApiBody({
    schema: {
      type: "object",
      properties: {
        file: {
          type: "string",
          format: "binary",
          description: "فایل مورد نظر",
        },
      },
      required: ["file"],
    },
  })
  @UseInterceptors(
    FileInterceptor("file", {
      storage: memoryStorage(),
      limits: {
        fileSize: 15 * 1024 * 1024,
      },
    }),
  )
  async upload(
    @UploadedFile() file: Express.Multer.File,
    @Body() createAttachmentDto: CreateAttachmentDto,
  ) {
    return this.attachmentService.create(file, createAttachmentDto);
  }

  @Get()
  @Pagination()
  async findAll(@Query() paginationDto: PaginationDto) {
    return this.attachmentService.findAll(paginationDto);
  }

  @Get(":id")
  async findOne(@Param("id", ParseIntPipe) id: number) {
    return this.attachmentService.findOne(id);
  }

  @Delete(":id")
  async remove(@Param("id", ParseIntPipe) id: number) {
    return this.attachmentService.remove(id);
  }
}
