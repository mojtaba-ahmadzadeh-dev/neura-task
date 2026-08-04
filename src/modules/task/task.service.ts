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
import { InjectRedis } from "@nestjs-modules/ioredis";
import Redis from "ioredis";

@Injectable()
export class TaskService {
  private readonly CACHE_KEY = "tasks:all";
  private readonly CACHE_TTL = 60;

  constructor(
    @InjectRepository(TaskEntity)
    private readonly taskRepository: Repository<TaskEntity>,
    @InjectRepository(UserEntity)
    private readonly userRepository: Repository<UserEntity>,
    @InjectRedis() private readonly redis: Redis,
  ) {}

  async create(createTaskDto: CreateTaskDto) {
    const { title, description, dueDate, priority, status } = createTaskDto;

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

    await this.redis.del(this.CACHE_KEY);

    return {
      message: TaskMessage.TASK_CREATED_SUCCESSFULLY,
      data: savedTask,
    };
  }
  async findAll() {
    const cached = await this.redis.get(this.CACHE_KEY);

    if (cached) {
      return JSON.parse(cached);
    }

    const tasks = await this.taskRepository.find({
      order: { createdAt: "DESC" },
    });

    await this.redis.set(
      this.CACHE_KEY,
      JSON.stringify(tasks),
      "EX",
      this.CACHE_TTL,
    );

    return tasks;
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

    const updatedTask = await this.taskRepository.save(task);

    await this.redis.del(this.CACHE_KEY);

    return {
      message: TaskMessage.TASK_UPDATED_SUCCESSFULLY,
      data: updatedTask,
    };
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
  async remove(id: number) {
    const task = await this.findOne(id);

    await this.taskRepository.remove(task);

    await this.redis.del(this.CACHE_KEY);

    return {
      message: TaskMessage.TASK_DELETED_SUCCESSFULLY,
    };
  }
}
