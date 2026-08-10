import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserEntity } from '../../user/entity/user.entity';
import { ForgotPasswordDto, ResetPasswordDto } from '../dto/auth.dto';
import { OtpService } from './otp.service';
import { MailService } from 'src/modules/mail/mail.service';
import * as bcrypt from 'bcrypt';
import { IPasswordService } from '../interfaces/auth.interfaces';
import { AuthMessage } from 'src/common/enums/message.enum';

@Injectable()
export class PasswordService implements IPasswordService {
  constructor(
    @InjectRepository(UserEntity)
    private readonly userRepository: Repository<UserEntity>,
    private readonly otpService: OtpService,
    private readonly mailService: MailService,
  ) {}

  async forgotPassword(dto: ForgotPasswordDto) {
    const { email } = dto;

    const user = await this.userRepository.findOne({ where: { email } });

    console.log('========== USER FOUND? ==========');
    console.log(user ? `بله - ID: ${user.id}` : 'خیر - کاربر وجود ندارد');
    console.log('=================================');

    if (!user) {
      return {
        message: AuthMessage.FORGOT_PASSWORD_SUCCESS,
      };
    }

    const code = await this.otpService.createOtp(user.id);
    await this.mailService.sendOtpEmail(email, code);

    return {
      message: AuthMessage.FORGOT_PASSWORD_SUCCESS,
    };
  }
  async resetPassword(dto: ResetPasswordDto) {
    const { email, code, newPassword } = dto;

    const user = await this.userRepository.findOne({ where: { email } });
    if (!user) {
      throw new NotFoundException(AuthMessage.USER_NOT_FOUND);
    }

    await this.otpService.verifyOtp(user.id, code);

    user.password = await bcrypt.hash(newPassword, 10);
    await this.userRepository.save(user);

    return { message: AuthMessage.PASSWORD_RESET_SUCCESS };
  }
}
