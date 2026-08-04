import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';

@Injectable()
export class MailService {
  private transporter;

  constructor(private configService: ConfigService) {
    this.transporter = nodemailer.createTransport({
      host: this.configService.get('MAIL_HOST'),
      port: this.configService.get('MAIL_PORT'),
      secure: false,
      auth: {
        user: this.configService.get('MAIL_USER'),
        pass: this.configService.get('MAIL_PASSWORD'),
      },
    });
  }

  async sendOtpEmail(to: string, code: string) {
    try {
      const info = await this.transporter.sendMail({
        from: `"My App" <${this.configService.get('MAIL_USER')}>`,
        to,
        subject: 'کد تأیید شما',
        html: `
        <div style="font-family: sans-serif; text-align: center;">
          <h2>کد تأیید شما</h2>
          <p style="font-size: 24px; font-weight: bold; letter-spacing: 4px;">${code}</p>
          <p>این کد را در اختیار دیگران قرار ندهید.</p>
        </div>
      `,
      });
      console.log('✅ ایمیل ارسال شد:', info.messageId);
    } catch (error) {
      console.error('❌ خطا در ارسال ایمیل:', error);
      throw error;
    }
  }
}
