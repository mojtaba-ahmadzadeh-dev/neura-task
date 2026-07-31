import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
} from "@nestjs/common";
import { NotficationService } from "./notfication.service";
import { CreateNotficationDto } from "./dto/create-notfication.dto";
import { RbacGuard } from "../rbac/guards/rbac.guard";

@Controller("notfication")
@UseGuards(RbacGuard)
export class NotficationController {
  constructor(private readonly notficationService: NotficationService) {}

  @Post("/create")
  create(@Body() dto: CreateNotficationDto) {
    return this.notficationService.create(dto);
  }

  @Get("/all")
  findAll() {
    return this.notficationService.findAll();
  }

  @Get(":id")
  findOne(@Param("id") id: string) {
    return this.notficationService.findOne(+id);
  }

  @Delete(":id/remove")
  remove(@Param("id") id: string) {
    return this.notficationService.remove(+id);
  }
}
