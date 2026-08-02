import { Module } from "@nestjs/common";
import { AuthController } from "./auth.controller";
import { AuthService } from "./service/auth.service";
import { TypeOrmModule } from "@nestjs/typeorm";
import { UserEntity } from "../user/entity/user.entity";
import { TokenService } from "./service/token.service";
import { JwtService } from "@nestjs/jwt";
import { OtpEntity } from "../user/entity/otp.entity";
import { RoleEntity } from "../rbac/entities/role.entity";
import { PermissionEntity } from "../rbac/entities/permission.entity";
import { UserRepository } from "../user/repository/user.repository";
import { MailService } from "../mail/mail.service";

@Module({
  imports: [
    TypeOrmModule.forFeature([
      UserEntity,
      OtpEntity,
      RoleEntity,
      PermissionEntity,
    ]),
  ],
  controllers: [AuthController],
  providers: [
    AuthService,
    TokenService,
    JwtService,
    UserRepository,
    MailService
  ],
  exports: [AuthService],
})
export class AuthModule {}
