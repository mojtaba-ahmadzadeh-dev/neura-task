import { Injectable } from '@nestjs/common';
import type { Response } from 'express';
import { ICookieService } from '../interfaces/auth.interfaces';

@Injectable()
export class CookieService implements ICookieService {
  setAuthCookies(res: Response, tokens: { accessToken: string; refreshToken: string }): void {
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
      maxAge: 1000 * 60 * 60 * 24 * 30, // 30 روز
      path: '/',
    });
  }
  clearAuthCookies(res: Response): void {
    res.clearCookie('access_token');
    res.clearCookie('refresh_token');
  }
}
