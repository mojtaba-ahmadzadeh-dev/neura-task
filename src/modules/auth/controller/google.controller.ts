import { Controller, Get, Req, Res, UseGuards } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { AuthService } from '../service/auth.service';
import type { Response } from 'express';
import { GoogleUser } from '../types/payload';

@Controller('auth/google')
@ApiTags('Google Auth')
export class GoogleAuthController {
  constructor(private readonly authService: AuthService) {}

  @Get()
  @UseGuards(AuthGuard('google'))
  googleLogin() {}

  @Get('redirect')
  @UseGuards(AuthGuard('google'))
  async googleRedirect(
    @Req() req: { user: GoogleUser },
    @Res({ passthrough: true }) res: Response,
  ) {
    return this.authService.googleAuth(req.user, res);
  }
}
