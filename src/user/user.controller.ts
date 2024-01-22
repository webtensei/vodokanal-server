import {
  Body,
  ClassSerializerInterceptor,
  ConflictException,
  Controller,
  Delete,
  Get,
  HttpStatus,
  Param,
  ParseIntPipe,
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
import { DevicesResponse } from '@user/responses/devices.response';
import { ChangePasswordDto } from '@user/dto/change-password.dto';

@Controller('user')
export class UserController {
  constructor(
    private readonly userService: UserService,
    private readonly prismaService: PrismaService,
  ) {}

  @UseInterceptors(ClassSerializerInterceptor)
  @Get('authenticatedDevices')
  async devices(@CurrentUser() currentUser: JwtPayload) {
    const devices = await this.prismaService.token.findMany({ where: { username: +currentUser.username } });
    return devices.map((device) => new DevicesResponse(device));
  }

  @Post('changepassword')
  async changePass(@Body() dto: ChangePasswordDto, @CurrentUser() currentUser: JwtPayload) {
    const devices = await this.userService.changePassword(dto, currentUser);
    return HttpStatus.OK;
  }

  @Post('unauthenticateDevice')
  async unauthDevice(@Body() dto: Partial<Token>, @CurrentUser() currentUser: JwtPayload) {
    try {
      const foundedSession = await this.prismaService.token.findFirst({
        where: {
          user_agent: dto.user_agent,
          expired_in: dto.expired_in,
          username: currentUser.username,
        },
      });
      await this.prismaService.token.delete({ where: { token: foundedSession.token } });
    } catch (e) {
      throw new ConflictException('Сессия не была найдена/удалена');
    }
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
    const user = await this.userService.findOne(username, currentUser);
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
