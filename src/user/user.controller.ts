import { Body, ClassSerializerInterceptor, Controller, Delete, Get, Param, ParseIntPipe, Post, UseInterceptors } from '@nestjs/common';
import { UserService } from '@user/user.service';
import { ComplexUserResponse, UserResponse } from '@user/responses';
import { CurrentUser } from '@shared/decorators';
import { JwtPayload } from '@auth/interfaces';
import { CreateUserDto } from '@user/dto/create-user.dto';
import { Role } from '@prisma/client';

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}
  // patched 28.12
  @UseInterceptors(ClassSerializerInterceptor)
  @Post()
  async createUser(@Body() dto: CreateUserDto) {
    const user = await this.userService.create(dto);
    return new UserResponse(user);
  }
  // patched 28.12
  @UseInterceptors(ClassSerializerInterceptor)
  @Get(':username')
  async findOneUser(@Param('username', ParseIntPipe) username: number, @CurrentUser() currentUser: JwtPayload) {
    const user = await this.userService.findOne(username, currentUser);
    return new UserResponse(user);
  }

  // patched 28.12
  @UseInterceptors(ClassSerializerInterceptor)
  @Get()
  async findAllUsers(@CurrentUser('role') userRole: Role) {
    const users = await this.userService.findAll(userRole);
    return users.map((user) => new ComplexUserResponse(user));
  }

  // patched 28.12
  @Delete(':username')
  async deleteUser(@Param('username', ParseIntPipe) username: number, @CurrentUser() currentUser: JwtPayload) {
    return this.userService.delete(username, currentUser);
  }
}
