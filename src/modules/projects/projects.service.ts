import {
  BadRequestException,
  ForbiddenException,
  Inject,
  Injectable,
  NotFoundException,
  Scope,
} from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Brackets, Repository } from "typeorm";
import { REQUEST } from "@nestjs/core";
import type { Request } from "express";
import { CreateProjectDto, FindAllProjectsDto } from "./dto/create-project.dto";
import { ProjectEntity } from "./entities/project.entity";
import { UserEntity } from "../user/entity/user.entity";
import {
  paginationGenerator,
  paginationSolver,
} from "src/common/utils/pagination.utils";
import { Workspace } from "../workspace/entities/workspace.entity";
import { UpdateProjectDto } from "./dto/update-project.dto";

@Injectable({ scope: Scope.REQUEST })
export class ProjectsService {
  constructor(
    @InjectRepository(ProjectEntity)
    private readonly projectRepository: Repository<ProjectEntity>,
    @InjectRepository(UserEntity)
    private readonly userRepository: Repository<UserEntity>,
    @InjectRepository(Workspace)
    private readonly workspaceRepository: Repository<Workspace>,
    @Inject(REQUEST) private request: Request,
  ) {}

  async create(createProjectDto: CreateProjectDto) {
    try {
      const userId = this.request.user?.id;
      if (!userId) {
        throw new ForbiddenException("کاربر احراز هویت نشده است");
      }

      const { title, description, workspaceId } = createProjectDto;

      const user = await this.userRepository.findOne({
        where: { id: userId },
      });
      if (!user) {
        throw new NotFoundException("کاربر یافت نشد");
      }

      const workspace = await this.workspaceRepository.findOne({
        where: { id: workspaceId },
      });
      if (!workspace) {
        throw new NotFoundException("ورک‌اسپیس یافت نشد");
      }
      const project = this.projectRepository.create({
        title,
        description: description || null,
        createBy: userId,
        workspaceId: workspaceId,
        workspace: workspace,
      });

      const savedProject = await this.projectRepository.save(project);

      return await this.projectRepository.findOne({
        where: { id: savedProject.id },
        relations: {
          workspace: true,
        },
      });
    } catch (error) {
      if (
        error instanceof NotFoundException ||
        error instanceof ForbiddenException
      ) {
        throw error;
      }
      throw new BadRequestException(
        `خطا در ایجاد پروژه: ${error || "خطای ناشناخته"}`,
      );
    }
  }
  async findAll(filters: FindAllProjectsDto) {
    try {
      const userId = this.request.user?.id;
      if (!userId) {
        throw new ForbiddenException("کاربر احراز هویت نشده است");
      }

      const { page, limit, skip } = paginationSolver(filters);
      const { workspaceId, search } = filters;

      const queryBuilder = this.projectRepository
        .createQueryBuilder("project")
        .leftJoinAndSelect("project.workspace", "workspace")
        .orderBy("project.id", "DESC")
        .skip(skip)
        .take(limit);

      if (workspaceId) {
        queryBuilder.andWhere("project.workspaceId = :workspaceId", {
          workspaceId,
        });
      }

      if (search) {
        queryBuilder.andWhere(
          new Brackets((qb) => {
            qb.where("project.title ILIKE :search", {
              search: `%${search}%`,
            }).orWhere("project.description ILIKE :search", {
              search: `%${search}%`,
            });
          }),
        );
      }

      const [projects, count] = await queryBuilder.getManyAndCount();

      return {
        pagination: paginationGenerator(count, page, limit),
        projects,
      };
    } catch (error) {
      if (error instanceof ForbiddenException) {
        throw error;
      }
      throw new BadRequestException(
        `خطا در دریافت لیست پروژه‌ها: ${error || "خطای ناشناخته"}`,
      );
    }
  }
  async findOne(id: number){
    try {
      const userId = this.request.user?.id;
      if (!userId) {
        throw new ForbiddenException("کاربر احراز هویت نشده است");
      }

      const project = await this.projectRepository.findOne({
        where: { id },
        relations: {
          workspace: true,
        },
      });

      if (!project) {
        throw new NotFoundException("پروژه یافت نشد");
      }

      return project;
    } catch (error) {
      if (
        error instanceof NotFoundException ||
        error instanceof ForbiddenException
      ) {
        throw error;
      }
      throw new BadRequestException(
        `خطا در دریافت پروژه: ${error || "خطای ناشناخته"}`,
      );
    }
  }
  async update(
    id: number,
    updateProjectDto: UpdateProjectDto,
  ): Promise<ProjectEntity> {
    try {
      const userId = this.request.user?.id;
      if (!userId) {
        throw new ForbiddenException("کاربر احراز هویت نشده است");
      }

      const project = await this.projectRepository.findOne({
        where: { id },
        relations: {
          workspace: true,
        },
      });

      if (!project) {
        throw new NotFoundException("پروژه یافت نشد");
      }

      const { title, description, workspaceId } = updateProjectDto;

      if (workspaceId && workspaceId !== project.workspaceId) {
        const workspace = await this.workspaceRepository.findOne({
          where: { id: workspaceId },
        });
        if (!workspace) {
          throw new NotFoundException("ورک‌اسپیس یافت نشد");
        }
        project.workspace = workspace;
        project.workspaceId = workspaceId;
      }

      if (title !== undefined) {
        project.title = title;
      }

      if (description !== undefined) {
        project.description = description;
      }

      await this.projectRepository.save(project);

      return await this.projectRepository.findOne({
        where: { id },
        relations: {
          workspace: true,
        },
      });
    } catch (error) {
      if (
        error instanceof NotFoundException ||
        error instanceof ForbiddenException
      ) {
        throw error;
      }
      throw new BadRequestException(
        `خطا در ویرایش پروژه: ${error || "خطای ناشناخته"}`,
      );
    }
  }
  async remove(id: number) {
    try {
      const userId = this.request.user?.id;
      if (!userId) {
        throw new ForbiddenException("کاربر احراز هویت نشده است");
      }

      const project = await this.projectRepository.findOne({
        where: { id },
        relations: { workspace: true },
      });

      if (!project) {
        throw new NotFoundException("پروژه یافت نشد");
      }

      await this.projectRepository.delete(id);

      return { message: "پروژه با موفقیت حذف شد" };
    } catch (error) {
      if (
        error instanceof NotFoundException ||
        error instanceof ForbiddenException
      ) {
        throw error;
      }
      throw new BadRequestException(
        `خطا در حذف پروژه: ${error || "خطای ناشناخته"}`,
      );
    }
  }
}
