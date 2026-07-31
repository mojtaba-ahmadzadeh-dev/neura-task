import { Module } from "@nestjs/common";
import { NotficationService } from "./notfication.service";
import { NotficationController } from "./notfication.controller";
import { NotificationGateway } from "./notification.gateway";
import { TypeOrmModule } from "@nestjs/typeorm";
import { NotificationEntity } from "./entities/notfication.entity";
import { JwtService } from "@nestjs/jwt";
import { UserRepository } from "../user/repository/user.repository";
import { UserEntity } from "../user/entity/user.entity";

@Module({
  imports: [TypeOrmModule.forFeature([NotificationEntity, UserEntity])],
  controllers: [NotficationController],
  providers: [NotficationService, NotificationGateway, JwtService, UserRepository],
})
export class NotficationModule {}
