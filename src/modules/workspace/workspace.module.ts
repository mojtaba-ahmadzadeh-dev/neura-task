import { Module } from '@nestjs/common';
import { WorkspaceService } from './workspace.service';
import { WorkspaceController } from './workspace.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserEntity } from '../user/entity/user.entity';
import { Workspace } from './entities/workspace.entity';
import { WorkspaceMember } from './entities/workspace-member.entity';
import { JwtService } from '@nestjs/jwt';
import { UserRepository } from '../user/repository/user.repository';

@Module({
  imports: [TypeOrmModule.forFeature([UserEntity, Workspace, WorkspaceMember])],
  controllers: [WorkspaceController],
  providers: [WorkspaceService, JwtService, UserRepository],
})
export class WorkspaceModule {}
