// ====================== auth.service.ts ======================
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { TokenService } from './token.service';
import {
  RegisterDto,
  LoginDto,
  VerifyOtpDto,
  ForgotPasswordDto,
  ResetPasswordDto,
} from '../dto/auth.dto';
import { GoogleUser } from '../types/payload';
import type { Response } from 'express';
import { RegistrationService } from './registration.service';
import { LoginService } from './login.service';
import { PasswordService } from './password.service';
import { GoogleAuthService } from './google-auth.service';
import { CookieService } from './cookie.service';
import { AuthMessage } from 'src/common/enums/message.enum';

@Injectable()
export class AuthService {
  constructor(
    private readonly registrationService: RegistrationService,
    private readonly loginService: LoginService,
    private readonly passwordService: PasswordService,
    private readonly googleAuthService: GoogleAuthService,
    private readonly tokenService: TokenService,
    private readonly cookieService: CookieService,
  ) {}

  register(dto: RegisterDto) {
    return this.registrationService.register(dto);
  }
  verifyOtp(dto: VerifyOtpDto, res: Response) {
    return this.loginService.verifyOtp(dto, res);
  }
  login(dto: LoginDto, res: Response) {
    return this.loginService.login(dto, res);
  }
  async refreshToken(refreshToken: string, res: Response) {
    if (!refreshToken) {
      throw new UnauthorizedException(AuthMessage.REFRESH_TOKEN_REQUIRED);
    }

    const tokens = await this.tokenService.refreshTokens(refreshToken);
    this.cookieService.clearAuthCookies(res);
    this.cookieService.setAuthCookies(res, tokens);

    return { message: AuthMessage.TOKEN_REFRESHED_SUCCESS };
  }
  logout(res: Response) {
    this.cookieService.clearAuthCookies(res);
    return { message: AuthMessage.LOGOUT_SUCCESS };
  }
  forgotPassword(dto: ForgotPasswordDto) {
    return this.passwordService.forgotPassword(dto);
  }
  resetPassword(dto: ResetPasswordDto) {
    return this.passwordService.resetPassword(dto);
  }
  googleAuth(userData: GoogleUser, res: Response) {
    return this.googleAuthService.authenticate(userData, res);
  }
}
