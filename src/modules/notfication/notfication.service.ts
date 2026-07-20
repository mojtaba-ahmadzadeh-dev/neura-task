import { Injectable } from '@nestjs/common';
import { CreateNotficationDto } from './dto/create-notfication.dto';
import { UpdateNotficationDto } from './dto/update-notfication.dto';

@Injectable()
export class NotficationService {
  create(createNotficationDto: CreateNotficationDto) {
   
  }
}
