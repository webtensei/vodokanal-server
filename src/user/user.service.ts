import { BadRequestException, ConflictException, ForbiddenException, Inject, Injectable, UnauthorizedException } from '@nestjs/common';
import { PrismaService } from '@prisma/prisma.service';
import { Role } from '@prisma/client';
import { compareSync, genSaltSync, hashSync } from 'bcrypt';
import { CreateUserDto } from '@user/dto/create-user.dto';
import { JwtPayload } from '@auth/interfaces';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';
import { ComplexUserResponse } from '@user/responses';
import { ConfigService } from '@nestjs/config';
import { convertToSecondsUtil } from '@shared/utils';

@Injectable()
export class UserService {
  constructor(
    private readonly prismaService: PrismaService,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
    private readonly configService: ConfigService,
  ) {}

  async create(user: CreateUserDto) {
    try {
      const hashedPassword = this.hashPassword(user.password);

      return this.prismaService.user.create({
        data: {
          username: user.username,
          password: hashedPassword,
          name: user.name,
          surname: user.surname,
          patronymic: user.patronymic || null,
          role: user.role || 'USER',
        },
      });
    } catch (error) {
      console.error('Error creating user:', error);
      throw new ConflictException('Пользователь с таким логином уже существует.');
    }
  }

  findOne(username: number, currentUser: JwtPayload) {
    return this.checkUserCredentials({ username }, currentUser, true);
  }

  // be aware, check old commits
  async find(username: number, isReset: boolean = false) {
    if (isReset) {
      await this.cacheManager.del(String(username));
    }
    const user = await this.cacheManager.get<ComplexUserResponse>(String(username));
    if (!user) {
      const user = await this.prismaService.user.findFirst({
        where: {
          username: username,
        },
        include: {
          contacts: true,
          addresses: true,
          preferred_settings: true,
          login_histories: true,
        },
      });
      if (!user) {
        return null;
      }
      await this.cacheManager.set(String(username), user, convertToSecondsUtil(this.configService.get('JWT_EXPIRE')));
      return user;
    }
    return user;
  }

  async findAll() {
    return this.prismaService.user.findMany({
      include: {
        contacts: true,
        addresses: true,
        preferred_settings: true,
      },
    });
  }

  async delete(username: number) {
    const user = this.prismaService.user.delete({
      where: { username },
      select: { username: true },
    });

    if (!user) {
      throw new BadRequestException('Неверный логин пользователя.');
    }

    return user;
  }

  // НУЖНО YDALIT`
  async checkUserCredentials(
    credentials: {
      username: number;
      password?: string;
    },
    currentUser: JwtPayload,
    withoutPassword: boolean = false,
  ) {
    const isAdmin = currentUser.role.includes(Role.ADMIN || Role.OWNER);

    if (currentUser.username !== credentials.username && !isAdmin) {
      throw new ForbiddenException();
    }

    const user = await this.find(credentials.username);

    const isPasswordEquals = withoutPassword || (!!credentials.password && compareSync(credentials.password, user.password));

    if (!user || (isAdmin ? false : !isPasswordEquals)) {
      throw new UnauthorizedException('Неверный логин или пароль.');
    }

    return user;
  }

  private hashPassword(password: string) {
    return hashSync(password, genSaltSync(10));
  }
}
