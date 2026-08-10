import type { Response } from 'express';
import {
  RegisterDto,
  LoginDto,
  VerifyOtpDto,
  ForgotPasswordDto,
  ResetPasswordDto,
} from '../dto/auth.dto';
import { GoogleUser } from '../types/payload';

export interface IRegistrationService {
  register(dto: RegisterDto): Promise<{ message: string }>;
}

export interface ILoginService {
  login(dto: LoginDto, res: Response): Promise<any>;
  verifyOtp(dto: VerifyOtpDto, res: Response): Promise<any>;
}

export interface IPasswordService {
  forgotPassword(dto: ForgotPasswordDto): Promise<{ message: string }>;
  resetPassword(dto: ResetPasswordDto): Promise<{ message: string }>;
}

export interface IGoogleAuthService {
  authenticate(userData: GoogleUser, res: Response): Promise<any>;
}

export interface IOtpService {
  createOtp(userId: number, expireMinutes?: number): Promise<string>;
  verifyOtp(userId: number, code: string): Promise<void>;
}

export interface ICookieService {
  setAuthCookies(res: Response, tokens: { accessToken: string; refreshToken: string }): void;
  clearAuthCookies(res: Response): void;
}

export interface IRoleService {
  resolveRoleId(): Promise<number>;
}
