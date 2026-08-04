import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserEntity } from '../../user/entity/user.entity';
import { TokenService } from './token.service';
import { AuthMessage } from 'src/common/enums/message.enum';
import { randomInt } from 'crypto';
import { OtpEntity } from 'src/modules/user/entity/otp.entity';
import {
  RegisterDto,
  RegisterMethod,
  LoginDto,
  VerifyOtpDto,
  ResetPasswordDto,
  ForgotPasswordDto,
} from '../dto/auth.dto';
import * as bcrypt from 'bcrypt';
import { RoleEntity } from 'src/modules/rbac/entities/role.entity';
import type { Response } from 'express';
import { MailService } from 'src/modules/mail/mail.service';
import { deleteInvalidPropertyObject } from 'src/common/utils/function.utils';
import { GoogleUser } from '../types/payload';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(UserEntity)
    private userRepository: Repository<UserEntity>,
    @InjectRepository(OtpEntity)
    private otpRepository: Repository<OtpEntity>,
    @InjectRepository(RoleEntity)
    private roleRepository: Repository<RoleEntity>,
    private tokenService: TokenService,
    private mailService: MailService,
  ) {}

  async register(dto: RegisterDto, _res: Response) {
    const { method, phone, email, password } = dto;

    if (method === RegisterMethod.PHONE && !phone) {
      deleteInvalidPropertyObject(dto, ['email', 'password']);
      throw new BadRequestException('شماره موبایل الزامی است');
    }

    if (method === RegisterMethod.EMAIL && (!email || !password)) {
      deleteInvalidPropertyObject(dto, ['phone']);
      throw new BadRequestException('ایمیل و رمز عبور الزامی است');
    }

    const whereConditions: any = [];
    if (phone) whereConditions.push({ phone });
    if (email) whereConditions.push({ email });

    let existingUser = null;
    if (whereConditions.length > 0) {
      existingUser = await this.userRepository.findOne({
        where: whereConditions,
      });
    }

    if (existingUser) {
      throw new ConflictException(AuthMessage.UserExists);
    }

    // 🔥 بررسی وجود کاربر در سیستم
    const userCount = await this.userRepository.count();
    const isFirstUser = userCount === 0;

    let roleId: number;

    if (isFirstUser) {
      // ✅ اولین کاربر: نقش ادمین
      const adminRole = await this.roleRepository.findOne({
        where: { name: 'admin' },
      });

      if (adminRole) {
        roleId = adminRole.id;
      } else {
        // اگر نقش ادمین وجود نداشت، ایجاد کن
        const newAdminRole = this.roleRepository.create({
          name: 'admin',
          permissions: [], // یا هر مقدار پیش‌فرض
        });
        const savedRole = await this.roleRepository.save(newAdminRole);
        roleId = savedRole.id;
      }
    } else {
      // ❌ کاربران بعدی: نقش کاربر عادی
      const userRole = await this.roleRepository.findOne({
        where: { name: 'user' },
      });

      if (userRole) {
        roleId = userRole.id;
      } else {
        // اگر نقش کاربر وجود نداشت، ایجاد کن
        const newUserRole = this.roleRepository.create({
          name: 'user',
          permissions: [],
        });
        const savedRole = await this.roleRepository.save(newUserRole);
        roleId = savedRole.id;
      }
    }

    let user = this.userRepository.create({
      phone: phone || null,
      email: email || null,
      isPhoneVerified: false,
      isEmailVerified: false,
      roleId,
      isActive: true,
    });

    if (method === RegisterMethod.EMAIL && password) {
      user.password = await bcrypt.hash(password, 10);
    }

    user = await this.userRepository.save(user);

    const code = randomInt(100000, 999999).toString();
    const expiresInDate = new Date(Date.now() + 2 * 60 * 1000);

    await this.otpRepository.save({
      userId: user.id,
      code,
      expiresIn: expiresInDate,
    });

    if (method === RegisterMethod.PHONE && phone) {
      console.log(`📱 کد تأیید موبایل ${phone}: ${code}`);
    } else if (method === RegisterMethod.EMAIL && email) {
      console.log(`📧 کد تأیید ایمیل ${email}: ${code}`);
    }

    return {
      message: 'کد تأیید با موفقیت ارسال شد',
    };
  }
  async verifyOtp(dto: VerifyOtpDto, res: Response) {
    const { method, phone, email, code } = dto;

    // پیدا کردن کاربر
    const user = await this.userRepository.findOne({
      where: method === RegisterMethod.PHONE ? { phone } : { email },
    });

    if (!user) {
      throw new NotFoundException('کاربر یافت نشد');
    }

    // پیدا کردن OTP
    const otp = await this.otpRepository.findOne({
      where: { userId: user.id, code },
      order: { id: 'DESC' },
    });

    if (!otp) {
      throw new UnauthorizedException('کد تأیید اشتباه است');
    }

    if (new Date() > otp.expiresIn) {
      throw new UnauthorizedException('کد تأیید منقضی شده است');
    }

    // به‌روزرسانی وضعیت تأیید
    if (method === RegisterMethod.PHONE) {
      deleteInvalidPropertyObject(dto, ['email']);
      user.isPhoneVerified = true;
    } else {
      deleteInvalidPropertyObject(dto, ['phone']);
      user.isEmailVerified = true;
    }

    await this.userRepository.save(user);
    await this.otpRepository.remove(otp);

    // تولید توکن‌ها
    const tokens = await this.tokenService.generateTokens(user.id, user.roleId);

    // پاک کردن کوکی‌های قبلی
    res.clearCookie('access_token');
    res.clearCookie('refresh_token');

    // تنظیم کوکی‌های جدید
    this.setAuthCookies(res, tokens);

    return {
      message: 'تأیید هویت با موفقیت انجام شد',
      user: {
        id: user.id,
        phone: user.phone,
        email: user.email,
        isPhoneVerified: user.isPhoneVerified,
        isEmailVerified: user.isEmailVerified,
      },
    };
  }
  async login(dto: LoginDto, res: Response) {
    const { method, phone, email, password, code } = dto;

    if (method === RegisterMethod.PHONE) {
      deleteInvalidPropertyObject(dto, ['email', 'password']);

      if (!phone) {
        throw new BadRequestException('شماره موبایل الزامی است');
      }

      const user = await this.userRepository.findOne({ where: { phone } });
      if (!user) {
        throw new NotFoundException('کاربری با این شماره موبایل یافت نشد');
      }

      if (!user.isActive) {
        throw new UnauthorizedException('حساب کاربری شما غیرفعال شده است');
      }

      // 🟢 حالت اول: کد ارسال نشده -> باید یه OTP جدید بسازیم و بفرستیم
      if (!code) {
        const otpCode = randomInt(100000, 999999).toString();
        const expiresInDate = new Date(Date.now() + 2 * 60 * 1000);

        await this.otpRepository.save({
          userId: user.id,
          code: otpCode,
          expiresIn: expiresInDate,
        });

        console.log(`📱 کد تأیید ورود ${phone}: ${otpCode}`);

        return {
          message: 'کد تأیید با موفقیت ارسال شد',
        };
      }

      // 🟢 حالت دوم: کد وارد شده -> verifyOtp رو صدا می‌زنیم
      return this.verifyOtp({ method: RegisterMethod.PHONE, phone, code }, res);
    }

    if (method === RegisterMethod.EMAIL) {
      deleteInvalidPropertyObject(dto, ['phone', 'code']);

      if (!email || !password) {
        throw new BadRequestException('ایمیل و رمز عبور الزامی است');
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
        throw new UnauthorizedException('ایمیل یا رمز عبور اشتباه است');
      }

      if (!user.isActive) {
        throw new UnauthorizedException('حساب کاربری شما غیرفعال شده است');
      }

      if (!user.isEmailVerified) {
        throw new UnauthorizedException('لطفاً ابتدا ایمیل خود را تأیید کنید');
      }

      const isPasswordValid = await bcrypt.compare(password, user.password);
      if (!isPasswordValid) {
        throw new UnauthorizedException('ایمیل یا رمز عبور اشتباه است');
      }

      const tokens = await this.tokenService.generateTokens(user.id, user.roleId);

      res.clearCookie('access_token');
      res.clearCookie('refresh_token');

      this.setAuthCookies(res, tokens);

      return {
        message: 'ورود با موفقیت انجام شد',
        user: {
          id: user.id,
          email: user.email,
          phone: user.phone,
          isEmailVerified: user.isEmailVerified,
          isPhoneVerified: user.isPhoneVerified,
        },
      };
    }

    throw new BadRequestException('روش ورود نامعتبر است');
  }
  async refreshToken(refreshToken: string, res: Response) {
    if (!refreshToken) {
      throw new UnauthorizedException('Refresh token ارائه نشده است');
    }

    // تازه‌سازی توکن‌ها
    const tokens = await this.tokenService.refreshTokens(refreshToken);

    // پاک کردن کوکی‌های قبلی
    res.clearCookie('access_token');
    res.clearCookie('refresh_token');

    // تنظیم کوکی‌های جدید
    this.setAuthCookies(res, tokens);

    return {
      message: 'توکن با موفقیت تازه‌سازی شد',
    };
  }
  async logout(userId: number, res: Response) {
    res.clearCookie('access_token');
    res.clearCookie('refresh_token');

    return {
      message: 'خروج با موفقیت انجام شد',
    };
  }
  async forgotPassword(dto: ForgotPasswordDto) {
    const { email } = dto;

    const user = await this.userRepository.findOne({ where: { email } });

    if (!user) {
      return {
        message: 'در صورت وجود حساب کاربری، کد بازیابی ارسال شد',
      };
    }

    const code = randomInt(100000, 999999).toString();
    const expiresInDate = new Date(Date.now() + 2 * 60 * 1000);

    await this.otpRepository.save({
      userId: user.id,
      code,
      expiresIn: expiresInDate,
    });

    await this.mailService.sendOtpEmail(email, code); // 👈 اینجا

    return {
      message: 'در صورت وجود حساب کاربری، کد بازیابی ارسال شد',
    };
  }
  async resetPassword(dto: ResetPasswordDto) {
    const { email, code, newPassword } = dto;

    const user = await this.userRepository.findOne({ where: { email } });

    if (!user) {
      throw new NotFoundException('کاربر یافت نشد');
    }

    const otp = await this.otpRepository.findOne({
      where: { userId: user.id, code },
      order: { id: 'DESC' },
    });

    if (!otp) {
      throw new UnauthorizedException('کد بازیابی اشتباه است');
    }

    if (new Date() > otp.expiresIn) {
      throw new UnauthorizedException('کد بازیابی منقضی شده است');
    }

    user.password = await bcrypt.hash(newPassword, 10);
    await this.userRepository.save(user);
    await this.otpRepository.remove(otp);

    return {
      message: 'رمز عبور با موفقیت تغییر یافت',
    };
  }
  async googleAuth(userData: GoogleUser, res: Response) {
    const { email, firstName, lastName, profile_image } = userData;

    let user = await this.userRepository.findOneBy({ email });

    if (user) {
      if (!user.isActive) {
        throw new UnauthorizedException('حساب کاربری شما غیرفعال شده است');
      }

      const tokens = await this.tokenService.generateTokens(user.id, user.roleId);

      res.clearCookie('access_token');
      res.clearCookie('refresh_token');

      this.setAuthCookies(res, tokens);

      return {
        message: 'ورود با گوگل با موفقیت انجام شد',
        user: {
          id: user.id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          avatar: user.avatar,
        },
      };
    }

    const userCount = await this.userRepository.count();
    const isFirstUser = userCount === 0;

    let roleId: number;

    if (isFirstUser) {
      let adminRole = await this.roleRepository.findOne({
        where: { name: 'admin' },
      });

      if (!adminRole) {
        adminRole = await this.roleRepository.save(
          this.roleRepository.create({
            name: 'admin',
            permissions: [],
          }),
        );
      }
      roleId = adminRole.id;
    } else {
      let userRole = await this.roleRepository.findOne({
        where: { name: 'user' },
      });

      if (!userRole) {
        userRole = await this.roleRepository.save(
          this.roleRepository.create({
            name: 'user',
            permissions: [],
          }),
        );
      }
      roleId = userRole.id;
    }

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

    res.clearCookie('access_token');
    res.clearCookie('refresh_token');

    this.setAuthCookies(res, tokens);

    return {
      message: 'ثبت‌نام و ورود با گوگل با موفقیت انجام شد',
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        avatar: user.avatar,
      },
    };
  }
  private setAuthCookies(res: Response, tokens: { accessToken: string; refreshToken: string }) {
    const isProduction = process.env.NODE_ENV === 'production';

    res.cookie('access_token', tokens.accessToken, {
      httpOnly: true,
      secure: isProduction,
      sameSite: 'lax',
      maxAge: 1000 * 60 * 60 * 24 * 7,
      path: '/',
    });

    res.cookie('refresh_token', tokens.refreshToken, {
      httpOnly: true,
      secure: isProduction,
      sameSite: 'lax',
      maxAge: 1000 * 60 * 60 * 24 * 30,
      path: '/',
    });
  }
}
