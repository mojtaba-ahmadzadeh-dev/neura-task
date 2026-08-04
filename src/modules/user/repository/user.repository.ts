import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserEntity } from '../entity/user.entity';

@Injectable()
export class UserRepository {
  constructor(
    @InjectRepository(UserEntity)
    private readonly repository: Repository<UserEntity>,
  ) {}

  async findUserWithPermissions(userId: number) {
    console.log(userId);

    return this.repository.findOne({
      where: {
        id: userId,
      },
      relations: {
        role: {
          permissions: true,
        },
      },
    });
  }
}
