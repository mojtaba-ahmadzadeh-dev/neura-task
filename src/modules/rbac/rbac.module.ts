import { Module } from '@nestjs/common';
import { RbacService } from './rbac.service';
import { RbacController } from './rbac.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserEntity } from '../user/entity/user.entity';
import { PermissionEntity } from './entities/permission.entity';
import { RoleEntity } from './entities/role.entity';
import { JwtService } from '@nestjs/jwt';
import { UserRepository } from '../user/repository/user.repository';

@Module({
  imports: [TypeOrmModule.forFeature([UserEntity, PermissionEntity, RoleEntity])],
  controllers: [RbacController],
  providers: [RbacService, JwtService, UserRepository],
})
export class RbacModule {}
