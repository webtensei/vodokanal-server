import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Post,
} from '@nestjs/common';
import { UserService } from '@user/user.service';

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post()
  createUser(@Body() dto) {
    return this.userService.create(dto);
  }

  @Get(':username')
  findOneUser(@Param('username', ParseIntPipe) username: number) {
    return this.userService.findOne(username);
  }

  @Delete(':username')
  deleteUser(@Param('username', ParseIntPipe) username: number) {
    return this.userService.delete(username);
  }
}
