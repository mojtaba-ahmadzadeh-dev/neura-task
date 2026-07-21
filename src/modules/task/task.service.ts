import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { CreateTaskDto } from "./dto/create-task.dto";
import { UpdateTaskDto } from "./dto/update-task.dto";
import { InjectRepository } from "@nestjs/typeorm";
import { TaskEntity } from "./entities/task.entity";
import { Repository } from "typeorm";
import { UserEntity } from "../user/entity/user.entity";
import { AuthMessage, TaskMessage } from "src/common/enums/message.enum";

@Injectable()
export class TaskService {
  constructor(
    @InjectRepository(TaskEntity)
    private readonly taskRepository: Repository<TaskEntity>,
    @InjectRepository(UserEntity)
    private readonly userRepository: Repository<UserEntity>,
  ) {}

  async create(createTaskDto: CreateTaskDto) {
    const { title, description, dueDate, priority, status } =
      createTaskDto;

    if (!title || title.trim().length === 0) {
      throw new BadRequestException(TaskMessage.TASK_TITLE_REQUIRED);
    }

    const task = this.taskRepository.create({
      title,
      description,
      dueDate,
      priority,
      status,
    });

    const savedTask = await this.taskRepository.save(task);

    return {
      message: TaskMessage.TASK_CREATED_SUCCESSFULLY,
      data: savedTask,
    };
  }
  async findAll() {
    return await this.taskRepository.find({
      order: { createdAt: "DESC" },
    });
  }
  async findOne(id: number) {
    const task = await this.taskRepository.findOne({
      where: { id },
    });
    if (!task) {
      throw new NotFoundException(TaskMessage.TASK_NOT_FOUND);
    }
    return task;
  }
  async update(id: number, updateTaskDto: UpdateTaskDto) {
    const task = await this.findOne(id);
    Object.assign(task, updateTaskDto);
    return await this.taskRepository.save(task);
  }
  async assignTask(taskId: number, assigneeId: number) {
    const task = await this.findOne(taskId);

    const userExists = await this.userRepository.findOne({
      where: { id: assigneeId },
    });

    if (!userExists) {
      throw new BadRequestException(AuthMessage.USER_NOT_FOUND);
    }

    task.assigneeId = assigneeId;
    const updatedTask = await this.taskRepository.save(task);

    return {
      message: TaskMessage.TASK_ASSIGNED_SUCCESSFULLY,
      data: updatedTask,
    };
  }
}
