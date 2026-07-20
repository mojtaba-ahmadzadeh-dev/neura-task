import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { NotficationService } from './notfication.service';
import { CreateNotficationDto } from './dto/create-notfication.dto';
import { UpdateNotficationDto } from './dto/update-notfication.dto';

@Controller('notfication')
export class NotficationController {
  constructor(private readonly notficationService: NotficationService) {}

  @Post()
  create(@Body() createNotficationDto: CreateNotficationDto) {
    return this.notficationService.create(createNotficationDto);
  }
}
