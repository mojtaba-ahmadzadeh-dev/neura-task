import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { InjectRepository } from '@nestjs/typeorm';
import { LessThanOrEqual, Repository } from 'typeorm';
import { AutomationType } from 'src/common/enums/automation-type.enum';
import { calculateNextRunAt } from 'src/common/utils/automation.utils';
import { AutomationEntity } from '../entities/automation.entity';
import { TaskEntity } from 'src/modules/task/entities/task.entity';

@Injectable()
export class AutomationCronService {
  private readonly logger = new Logger(AutomationCronService.name);

  constructor(
    @InjectRepository(AutomationEntity)
    private readonly automationRepo: Repository<AutomationEntity>,

    @InjectRepository(TaskEntity)
    private readonly taskRepo: Repository<TaskEntity>,
  ) {}

  @Cron(CronExpression.EVERY_MINUTE)
  async handleDueAutomations() {
    const now = new Date();

    const dueList = await this.automationRepo.find({
      where: {
        active: true,
        nextRunAt: LessThanOrEqual(now),
      },
      relations: {
        task: true,
      },
    });

    if (dueList.length === 0) return;

    this.logger.log(`Running ${dueList.length} automation(s)...`);

    for (const automation of dueList) {
      try {
        await this.runAutomation(automation);
      } catch (err) {
        this.logger.error(`Automation #${automation.id} failed: ${err}`, err);
      }
    }
  }
  private async runAutomation(automation: AutomationEntity) {
    const template = automation.task;

    if (!template) {
      this.logger.warn(`Automation #${automation.id} has no template task`);
      return;
    }

    const newTask = this.taskRepo.create({
      title: template.title,
      status: template.status,
      priority: template.priority,
      workspaceId: automation.workspaceId,
      userId: automation.userId,
    } as Partial<TaskEntity>);

    const savedTask = await this.taskRepo.save(newTask);

    automation.lastRunAt = new Date();
    automation.nextRunAt = calculateNextRunAt({
      timeOfDay: automation.timeOfDay,
      daysOfWeek: automation.daysOfWeek,
      timezone: automation.timezone,
      type: automation.type,
    });

    if (automation.type !== AutomationType.RECURRING) {
      automation.active = false;
    }

    await this.automationRepo.save(automation);

    this.logger.log(
      `Automation #${automation.id} → Task #${savedTask.id} created | nextRunAt: ${automation.nextRunAt.toISOString()}`,
    );
  }
}
