// ====================== google-auth.service.ts ======================
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserEntity } from '../../user/entity/user.entity';
import { TokenService } from './token.service';
import { CookieService } from './cookie.service';
import { RoleService } from './role.service';
import { GoogleUser } from '../types/payload';
import type { Response } from 'express';
import { IGoogleAuthService } from '../interfaces/auth.interfaces';
import { AuthMessage } from 'src/common/enums/message.enum';

@Injectable()
export class GoogleAuthService implements IGoogleAuthService {
  constructor(
    @InjectRepository(UserEntity)
    private readonly userRepository: Repository<UserEntity>,
    private readonly tokenService: TokenService,
    private readonly cookieService: CookieService,
    private readonly roleService: RoleService,
  ) {}

  async authenticate(userData: GoogleUser, res: Response) {
    const { email, firstName, lastName, profile_image } = userData;

    let user = await this.userRepository.findOneBy({ email });

    if (user) {
      if (!user.isActive) {
        throw new UnauthorizedException(AuthMessage.USER_INACTIVE);
      }
      return this.loginExistingUser(user, res);
    }

    // کاربر جدید
    const roleId = await this.roleService.resolveRoleId();

    user = this.userRepository.create({
      email,
      firstName: firstName || null,
      lastName: lastName || null,
      avatar: profile_image || null,
      isEmailVerified: true,
      isPhoneVerified: false,
      roleId,
      isActive: true,
    });

    user = await this.userRepository.save(user);

    const tokens = await this.tokenService.generateTokens(user.id, user.roleId);
    this.cookieService.clearAuthCookies(res);
    this.cookieService.setAuthCookies(res, tokens);

    return {
      message: AuthMessage.GOOGLE_REGISTER_SUCCESS,
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        avatar: user.avatar,
      },
    };
  }
  private async loginExistingUser(user: UserEntity, res: Response) {
    const tokens = await this.tokenService.generateTokens(user.id, user.roleId);
    this.cookieService.clearAuthCookies(res);
    this.cookieService.setAuthCookies(res, tokens);

    return {
      message: AuthMessage.GOOGLE_LOGIN_SUCCESS,
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        avatar: user.avatar,
      },
    };
  }
}
