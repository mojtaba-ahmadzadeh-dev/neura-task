import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { RoleEntity } from 'src/modules/rbac/entities/role.entity';
import { UserEntity } from 'src/modules/user/entity/user.entity';

@Injectable()
export class RoleService {
  constructor(
    @InjectRepository(RoleEntity)
    private readonly roleRepository: Repository<RoleEntity>,
    @InjectRepository(UserEntity)
    private readonly userRepository: Repository<UserEntity>,
  ) {}

  async resolveRoleId() {
    const userCount = await this.userRepository.count();
    const roleName = userCount === 0 ? 'admin' : 'user';

    let role = await this.roleRepository.findOne({ where: { name: roleName } });

    if (!role) {
      role = await this.roleRepository.save(
        this.roleRepository.create({
          name: roleName,
          permissions: [],
        }),
      );
    }

    return role.id;
  }
}
