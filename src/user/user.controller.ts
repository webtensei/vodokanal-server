import { Body, ClassSerializerInterceptor, Controller, Delete, Get, Param, ParseIntPipe, Post, Put, UseInterceptors } from '@nestjs/common';
import { UserService } from '@user/user.service';
import { ComplexUserResponse, UserResponse } from '@user/responses';
import { CurrentUser, Public } from '@shared/decorators';
import { UpdateUserContactsDto } from '@user/dto/update-user-contacts.dto';
import { JwtPayload } from '@auth/interfaces';
import { CreateUserDto } from '@user/dto/create-user.dto';

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @UseInterceptors(ClassSerializerInterceptor)
  @Post()
  async createUser(@Body() dto: CreateUserDto) {
    const user = await this.userService.create(dto);
    return new UserResponse(user);
  }

  // unsafe get user by role guard
  @Public()
  @UseInterceptors(ClassSerializerInterceptor)
  @Get()
  async findAllUsers() {
    const users = await this.userService.findAll();
    return users.map((user) => new ComplexUserResponse(user));
  }

  //unsafe
  @UseInterceptors(ClassSerializerInterceptor)
  @Get(':username')
  async findOneUser(@Param('username', ParseIntPipe) username: number) {
    const user = await this.userService.findOne(username);
    return new UserResponse(user);
  }

  // to new resource
  @Put('/contacts')
  async updateUserContacts(@Body() dto: UpdateUserContactsDto, @CurrentUser() currentUser: JwtPayload) {
    return this.userService.updateContacts(dto, currentUser);
  }

  @Delete(':username')
  async deleteUser(@Param('username', ParseIntPipe) username: number, @CurrentUser() currentUser: JwtPayload) {
    return this.userService.delete(username, currentUser);
  }
}
