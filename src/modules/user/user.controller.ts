import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Put,
  Query,
  Req,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from "@nestjs/common";
import { ApiConsumes, ApiTags } from "@nestjs/swagger";
import { UserService } from "./user.service";
import { RbacGuard } from "../rbac/guards/rbac.guard";
import { Permissions } from "src/common/decorators/permission.decorator";
import { UpdateUserDto, UpdateUserRoleDto } from "./dto/user.dto";
import { Pagination } from "src/common/decorators/pagination.decorator";
import { PaginationDto } from "src/common/dto/pagination.dto";
import { FileInterceptor } from "@nestjs/platform-express";

@Controller("user")
@ApiTags("User")
@UseGuards(RbacGuard)
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get("/all")
  @Pagination()
  @Permissions("read:users")
  async getAllUsers(@Query() paginationDto: PaginationDto) {
    return this.userService.getAllUsers(paginationDto);
  }

  @Get("/me")
  async getMe() {
    return this.userService.getMe();
  }

  @Get(":id")
  @Permissions("read:users")
  async getUserById(@Param("id") id: string) {
    return this.userService.getUserById(+id);
  }

  @Patch(":id/role")
  @Permissions("update:user-role")
  async changeRole(
    @Param("id") id: string,
    @Body() updateUserRoleDto: UpdateUserRoleDto,
  ) {
    return this.userService.changeRole(+id, updateUserRoleDto);
  }

  @Put()
  @ApiConsumes("multipart/form-data")
  @UseInterceptors(FileInterceptor("avatar"))
  async updateUser(
    @Body() updateUserDto: UpdateUserDto,
    @UploadedFile() avatar?: Express.Multer.File,
  ) {
    return this.userService.updateUser(updateUserDto, avatar);
  }
}
