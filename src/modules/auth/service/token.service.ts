import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { AuthMessage } from 'src/common/enums/message.enum';
import { AccessTokenPayload, CookiePayload } from '../types/payload';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class TokenService {
  constructor(
    private jwtService: JwtService,
    private configService: ConfigService,
  ) {}

  createOtpToken(payload: CookiePayload) {
    const token = this.jwtService.sign(payload, {
      secret: this.configService.get('OTP_TOKEN_SECRET'),
      expiresIn: 60 * 2, // 2 دقیقه
    });
    return token;
  }

  verifyOtpToken(token: string): CookiePayload {
    try {
      return this.jwtService.verify(token, {
        secret: this.configService.get('OTP_TOKEN_SECRET'),
      });
    } catch (_error) {
      throw new UnauthorizedException(AuthMessage.TryAgain);
    }
  }

  createAccessToken(payload: AccessTokenPayload) {
    const token = this.jwtService.sign(payload, {
      secret: this.configService.get('ACCESS_TOKEN_SECRET'),
      expiresIn: '7d', // 7 روز
    });
    return token;
  }

  createRefreshToken(payload: AccessTokenPayload) {
    return this.jwtService.sign(payload, {
      secret:
        this.configService.get('REFRESH_TOKEN_SECRET') ||
        this.configService.get('ACCESS_TOKEN_SECRET'),
      expiresIn: '30d', // 30 روز
    });
  }

  verifyAccessToken(token: string): AccessTokenPayload {
    try {
      return this.jwtService.verify(token, {
        secret: this.configService.get('ACCESS_TOKEN_SECRET'),
      });
    } catch (_error) {
      throw new UnauthorizedException(AuthMessage.LoginAgain);
    }
  }

  verifyRefreshToken(token: string): AccessTokenPayload {
    try {
      return this.jwtService.verify(token, {
        secret:
          this.configService.get('REFRESH_TOKEN_SECRET') ||
          this.configService.get('ACCESS_TOKEN_SECRET'),
      });
    } catch (_error) {
      throw new UnauthorizedException('Refresh token نامعتبر است');
    }
  }

  async generateTokens(userId: number, roleId: number) {
    const payload: AccessTokenPayload = {
      userId,
      roleId,
    };

    const accessToken = this.createAccessToken(payload);
    const refreshToken = this.createRefreshToken(payload);

    return {
      accessToken,
      refreshToken,
    };
  }

  async refreshTokens(refreshToken: string) {
    try {
      const payload = this.verifyRefreshToken(refreshToken);

      return this.generateTokens(payload.userId, payload.roleId);
    } catch (_error) {
      throw new UnauthorizedException('Refresh token نامعتبر یا منقضی شده است');
    }
  }
}
