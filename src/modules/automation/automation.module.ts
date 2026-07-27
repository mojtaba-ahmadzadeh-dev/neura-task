import { Module } from "@nestjs/common";
import { AutomationController } from "./automation.controller";
import { TypeOrmModule } from "@nestjs/typeorm";
import { AutomationEntity } from "./entities/automation.entity";
import { TaskEntity } from "../task/entities/task.entity";
import { Workspace } from "../workspace/entities/workspace.entity";
import { UserEntity } from "../user/entity/user.entity";
import { JwtService } from "@nestjs/jwt";
import { UserRepository } from "../user/repository/user.repository";
import { AutomationService } from "./service/automation.service";
import { AutomationCronService } from "./service/automation-cron.service";

@Module({
  imports: [
    TypeOrmModule.forFeature([
      AutomationEntity,
      TaskEntity,
      Workspace,
      UserEntity,
    ]),
  ],
  controllers: [AutomationController],
  providers: [AutomationService, JwtService, UserRepository, AutomationCronService],
})
export class AutomationModule {}
