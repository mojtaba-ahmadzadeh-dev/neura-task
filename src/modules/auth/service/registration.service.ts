// ====================== registration.service.ts ======================
import { BadRequestException, ConflictException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserEntity } from '../../user/entity/user.entity';
import { RegisterDto, RegisterMethod } from '../dto/auth.dto';
import * as bcrypt from 'bcrypt';
import { OtpService } from './otp.service';
import { RoleService } from './role.service';
import { IRegistrationService } from '../interfaces/auth.interfaces';
import { AuthMessage } from 'src/common/enums/message.enum';

@Injectable()
export class RegistrationService implements IRegistrationService {
  constructor(
    @InjectRepository(UserEntity)
    private readonly userRepository: Repository<UserEntity>,
    private readonly otpService: OtpService,
    private readonly roleService: RoleService,
  ) {}

  async register(dto: RegisterDto) {
    const { method, phone, email, password } = dto;

    this.validateRegisterInput(method, phone, email, password);
    await this.ensureUserNotExists(phone, email);

    const roleId = await this.roleService.resolveRoleId();

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

    const code = await this.otpService.createOtp(user.id);

    // TODO: در پروداکشن به سرویس واقعی SMS / Email وصل شود
    if (method === RegisterMethod.PHONE && phone) {
      // await this.smsService.sendOtp(phone, code);
      console.log(`[DEV] OTP for phone ${phone}: ${code}`);
    } else if (method === RegisterMethod.EMAIL && email) {
      // await this.mailService.sendOtpEmail(email, code);
      console.log(`[DEV] OTP for email ${email}: ${code}`);
    }

    return { message: AuthMessage.OTP_SENT_SUCCESS };
  }
  private validateRegisterInput(
    method: RegisterMethod,
    phone?: string,
    email?: string,
    password?: string,
  ) {
    if (method === RegisterMethod.PHONE && !phone) {
      throw new BadRequestException(AuthMessage.PHONE_REQUIRED);
    }
    if (method === RegisterMethod.EMAIL && (!email || !password)) {
      throw new BadRequestException(AuthMessage.EMAIL_PASSWORD_REQUIRED);
    }
  }
  private async ensureUserNotExists(phone?: string, email?: string) {
    const whereConditions: any[] = [];
    if (phone) whereConditions.push({ phone });
    if (email) whereConditions.push({ email });

    if (whereConditions.length === 0) return;

    const existing = await this.userRepository.findOne({
      where: whereConditions,
    });

    if (existing) {
      throw new ConflictException(AuthMessage.USER_EXISTS);
    }
  }
}
