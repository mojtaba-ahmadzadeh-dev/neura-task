import {
  Controller,
  Get,
  Post,
  Body,
  Req,
  UseGuards,
  Patch,
  Param,
  Delete,
} from "@nestjs/common";
import { RbacService } from "./rbac.service";
import { CreateRbacDto, CreateRoleDto } from "./dto/create-rbac.dto";
import { ApiTags } from "@nestjs/swagger";
import { Permissions } from "src/common/decorators/permission.decorator";
import { PermissionsList } from "src/common/constants/permissions.constants";
import { RbacGuard } from "./guards/rbac.guard";

@Controller("rbac")
@ApiTags("RBAC")
@UseGuards(RbacGuard)
export class RbacController {
  constructor(private rbacService: RbacService) {}

  @Post("roles")
  @Permissions(PermissionsList.CREATE_ROLE)
  async createRole(@Body() dto: CreateRoleDto) {
    return this.rbacService.createRole(dto);
  }

  @Get("permissions")
  
  async getAllPermissions() {
    return this.rbacService.findAllPermissions();
  }

  @Get("roles")
  getAllRoles() {
    return this.rbacService.getAllRoles();
  }

  @Get("roles/:id")
  async getRoleById(@Param("id") id: number) {
    return this.rbacService.getRoleById(id);
  }

  @Post("roles/:roleId/permissions/:permissionId")
  async assignPermissionToRole(
    @Param("roleId") roleId: number,
    @Param("permissionId") permissionId: number,
  ) {
    return this.rbacService.assignPermissionToRole(roleId, permissionId);
  }

  @Post("permissions")
  @Permissions(PermissionsList.CREATE_PERMISSION)
  async createPermission(@Body() dto: CreateRbacDto) {
    return this.rbacService.createPermission(dto);
  }

  @Delete("role/:id")
  deleteRole(@Param("id") id: number) {
    return this.rbacService.deleteRole(id);
  }
}
