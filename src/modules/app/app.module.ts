import { Module } from "@nestjs/common";
import { APP_GUARD } from "@nestjs/core";
import { AppController } from "./app.controller";
import { AppService } from "./app.service";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { join } from "path";
import { TypeOrmModule } from "@nestjs/typeorm";
import { TypeOrmConfig } from "src/config/typeorm.config";
import { AuthModule } from "../auth/auth.module";
import { UserModule } from "../user/user.module";
import { RbacModule } from "../rbac/rbac.module";
import { WorkspaceModule } from "../workspace/workspace.module";
import { TaskModule } from "../task/task.module";
import { ProjectsModule } from "../projects/projects.module";
import { CommentModule } from "../comment/comment.module";
import { AttachmentModule } from "../attachment/attachment.module";
import { AutomationModule } from "../automation/automation.module";
import { ScheduleModule } from "@nestjs/schedule";
import { NotficationModule } from "../notfication/notfication.module";
import { RedisModule } from "@nestjs-modules/ioredis";
import { RedisConfig } from "src/config/redis.config";
import { ThrottlerModule, ThrottlerGuard } from "@nestjs/throttler";
import { ThrottlerStorageRedisService } from "@nest-lab/throttler-storage-redis";
import Redis from "ioredis";

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: join(process.cwd(), ".env"),
    }),
    RedisModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => RedisConfig(configService),
    }),
    ThrottlerModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        throttlers: [
          {
            name: "default",
            ttl: 60_000,
            limit: 60,
          },
        ],
        storage: new ThrottlerStorageRedisService(
          new Redis({
            host: configService.get<string>("REDIS_HOST", "localhost"),
            port: configService.get<number>("REDIS_PORT", 6379),
            password: configService.get<string>("REDIS_PASSWORD") || undefined,
            db: configService.get<number>("REDIS_DB", 0),
          }),
        ),
      }),
    }),

    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) =>
        TypeOrmConfig(configService),
    }),
    ScheduleModule.forRoot(),
    AuthModule,
    RbacModule,
    UserModule,
    WorkspaceModule,
    TaskModule,
    ProjectsModule,
    CommentModule,
    AttachmentModule,
    AutomationModule,
    NotficationModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
})
export class AppModule {}
