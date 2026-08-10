import {
  BadRequestException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserEntity } from '../../user/entity/user.entity';
import { LoginDto, RegisterMethod, VerifyOtpDto } from '../dto/auth.dto';
import * as bcrypt from 'bcrypt';
import { TokenService } from './token.service';
import { OtpService } from './otp.service';
import { CookieService } from './cookie.service';
import type { Response } from 'express';
import { ILoginService } from '../interfaces/auth.interfaces';
import { AuthMessage } from 'src/common/enums/message.enum'; // مسیر رو مطابق پروژه‌ات تنظیم کن

@Injectable()
export class LoginService implements ILoginService {
  constructor(
    @InjectRepository(UserEntity)
    private readonly userRepository: Repository<UserEntity>,
    private readonly tokenService: TokenService,
    private readonly otpService: OtpService,
    private readonly cookieService: CookieService,
  ) {}

  async login(dto: LoginDto, res: Response) {
    const { method, phone, email, password, code } = dto;

    if (method === RegisterMethod.PHONE) {
      return this.loginWithPhone(phone, code, res);
    }

    if (method === RegisterMethod.EMAIL) {
      return this.loginWithEmail(email, password, res);
    }

    throw new BadRequestException(AuthMessage.INVALID_LOGIN_METHOD);
  }
  async verifyOtp(dto: VerifyOtpDto, res: Response) {
    const { method, phone, email, code } = dto;

    const user = await this.userRepository.findOne({
      where: method === RegisterMethod.PHONE ? { phone } : { email },
    });

    if (!user) {
      throw new NotFoundException(AuthMessage.USER_NOT_FOUND);
    }

    await this.otpService.verifyOtp(user.id, code);

    if (method === RegisterMethod.PHONE) {
      user.isPhoneVerified = true;
    } else {
      user.isEmailVerified = true;
    }

    await this.userRepository.save(user);

    const tokens = await this.tokenService.generateTokens(user.id, user.roleId);
    this.cookieService.clearAuthCookies(res);
    this.cookieService.setAuthCookies(res, tokens);

    return {
      message: AuthMessage.OTP_VERIFIED_SUCCESS,
      user: {
        id: user.id,
        phone: user.phone,
        email: user.email,
        isPhoneVerified: user.isPhoneVerified,
        isEmailVerified: user.isEmailVerified,
      },
    };
  }
  private async loginWithPhone(phone: string | undefined, code: string | undefined, res: Response) {
    if (!phone) {
      throw new BadRequestException(AuthMessage.PHONE_REQUIRED);
    }

    const user = await this.userRepository.findOne({ where: { phone } });
    if (!user) {
      throw new NotFoundException(AuthMessage.USER_NOT_FOUND);
    }

    if (!user.isActive) {
      throw new UnauthorizedException(AuthMessage.USER_INACTIVE);
    }

    if (!code) {
      const otpCode = await this.otpService.createOtp(user.id);
      // TODO: await this.smsService.sendOtp(phone, otpCode);
      console.log(`[DEV] Login OTP for ${phone}: ${otpCode}`);
      return { message: AuthMessage.OTP_SENT_SUCCESS };
    }

    return this.verifyOtp({ method: RegisterMethod.PHONE, phone, code }, res);
  }
  private async loginWithEmail(
    email: string | undefined,
    password: string | undefined,
    res: Response,
  ) {
    if (!email || !password) {
      throw new BadRequestException(AuthMessage.EMAIL_PASSWORD_REQUIRED);
    }

    const user = await this.userRepository.findOne({
      where: { email },
      select: {
        id: true,
        email: true,
        password: true,
        isEmailVerified: true,
        roleId: true,
        isActive: true,
        phone: true,
        isPhoneVerified: true,
      },
    });

    if (!user) {
      throw new UnauthorizedException(AuthMessage.INVALID_CREDENTIALS);
    }

    if (!user.isActive) {
      throw new UnauthorizedException(AuthMessage.USER_INACTIVE);
    }

    if (!user.isEmailVerified) {
      throw new UnauthorizedException(AuthMessage.EMAIL_NOT_VERIFIED);
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException(AuthMessage.INVALID_CREDENTIALS);
    }

    const tokens = await this.tokenService.generateTokens(user.id, user.roleId);
    this.cookieService.clearAuthCookies(res);
    this.cookieService.setAuthCookies(res, tokens);

    return {
      message: AuthMessage.LOGIN_SUCCESS,
      user: {
        id: user.id,
        email: user.email,
        phone: user.phone,
        isEmailVerified: user.isEmailVerified,
        isPhoneVerified: user.isPhoneVerified,
      },
    };
  }
}
