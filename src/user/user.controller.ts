import { Body, ClassSerializerInterceptor, Controller, Delete, Get, Param, ParseIntPipe, Post, Put, UseInterceptors } from '@nestjs/common';
import { UserService } from '@user/user.service';
import { ComplexUserResponse, UserResponse } from '@user/responses';
import { Public } from '@shared/decorators';
import { UpdateUserContactsDto } from '@user/dto/update-user-contacts.dto';

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @UseInterceptors(ClassSerializerInterceptor)
  @Post()
  async createUser(@Body() dto) {
    const user = await this.userService.create(dto);
    return new UserResponse(user);
  }

  @Public()
  @UseInterceptors(ClassSerializerInterceptor)
  @Get()
  async findAllUsers() {
    const users = await this.userService.findAll();
    return users.map((user) => new ComplexUserResponse(user));
  }

  @UseInterceptors(ClassSerializerInterceptor)
  @Get(':username')
  async findOneUser(@Param('username', ParseIntPipe) username: number) {
    const user = await this.userService.findOne(username);
    return new UserResponse(user);
  }

  @Put('/contacts')
  async updateUserContacts(@Body() dto: UpdateUserContactsDto) {
    return this.userService.updateContacts(dto);
  }

  @Delete(':username')
  async deleteUser(@Param('username', ParseIntPipe) username: number) {
    return this.userService.delete(+username);
  }
}
