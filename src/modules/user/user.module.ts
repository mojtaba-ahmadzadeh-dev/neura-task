import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { JwtService } from "@nestjs/jwt";
import { UserEntity } from "./entity/user.entity";
import { UserController } from "./user.controller";
import { UserService } from "./user.service";
import { RoleEntity } from "../rbac/entities/role.entity";
import { UserRepository } from "./repository/user.repository";
import { S3Service } from "../s3/s3.service";

@Module({
  imports: [TypeOrmModule.forFeature([UserEntity, RoleEntity])],
  controllers: [UserController],
  providers: [UserService, JwtService, UserRepository, S3Service],
})
export class UserModule {}
