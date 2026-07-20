import { Reflector } from "@nestjs/core";
import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
  UnauthorizedException,
} from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { Request } from "express";
import { UserRepository } from "src/modules/user/repository/user.repository";
import { UserEntity } from "src/modules/user/entity/user.entity";

@Injectable()
export class RbacGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private jwtService: JwtService,
    private userRepository: UserRepository,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const requiredPermissions = this.reflector.get<string[]>(
      "permissions",
      context.getHandler(),
    );

    const request = context.switchToHttp().getRequest<Request>();

    let accessToken = request.cookies?.access_token;
    if (!accessToken) {
      const authHeader = request.headers.authorization;
      if (authHeader?.startsWith("Bearer ")) {
        accessToken = authHeader.substring(7);
      }
    }

    if (!accessToken) {
      throw new UnauthorizedException("لطفا ابتدا وارد شوید");
    }

    let payload: any;
    try {
      payload = await this.jwtService.verifyAsync(accessToken, {
        secret: process.env.ACCESS_TOKEN_SECRET,
      });
    } catch (error) {
      throw new UnauthorizedException("توکن نامعتبر یا منقضی شده است");
    }

    const userId = payload.userId;
    if (!userId) {
      throw new UnauthorizedException("اطلاعات توکن نامعتبر است");
    }

    const user = await this.findUserWithPermissions(userId);
    if (!user) {
      throw new UnauthorizedException("کاربر یافت نشد");
    }

    request.user = user;

    if (user.role?.name?.toLowerCase() === "admin") {
      return true;
    }

    if (!requiredPermissions || requiredPermissions.length === 0) {
      return true;
    }

    const userPermissions = user.role?.permissions?.map((p) => p.name) || [];

    const hasAllPermissions = requiredPermissions.every((perm) =>
      userPermissions.includes(perm),
    );

    if (!hasAllPermissions) {
      throw new ForbiddenException(
        `شما دسترسی به این عملیات ندارید: ${requiredPermissions.join(", ")}`,
      );
    }

    return true;
  }

  private async findUserWithPermissions(
    userId: number,
  ): Promise<UserEntity | null> {
    return this.userRepository.findUserWithPermissions(userId);
  }
}
