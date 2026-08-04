import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Query,
  ParseIntPipe,
} from '@nestjs/common';
import { CreateAutomationDto, FilterAutomationDto } from './dto/create-automation.dto';
import { UpdateAutomationDto } from './dto/update-automation.dto';
import { RbacGuard } from '../rbac/guards/rbac.guard';
import { Pagination } from 'src/common/decorators/pagination.decorator';
import { AutomationService } from './service/automation.service';

@Controller('automation')
@UseGuards(RbacGuard)
export class AutomationController {
  constructor(private readonly automationService: AutomationService) {}

  @Post('/create')
  create(@Body() createAutomationDto: CreateAutomationDto) {
    return this.automationService.create(createAutomationDto);
  }

  @Get('/all')
  @Pagination()
  findAll(@Query() filterDto: FilterAutomationDto) {
    return this.automationService.findAll(filterDto);
  }

  @Get('/:id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.automationService.findOne(id);
  }

  @Patch('/:id/update')
  update(@Param('id', ParseIntPipe) id: number, @Body() updateAutomationDto: UpdateAutomationDto) {
    return this.automationService.update(id, updateAutomationDto);
  }

  @Delete('/:id/remove')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.automationService.remove(id);
  }
}
