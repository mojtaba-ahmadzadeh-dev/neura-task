import {
  BadRequestException,
  ForbiddenException,
  Inject,
  Injectable,
  NotFoundException,
  Scope,
} from "@nestjs/common";
import {
  CreateAutomationDto,
  FilterAutomationDto,
} from "./dto/create-automation.dto";
import { UpdateAutomationDto } from "./dto/update-automation.dto";
import { InjectRepository } from "@nestjs/typeorm";
import { AutomationEntity } from "./entities/automation.entity";
import { Repository } from "typeorm";
import { TaskEntity } from "../task/entities/task.entity";
import { Workspace } from "../workspace/entities/workspace.entity";
import { AutomationType } from "src/common/enums/automation-type.enum";
import { REQUEST } from "@nestjs/core";
import type { Request } from "express";
import {
  paginationGenerator,
  paginationSolver,
} from "src/common/utils/pagination.utils";

@Injectable({ scope: Scope.REQUEST })
export class AutomationService {
  constructor(
    @InjectRepository(AutomationEntity)
    private readonly automationRepository: Repository<AutomationEntity>,
    @InjectRepository(TaskEntity)
    private readonly taskRepository: Repository<TaskEntity>,
    @InjectRepository(Workspace)
    private readonly workspaceRepository: Repository<Workspace>,
    @Inject(REQUEST) private request: Request,
  ) {}

  async create(dto: CreateAutomationDto) {
    const userId = this.getUserId();

    const task = await this.taskRepository.findOne({
      where: { id: dto.taskId },
    });
    if (!task) {
      throw new NotFoundException("تسک مورد نظر یافت نشد");
    }

    const workspace = await this.workspaceRepository.findOne({
      where: { id: dto.workspaceId },
    });
    if (!workspace) {
      throw new NotFoundException("ورک‌اسپیس مورد نظر یافت نشد");
    }

    if (
      dto.type === AutomationType.RECURRING &&
      (!dto.daysOfWeek || dto.daysOfWeek.length === 0)
    ) {
      throw new BadRequestException(
        "برای automation از نوع recurring مشخص کردن daysOfWeek الزامی است",
      );
    }

    const automation = this.automationRepository.create({
      type: dto.type,
      taskId: dto.taskId,
      userId,
      workspaceId: dto.workspaceId,
      active: dto.active ?? true,
      daysOfWeek: dto.type === AutomationType.RECURRING ? dto.daysOfWeek : [],
      timeOfDay: dto.timeOfDay,
      timezone: dto.timezone ?? "Asia/Tehran",
      nextRunAt: this.calculateNextRunAt(dto),
    });

    return this.automationRepository.save(automation);
  }
  async findAll(filterDto: FilterAutomationDto) {
    const userId = this.getUserId();
    const { page, limit, skip } = paginationSolver(filterDto);

    const [automations, count] = await this.automationRepository.findAndCount({
      where: { userId },
      order: { id: "DESC" },
      skip,
      take: limit,
    });

    return {
      pagination: paginationGenerator(count, page, limit),
      automations,
    };
  }
  async findOne(id: number) {
    const userId = this.getUserId();

    const automation = await this.automationRepository.findOne({
      where: { id, userId },
    });

    if (!automation) {
      throw new NotFoundException("automation مورد نظر یافت نشد");
    }

    return automation;
  }
  async update(id: number, dto: UpdateAutomationDto) {
    const userId = this.getUserId();

    const automation = await this.automationRepository.findOne({
      where: { id, userId },
    });

    if (!automation) {
      throw new NotFoundException("automation مورد نظر یافت نشد");
    }

    if (dto.taskId) {
      const task = await this.taskRepository.findOne({
        where: { id: dto.taskId },
      });
      if (!task) {
        throw new NotFoundException("تسک مورد نظر یافت نشد");
      }
    }

    if (dto.workspaceId) {
      const workspace = await this.workspaceRepository.findOne({
        where: { id: dto.workspaceId },
      });
      if (!workspace) {
        throw new NotFoundException("ورک‌اسپیس مورد نظر یافت نشد");
      }
    }

    const type = dto.type ?? automation.type;

    if (
      type === AutomationType.RECURRING &&
      (dto.daysOfWeek ?? automation.daysOfWeek)?.length === 0
    ) {
      throw new BadRequestException(
        "برای automation از نوع recurring مشخص کردن daysOfWeek الزامی است",
      );
    }

    Object.assign(automation, {
      ...dto,
      daysOfWeek:
        type === AutomationType.RECURRING
          ? (dto.daysOfWeek ?? automation.daysOfWeek)
          : [],
    });

    if (dto.timeOfDay) {
      automation.nextRunAt = this.calculateNextRunAt({
        timeOfDay: dto.timeOfDay,
      } as UpdateAutomationDto as CreateAutomationDto);
    }

    return this.automationRepository.save(automation);
  }
  async remove(id: number) {
    const userId = this.getUserId();

    const automation = await this.automationRepository.findOne({
      where: { id, userId },
    });

    if (!automation) {
      throw new NotFoundException("automation مورد نظر یافت نشد");
    }

    await this.automationRepository.remove(automation);

    return {
      message: "automation با موفقیت حذف شد",
    };
  }
  private getUserId() {
    const user = (this.request as any).user;
    if (!user?.id) {
      throw new ForbiddenException("کاربر احراز هویت نشده است");
    }
    return user.id;
  }
  private calculateNextRunAt(dto: CreateAutomationDto): Date {
    const [hours, minutes, seconds] = dto.timeOfDay.split(":").map(Number);
    const now = new Date();
    const next = new Date(now);
    next.setHours(hours, minutes, seconds, 0);

    if (next <= now) {
      next.setDate(next.getDate() + 1);
    }

    return next;
  }
}
