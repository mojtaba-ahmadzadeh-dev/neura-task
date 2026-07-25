import { Module } from "@nestjs/common";
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

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: join(process.cwd(), ".env"),
    }),

    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) =>
        TypeOrmConfig(configService),
    }),
    AuthModule,
    RbacModule,
    UserModule,
    WorkspaceModule,
    TaskModule,
    ProjectsModule,
    CommentModule,
    AttachmentModule
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
