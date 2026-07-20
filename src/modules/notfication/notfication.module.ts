import { Module } from '@nestjs/common';
import { NotficationService } from './notfication.service';
import { NotficationController } from './notfication.controller';

@Module({
  controllers: [NotficationController],
  providers: [NotficationService],
})
export class NotficationModule {}
