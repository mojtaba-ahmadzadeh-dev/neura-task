import { Module } from "@nestjs/common";
import { AutomationService } from "./automation.service";
import { AutomationController } from "./automation.controller";
import { TypeOrmModule } from "@nestjs/typeorm";
import { AutomationEntity } from "./entities/automation.entity";
import { TaskEntity } from "../task/entities/task.entity";
import { Workspace } from "../workspace/entities/workspace.entity";
import { UserEntity } from "../user/entity/user.entity";
import { JwtService } from "@nestjs/jwt";
import { UserRepository } from "../user/repository/user.repository";

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
  providers: [AutomationService, JwtService, UserRepository],
})
export class AutomationModule {}
