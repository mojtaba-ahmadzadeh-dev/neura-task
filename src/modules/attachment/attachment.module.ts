import { Module } from '@nestjs/common';
import { AttachmentService } from './attachment.service';
import { AttachmentController } from './attachment.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AttachmentEntity } from './entities/attachment.entity';
import { JwtService } from '@nestjs/jwt';
import { UserRepository } from '../user/repository/user.repository';
import { S3Service } from '../s3/s3.service';
import { UserEntity } from '../user/entity/user.entity';

@Module({
  imports: [TypeOrmModule.forFeature([AttachmentEntity, UserEntity])],
  controllers: [AttachmentController],
  providers: [AttachmentService, JwtService, UserRepository, S3Service],
})
export class AttachmentModule {}
