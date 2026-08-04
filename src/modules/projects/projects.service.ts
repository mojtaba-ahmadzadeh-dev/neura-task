import {
  BadRequestException,
  ForbiddenException,
  Inject,
  Injectable,
  NotFoundException,
  Scope,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Brackets, Repository } from 'typeorm';
import { REQUEST } from '@nestjs/core';
import type { Request } from 'express';
import { CreateProjectDto, FindAllProjectsDto } from './dto/create-project.dto';
import { ProjectEntity } from './entities/project.entity';
import { UserEntity } from '../user/entity/user.entity';
import { paginationGenerator, paginationSolver } from 'src/common/utils/pagination.utils';
import { Workspace } from '../workspace/entities/workspace.entity';
import { UpdateProjectDto } from './dto/update-project.dto';
import { ProjectMessages } from 'src/common/enums/message.enum';

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
        throw new ForbiddenException(ProjectMessages.USER_UNAUTHORIZED);
      }

      const { title, description, workspaceId } = createProjectDto;

      const user = await this.userRepository.findOne({
        where: { id: userId },
      });
      if (!user) {
        throw new NotFoundException(ProjectMessages.USER_NOT_FOUND);
      }

      const workspace = await this.workspaceRepository.findOne({
        where: { id: workspaceId },
      });
      if (!workspace) {
        throw new NotFoundException(ProjectMessages.WORKSPACE_NOT_FOUND);
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
      if (error instanceof NotFoundException || error instanceof ForbiddenException) {
        throw error;
      }
      throw new BadRequestException(
        `${ProjectMessages.ERROR_CREATING_PROJECT}: ${error || 'خطای ناشناخته'}`,
      );
    }
  }
  async findAll(filters: FindAllProjectsDto) {
    try {
      const userId = this.request.user?.id;
      if (!userId) {
        throw new ForbiddenException(ProjectMessages.USER_UNAUTHORIZED);
      }

      const { page, limit, skip } = paginationSolver(filters);
      const { workspaceId, search } = filters;

      const queryBuilder = this.projectRepository
        .createQueryBuilder('project')
        .leftJoinAndSelect('project.workspace', 'workspace')
        .orderBy('project.id', 'DESC')
        .skip(skip)
        .take(limit);

      if (workspaceId) {
        queryBuilder.andWhere('project.workspaceId = :workspaceId', {
          workspaceId,
        });
      }

      if (search) {
        queryBuilder.andWhere(
          new Brackets((qb) => {
            qb.where('project.title ILIKE :search', {
              search: `%${search}%`,
            }).orWhere('project.description ILIKE :search', {
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
        `${ProjectMessages.ERROR_CREATING_PROJECT} ${error || 'خطای ناشناخته'}`,
      );
    }
  }
  async findOne(id: number) {
    try {
      const userId = this.request.user?.id;
      if (!userId) {
        throw new ForbiddenException(ProjectMessages.USER_UNAUTHORIZED);
      }

      const project = await this.projectRepository.findOne({
        where: { id },
        relations: {
          workspace: true,
        },
      });

      if (!project) {
        throw new NotFoundException(ProjectMessages.PROJECT_NOT_FOUND);
      }

      return project;
    } catch (error) {
      if (error instanceof NotFoundException || error instanceof ForbiddenException) {
        throw error;
      }
      throw new BadRequestException(
        `${ProjectMessages.ERROR_FETCHING_PROJECT}: ${error || 'خطای ناشناخته'}`,
      );
    }
  }
  async update(id: number, updateProjectDto: UpdateProjectDto) {
    try {
      const userId = this.request.user?.id;
      if (!userId) {
        throw new ForbiddenException(ProjectMessages.USER_UNAUTHORIZED);
      }

      const project = await this.projectRepository.findOne({
        where: { id },
        relations: {
          workspace: true,
        },
      });

      if (!project) {
        throw new NotFoundException(ProjectMessages.PROJECT_NOT_FOUND);
      }

      const { title, description, workspaceId } = updateProjectDto;

      if (workspaceId && workspaceId !== project.workspaceId) {
        const workspace = await this.workspaceRepository.findOne({
          where: { id: workspaceId },
        });
        if (!workspace) {
          throw new NotFoundException(ProjectMessages.WORKSPACE_NOT_FOUND);
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
      if (error instanceof NotFoundException || error instanceof ForbiddenException) {
        throw error;
      }
      throw new BadRequestException(
        `${ProjectMessages.ERROR_UPDATING_PROJECT}: ${error || 'خطای ناشناخته'}`,
      );
    }
  }
  async remove(id: number) {
    try {
      const userId = this.request.user?.id;
      if (!userId) {
        throw new ForbiddenException(ProjectMessages.USER_UNAUTHORIZED);
      }

      const project = await this.projectRepository.findOne({
        where: { id },
        relations: { workspace: true },
      });

      if (!project) {
        throw new NotFoundException(ProjectMessages.PROJECT_NOT_FOUND);
      }

      await this.projectRepository.delete(id);

      return {
        message: ProjectMessages.PROJECT_DELETED_SUCCESSFULLY,
      };
    } catch (error) {
      if (error instanceof NotFoundException || error instanceof ForbiddenException) {
        throw error;
      }
      throw new BadRequestException(
        `${ProjectMessages.ERROR_DELETING_PROJECT}: ${error || 'خطای ناشناخته'}`,
      );
    }
  }
}
