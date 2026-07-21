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

@Injectable()
export class TaskService {
  constructor(
    @InjectRepository(TaskEntity)
    private readonly taskRepository: Repository<TaskEntity>,
    @InjectRepository(UserEntity)
    private readonly userRepository: Repository<UserEntity>,
  ) {}

  async create(createTaskDto: CreateTaskDto) {
    const { title, description, dueDate, isCompleted, priority, status } =
      createTaskDto;

    const task = this.taskRepository.create({
      title,
      description,
      dueDate,
      isCompleted: isCompleted ?? false,
      priority,
      status,
    });

    return await this.taskRepository.save(task);
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
      throw new NotFoundException(`تسک با آیدی ${id} پیدا نشد`);
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

    // چک کردن وجود کاربر قبل از assign
    const userExists = await this.userRepository.findOne({
      where: { id: assigneeId },
    });

    if (!userExists) {
      throw new BadRequestException(`کاربر با آیدی ${assigneeId} وجود ندارد`);
    }

    task.assigneeId = assigneeId;
    return await this.taskRepository.save(task);
  }
}
