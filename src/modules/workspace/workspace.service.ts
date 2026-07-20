import {
  BadRequestException,
  ConflictException,
  Inject,
  Injectable,
  Scope,
} from "@nestjs/common";
import {
  CreateInviteDto,
  CreateWorkspaceDto,
  UpdateMemberRoleDto,
} from "./dto/create-workspace.dto";
import { UpdateWorkspaceDto } from "./dto/update-workspace.dto";
import { InjectRepository } from "@nestjs/typeorm";
import { Workspace } from "./entities/workspace.entity";
import { Repository } from "typeorm";
import { WorkspaceMember } from "./entities/workspace-member.entity";
import { UserEntity } from "../user/entity/user.entity";
import { Roles } from "src/common/enums/role.enum";
import slugify from "slugify";
import { REQUEST } from "@nestjs/core";
import type { Request } from "express";

@Injectable({ scope: Scope.REQUEST })
export class WorkspaceService {
  constructor(
    @InjectRepository(Workspace)
    private workspaceRepository: Repository<Workspace>,
    @InjectRepository(WorkspaceMember)
    private workspaceMemberRepository: Repository<WorkspaceMember>,
    @InjectRepository(UserEntity)
    private userRepository: Repository<UserEntity>,
    @Inject(REQUEST) private request: Request,
  ) {}

  async create(createWorkspaceDto: CreateWorkspaceDto) {
    const user = this.request.user;

    if (!user) {
      throw new BadRequestException("کاربر احراز هویت نشده است");
    }

    const existingName = await this.workspaceRepository.findOne({
      where: { name: createWorkspaceDto.name },
    });

    if (existingName) {
      throw new ConflictException(
        "نام workspace قبلاً استفاده شده است. لطفاً نام دیگری انتخاب کنید.",
      );
    }

    let slug = slugify(createWorkspaceDto.name, {
      lower: true,
      strict: true,
      locale: "fa",
    });

    let existingSlug = await this.workspaceRepository.findOne({
      where: { slug },
    });
    let counter = 1;
    const originalSlug = slug;

    while (existingSlug) {
      slug = `${originalSlug}-${counter}`;
      existingSlug = await this.workspaceRepository.findOne({
        where: { slug },
      });
      counter++;
    }

    const workspace = this.workspaceRepository.create({
      name: createWorkspaceDto.name,
      slug,
      description: createWorkspaceDto.description,
      owner: user,
      ownerId: user.id,
      isActive: true,
    });

    const savedWorkspace = await this.workspaceRepository.save(workspace);

    const member = this.workspaceMemberRepository.create({
      workspace: savedWorkspace,
      workspaceId: savedWorkspace.id,
      user: user,
      userId: user.id,
      role: Roles.OWNER,
    });

    await this.workspaceMemberRepository.save(member);

    return {
      message: "Workspace با موفقیت ایجاد شد",
      data: savedWorkspace,
    };
  }
  async findAll() {
    const user = this.request.user;

    if (!user) {
      throw new BadRequestException("کاربر احراز هویت نشده است");
    }

    const workspaces = await this.workspaceRepository
      .createQueryBuilder("workspace")
      .leftJoinAndSelect("workspace.owner", "owner")
      .leftJoinAndSelect("workspace.members", "member")
      .leftJoinAndSelect("member.user", "memberUser")
      .where("workspace.ownerId = :userId", { userId: user.id })
      .orWhere("member.userId = :userId", { userId: user.id })
      .orderBy("workspace.createdAt", "DESC")
      .getMany();

    return {
      message: "لیست workspaceها با موفقیت دریافت شد",
      data: workspaces,
    };
  }
  async findOne(id: number) {
    const user = this.request.user;

    if (!user) {
      throw new BadRequestException("کاربر احراز هویت نشده است");
    }

    const workspace = await this.workspaceRepository
      .createQueryBuilder("workspace")
      .leftJoinAndSelect("workspace.owner", "owner")
      .leftJoinAndSelect("workspace.members", "member")
      .leftJoinAndSelect("member.user", "memberUser")
      .where("workspace.id = :id", { id })
      .andWhere("(workspace.ownerId = :userId OR member.userId = :userId)", {
        userId: user.id,
      })
      .getOne();

    if (!workspace) {
      throw new BadRequestException("Workspace یافت نشد یا دسترسی ندارید");
    }

    return {
      message: "Workspace با موفقیت دریافت شد",
      data: workspace,
    };
  }
  async update(id: number, updateWorkspaceDto: UpdateWorkspaceDto) {
    const user = this.request.user;

    if (!user) {
      throw new BadRequestException("کاربر احراز هویت نشده است");
    }

    const workspace = await this.workspaceRepository.findOne({
      where: { id },
      relations: {
        owner: true,
      },
    });

    if (!workspace) {
      throw new BadRequestException("Workspace مورد نظر یافت نشد");
    }

    // چک کردن دسترسی (فقط Owner می‌تواند ویرایش کند)
    if (workspace.ownerId !== user.id) {
      throw new ConflictException("شما مجوز ویرایش این workspace را ندارید");
    }

    // اگر نام تغییر کند، چک تکراری بودن
    if (updateWorkspaceDto.name && updateWorkspaceDto.name !== workspace.name) {
      const existingName = await this.workspaceRepository.findOne({
        where: { name: updateWorkspaceDto.name },
      });

      if (existingName && existingName.id !== id) {
        throw new ConflictException(
          "نام workspace قبلاً استفاده شده است. لطفاً نام دیگری انتخاب کنید.",
        );
      }
    }

    // به‌روزرسانی slug در صورت تغییر نام
    let slug = workspace.slug;
    if (updateWorkspaceDto.name) {
      slug = slugify(updateWorkspaceDto.name, {
        lower: true,
        strict: true,
        locale: "fa",
      });

      // اطمینان از یکتا بودن slug جدید
      let existingSlug = await this.workspaceRepository.findOne({
        where: { slug },
      });
      let counter = 1;
      const originalSlug = slug;

      while (existingSlug && existingSlug.id !== id) {
        slug = `${originalSlug}-${counter}`;
        existingSlug = await this.workspaceRepository.findOne({
          where: { slug },
        });
        counter++;
      }
    }

    // اعمال تغییرات
    Object.assign(workspace, {
      ...updateWorkspaceDto,
      slug: slug || workspace.slug,
    });

    const updatedWorkspace = await this.workspaceRepository.save(workspace);

    return {
      message: "Workspace با موفقیت به‌روزرسانی شد",
      data: updatedWorkspace,
    };
  }
  async remove(id: number) {
    const user = this.request.user;

    if (!user) {
      throw new BadRequestException("کاربر احراز هویت نشده است");
    }

    const workspace = await this.workspaceRepository.findOne({
      where: { id },
      relations: { owner: true },
    });

    if (!workspace) {
      throw new BadRequestException("Workspace مورد نظر یافت نشد");
    }

    if (workspace.ownerId !== user.id) {
      throw new ConflictException("شما مجوز حذف این workspace را ندارید");
    }

    await this.workspaceMemberRepository.delete({ workspaceId: id });

    await this.workspaceRepository.delete(id);

    return {
      message: "Workspace با موفقیت به طور کامل حذف شد",
    };
  }
  async invite(id: number, createInviteDto: CreateInviteDto) {
    const user = this.request.user;

    if (!user) {
      throw new BadRequestException("کاربر احراز هویت نشده است");
    }

    const workspace = await this.workspaceRepository.findOne({
      where: { id },
    });

    if (!workspace) {
      throw new BadRequestException("Workspace مورد نظر یافت نشد");
    }

    // چک کردن دسترسی درخواست‌دهنده (Owner یا عضو با نقش ADMIN)
    const requesterMembership = await this.workspaceMemberRepository.findOne({
      where: { workspaceId: id, userId: user.id },
    });

    const isOwner = workspace.ownerId === user.id;
    const isAdmin = requesterMembership?.role === Roles.Admin;

    if (!isOwner && !isAdmin) {
      throw new ConflictException(
        "شما مجوز دعوت کردن اعضا به این workspace را ندارید",
      );
    }

    // جلوگیری از دعوت با نقش OWNER
    if (createInviteDto.role === Roles.OWNER) {
      throw new BadRequestException("امکان افزودن عضو با نقش OWNER وجود ندارد");
    }

    // پیدا کردن کاربر بر اساس ایمیل
    const invitedUser = await this.userRepository.findOne({
      where: { email: createInviteDto.email },
    });

    if (!invitedUser) {
      throw new BadRequestException("کاربری با این ایمیل در سیستم یافت نشد");
    }

    // چک کردن اینکه کاربر از قبل عضو نباشد
    const existingMember = await this.workspaceMemberRepository.findOne({
      where: { workspaceId: id, userId: invitedUser.id },
    });

    if (existingMember) {
      throw new ConflictException("این کاربر از قبل عضو workspace است");
    }

    const member = this.workspaceMemberRepository.create({
      workspace,
      workspaceId: workspace.id,
      user: invitedUser,
      userId: invitedUser.id,
      role: createInviteDto.role || Roles.MEMBER,
    });

    const savedMember = await this.workspaceMemberRepository.save(member);

    return {
      message: "کاربر با موفقیت به workspace اضافه شد",
      data: savedMember,
    };
  }
}
