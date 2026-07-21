import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from "@nestjs/common";
import { TaskService } from "./task.service";
import { AssignTaskDto, CreateTaskDto } from "./dto/create-task.dto";
import { UpdateTaskDto } from "./dto/update-task.dto";
import { ApiConsumes } from "@nestjs/swagger";

@Controller("task")
export class TaskController {
  constructor(private readonly taskService: TaskService) {}

  @Post()
  create(@Body() createTaskDto: CreateTaskDto) {
    return this.taskService.create(createTaskDto);
  }

  @Get()
  findAll() {
    return this.taskService.findAll();
  }

  @Get(":id")
  async findOne(@Param("id") id: string) {
    return this.taskService.findOne(+id);
  }

  @Patch(":id")
  @ApiConsumes("application/x-www-form-urlencoded")
  async update(@Param("id") id: string, @Body() updateTaskDto: UpdateTaskDto) {
    return this.taskService.update(+id, updateTaskDto);
  }
  @Patch(":id/assign")
  async assign(
    @Param("id") id: string,
    @Body() assignTaskDto: AssignTaskDto, // ← تغییر مهم
  ) {
    return this.taskService.assignTask(+id, assignTaskDto.assigneeId);
  }
}
