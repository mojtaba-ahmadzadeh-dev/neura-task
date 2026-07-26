import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Req,
  UseGuards,
  Query,
} from "@nestjs/common";
import { AutomationService } from "./automation.service";
import {
  CreateAutomationDto,
  FilterAutomationDto,
} from "./dto/create-automation.dto";
import { UpdateAutomationDto } from "./dto/update-automation.dto";
import { ApiOperation, ApiResponse } from "@nestjs/swagger";
import { RbacGuard } from "../rbac/guards/rbac.guard";
import { Pagination } from "src/common/decorators/pagination.decorator";

@Controller("automation")
@UseGuards(RbacGuard)
export class AutomationController {
  constructor(private readonly automationService: AutomationService) {}

  @Post("/create")
  create(@Body() createAutomationDto: CreateAutomationDto) {
    return this.automationService.create(createAutomationDto);
  }

  @Get("/")
  @Pagination()
  findAll(@Query() filterDto: FilterAutomationDto) {
    return this.automationService.findAll(filterDto);
  }
}
