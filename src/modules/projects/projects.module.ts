import { Module } from '@nestjs/common';
import { ProjectsService } from './projects.service';
import { ProjectsController } from './projects.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserEntity } from '../user/entity/user.entity';
import { ProjectEntity } from './entities/project.entity';
import { JwtService } from '@nestjs/jwt';
import { UserRepository } from '../user/repository/user.repository';
import { Workspace } from '../workspace/entities/workspace.entity';

@Module({
  imports: [TypeOrmModule.forFeature([UserEntity, ProjectEntity, Workspace])],
  controllers: [ProjectsController],
  providers: [ProjectsService, JwtService, UserRepository],
})
export class ProjectsModule {}
