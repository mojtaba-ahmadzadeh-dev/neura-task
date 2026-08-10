import { Module } from '@nestjs/common';
import { AuthController } from './controller/auth.controller';
import { AuthService } from './service/auth.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserEntity } from '../user/entity/user.entity';
import { TokenService } from './service/token.service';
import { JwtService } from '@nestjs/jwt';
import { OtpEntity } from '../user/entity/otp.entity';
import { RoleEntity } from '../rbac/entities/role.entity';
import { PermissionEntity } from '../rbac/entities/permission.entity';
import { UserRepository } from '../user/repository/user.repository';
import { MailService } from '../mail/mail.service';
import { GoogleAuthController } from './controller/google.controller';
import { GoogleStrategy } from './strategy/google.strategy';
import { RegistrationService } from './service/registration.service';
import { LoginService } from './service/login.service';
import { PasswordService } from './service/password.service';
import { GoogleAuthService } from './service/google-auth.service';
import { CookieService } from './service/cookie.service';
import { OtpService } from './service/otp.service';
import { RoleService } from './service/role.service';

@Module({
  imports: [TypeOrmModule.forFeature([UserEntity, OtpEntity, RoleEntity, PermissionEntity])],
  controllers: [AuthController, GoogleAuthController],
  providers: [
    AuthService,
    TokenService,
    JwtService,
    UserRepository,
    MailService,
    GoogleStrategy,
    RegistrationService,
    LoginService,
    PasswordService,
    GoogleAuthService,
    CookieService,
    OtpService,
    RoleService,
  ],
  exports: [AuthService, GoogleStrategy],
})
export class AuthModule {}
