import { Injectable, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { OtpEntity } from 'src/modules/user/entity/otp.entity';
import { randomInt } from 'crypto';
import { IOtpService } from '../interfaces/auth.interfaces';
import { AuthMessage } from 'src/common/enums/message.enum';

@Injectable()
export class OtpService implements IOtpService {
  constructor(
    @InjectRepository(OtpEntity)
    private readonly otpRepository: Repository<OtpEntity>,
  ) {}

  async createOtp(userId: number, expireMinutes = 2): Promise<string> {
    const code = randomInt(100000, 999999).toString();
    const expiresIn = new Date(Date.now() + expireMinutes * 60 * 1000);

    const existingOtp = await this.otpRepository.findOne({ where: { userId } });

    if (existingOtp) {
      existingOtp.code = code;
      existingOtp.expiresIn = expiresIn;
      await this.otpRepository.save(existingOtp);
    } else {
      await this.otpRepository.save({ userId, code, expiresIn });
    }

    return code;
  }
  async verifyOtp(userId: number, code: string): Promise<void> {
    const otp = await this.otpRepository.findOne({
      where: { userId, code },
      order: { id: 'DESC' },
    });

    if (!otp) {
      throw new UnauthorizedException(AuthMessage.INVALID_OTP);
    }

    if (new Date() > otp.expiresIn) {
      throw new UnauthorizedException(AuthMessage.OTP_EXPIRED);
    }

    await this.otpRepository.remove(otp);
  }
}
