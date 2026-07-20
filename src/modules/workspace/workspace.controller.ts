import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
} from "@nestjs/common";
import { WorkspaceService } from "./workspace.service";
import {
  CreateInviteDto,
  CreateWorkspaceDto,
  UpdateMemberRoleDto,
} from "./dto/create-workspace.dto";
import { UpdateWorkspaceDto } from "./dto/update-workspace.dto";
import { ApiTags } from "@nestjs/swagger";
import { RbacGuard } from "../rbac/guards/rbac.guard";
import { Permissions } from "src/common/decorators/permission.decorator";

@Controller("workspace")
@ApiTags("Workspace")
@UseGuards(RbacGuard)
export class WorkspaceController {
  constructor(private readonly workspaceService: WorkspaceService) {}

  @Post()
  @Permissions("create:workspace")
  async create(@Body() createWorkspaceDto: CreateWorkspaceDto) {
    return this.workspaceService.create(createWorkspaceDto);
  }

  @Get()
  @Permissions("read:workspace")
  async findAll() {
    return this.workspaceService.findAll();
  }

  @Get(":id")
  @Permissions("read:workspace")
  async findOne(@Param("id") id: string) {
    return this.workspaceService.findOne(+id);
  }

  @Patch(":id")
  @Permissions("update:workspace")
  async update(
    @Param("id") id: string,
    @Body() updateWorkspaceDto: UpdateWorkspaceDto,
  ) {
    return this.workspaceService.update(+id, updateWorkspaceDto);
  }

  @Delete(":id")
  @Permissions("delete:workspace")
  async remove(@Param("id") id: string) {
    return this.workspaceService.remove(+id);
  }

  @Post(":id/invite")
  // @Permissions("invite:workspace")
  async invite(
    @Param("id") id: string,
    @Body() createInviteDto: CreateInviteDto,
  ) {
    return this.workspaceService.invite(+id, createInviteDto);
  }
}
