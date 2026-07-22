import {
  BadRequestException,
  Inject,
  Injectable,
  NotFoundException,
  Scope,
} from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { In, Repository } from "typeorm";
import { REQUEST } from "@nestjs/core";
import type { Request } from "express";

import { CreateProjectDto } from "./dto/create-project.dto";
import { ProjectEntity } from "./entities/project.entity";
import { UserEntity } from "../user/entity/user.entity";

@Injectable({ scope: Scope.REQUEST })
export class ProjectsService {
  constructor(
    @InjectRepository(ProjectEntity)
    private readonly projectRepository: Repository<ProjectEntity>,

    @InjectRepository(UserEntity)
    private readonly userRepository: Repository<UserEntity>,

    @Inject(REQUEST) private request: Request,
  ) {}

  async create(createProjectDto: CreateProjectDto): Promise<ProjectEntity> {
    const user = this.request.user as UserEntity; // Type assertion

    if (!user?.id) {
      throw new BadRequestException("کاربر احراز هویت نشده است");
    }

    const {
      title,
      description,
      status,
      color,
      icon,
      coverImage,
      startDate,
      endDate,
      dueDate,
      settings,
      memberIds = [],
    } = createProjectDto;

    const project = this.projectRepository.create({
      title,
      description,
      status: status || "active",
      color,
      icon,
      coverImage,
      startDate,
      endDate,
      dueDate,
      settings: settings || {
        isPrivate: true,
        allowGuest: false,
        notificationEnabled: true,
        defaultView: "board",
      },
      owner: user,
      ownerId: user.id,
      taskCount: 0,
      completedTaskCount: 0,
      progress: 0,
    });

    const savedProject = await this.projectRepository.save(project);

    if (memberIds.length > 0) {
      const members = await this.userRepository.findBy({
        id: In(memberIds),
      });

      if (members.length !== memberIds.length) {
        throw new NotFoundException("یکی از کاربران مورد نظر یافت نشد");
      }

      savedProject.members = members.filter((m) => m.id !== user.id);

      await this.projectRepository.save(savedProject);
    }

    return this.projectRepository.findOne({
      where: { id: savedProject.id },
      relations: {
        owner: true,
        members: true,
      },
    });
  }
  
}
