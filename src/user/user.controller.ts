import {
  Body,
  ClassSerializerInterceptor,
  Controller,
  Delete,
  ForbiddenException,
  Get,
  HttpStatus,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { UserService } from '@user/user.service';
import { ComplexUserResponse, UserResponse } from '@user/responses';
import { CurrentUser, Roles } from '@shared/decorators';
import { JwtPayload } from '@auth/interfaces';
import { CreateUserDto } from '@user/dto/create-user.dto';
import { RolesGuard } from '@auth/guards/role.guard';
import { Role, Token } from '@prisma/client';
import { PrismaService } from '@prisma/prisma.service';
import { ChangePasswordDto } from '@user/dto/change-password.dto';

@Controller('user')
export class UserController {
  constructor(
    private readonly userService: UserService,
    private readonly prismaService: PrismaService,
  ) {}

  @Patch(':username/change/password')
  async changePass(@Body() dto: ChangePasswordDto, @CurrentUser() currentUser: JwtPayload) {
    const devices = await this.userService.changePassword(dto, currentUser);
    return HttpStatus.OK;
  }

  @UseInterceptors(ClassSerializerInterceptor)
  @Post()
  async createUser(@Body() dto: CreateUserDto) {
    const user = await this.userService.create(dto);
    return new UserResponse(user);
  }

  @UseInterceptors(ClassSerializerInterceptor)
  @Get(':username')
  async findOneUser(@Param('username', ParseIntPipe) username: number, @CurrentUser() currentUser: JwtPayload) {
    if (currentUser.username !== username) throw new ForbiddenException();
    const user = await this.userService.find(username);
    return new UserResponse(user);
  }

  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN || Role.OWNER)
  @UseInterceptors(ClassSerializerInterceptor)
  @Get()
  async findAllUsers() {
    const users = await this.userService.findAll();
    return users.map((user) => new ComplexUserResponse(user));
  }

  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN || Role.OWNER)
  @Delete(':username')
  async deleteUser(@Param('username', ParseIntPipe) username: number) {
    return this.userService.delete(username);
  }
}
