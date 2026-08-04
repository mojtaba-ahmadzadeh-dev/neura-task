import { BadRequestException, Inject, Injectable, Scope } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserEntity } from './entity/user.entity';
import { RoleEntity } from 'src/modules/rbac/entities/role.entity';
import { UpdateUserDto, UpdateUserRoleDto } from './dto/user.dto';
import { paginationGenerator, paginationSolver } from 'src/common/utils/pagination.utils';
import { PaginationDto } from 'src/common/dto/pagination.dto';
import { REQUEST } from '@nestjs/core';
import type { Request } from 'express';
import { S3Service } from '../s3/s3.service';

@Injectable({ scope: Scope.REQUEST })
export class UserService {
  constructor(
    @InjectRepository(UserEntity)
    private userRepository: Repository<UserEntity>,
    @InjectRepository(RoleEntity)
    private roleRepository: Repository<RoleEntity>,
    private readonly s3Service: S3Service,
    @Inject(REQUEST) private request: Request,
  ) {}

  async getAllUsers(paginationDto: PaginationDto) {
    const { page, limit, skip } = paginationSolver(paginationDto);

    const [users, count] = await this.userRepository.findAndCount({
      relations: { role: true },
      order: { id: 'DESC' },
      skip,
      take: limit,
    });

    return {
      message: 'لیست کاربران با موفقیت دریافت شد',
      data: users,
      pagination: paginationGenerator(count, page, limit),
    };
  }
  async getUserById(userId: number) {
    const user = await this.userRepository.findOne({
      where: { id: userId },
      relations: { role: true },
    });

    if (!user) {
      throw new BadRequestException('کاربر مورد نظر یافت نشد');
    }

    return {
      message: 'اطلاعات کاربر با موفقیت دریافت شد',
      data: user,
    };
  }
  async getMe() {
    const userId = (this.request.user as UserEntity)?.id;

    if (!userId) {
      throw new BadRequestException('کاربر احراز هویت نشده است');
    }

    return this.getUserById(userId);
  }
  async changeRole(userId: number, updateUserRoleDto: UpdateUserRoleDto) {
    const user = await this.userRepository.findOne({
      where: { id: userId },
      relations: { role: true },
    });

    if (!user) {
      throw new BadRequestException('کاربر مورد نظر یافت نشد');
    }

    const newRole = await this.roleRepository.findOne({
      where: { id: updateUserRoleDto.roleId },
    });

    if (!newRole) {
      throw new BadRequestException('نقش مورد نظر یافت نشد');
    }

    if (user.roleId === newRole.id) {
      throw new BadRequestException('کاربر از قبل دارای این نقش است');
    }

    user.roleId = newRole.id;
    user.role = newRole;

    const updatedUser = await this.userRepository.save(user);

    return {
      message: 'نقش کاربر با موفقیت تغییر یافت',
      data: {
        id: updatedUser.id,
        email: updatedUser.email,
        roleId: updatedUser.roleId,
      },
    };
  }
  async updateUser(updateUserDto: UpdateUserDto, avatarFile?: Express.Multer.File) {
    const userId = (this.request.user as UserEntity)?.id;

    if (!userId) {
      throw new BadRequestException('کاربر احراز هویت نشده است');
    }

    const user = await this.userRepository.findOne({
      where: { id: userId },
    });

    if (!user) {
      throw new BadRequestException('کاربر مورد نظر یافت نشد');
    }

    const { firstName, lastName, email } = updateUserDto;

    if (email && email !== user.email) {
      const emailExists = await this.userRepository.findOne({
        where: { email },
      });
      if (emailExists) {
        throw new BadRequestException('این ایمیل قبلاً ثبت شده است');
      }
      user.email = email;
      user.isEmailVerified = false;
    }

    if (firstName !== undefined) user.firstName = firstName;
    if (lastName !== undefined) user.lastName = lastName;

    if (avatarFile) {
      // اگه آواتار قبلی وجود داشت، حذفش کن
      if (user.avatar) {
        const oldKey = this.extractKeyFromUrl(user.avatar);
        if (oldKey) {
          await this.s3Service.deleteFile(oldKey).catch(() => null);
        }
      }

      const uploadResult = await this.s3Service.uploadFile(avatarFile, 'avatars');
      user.avatar = uploadResult.Location;
    }

    const updatedUser = await this.userRepository.save(user);

    return {
      message: 'اطلاعات کاربر با موفقیت به‌روزرسانی شد',
      data: updatedUser,
    };
  }
  private extractKeyFromUrl(url: string): string | null {
    try {
      const parsed = new URL(url);
      return decodeURIComponent(parsed.pathname.slice(1)); // حذف "/" اول
    } catch {
      return null;
    }
  }
}
