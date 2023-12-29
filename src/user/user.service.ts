import { BadRequestException, ConflictException, ForbiddenException, Injectable, UnauthorizedException } from '@nestjs/common';
import { PrismaService } from '@prisma/prisma.service';
import { Role } from '@prisma/client';
import { compareSync, genSaltSync, hashSync } from 'bcrypt';
import { CreateUserDto } from '@user/dto/create-user.dto';
import { JwtPayload } from '@auth/interfaces';

@Injectable()
export class UserService {
  constructor(private readonly prismaService: PrismaService) {}

  // Partial<User>
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

  find(username: number) {
    const user = this.prismaService.user.findFirst({
      where: {
        username: username,
      },
      include: {
        contacts: true,
        addresses: true,
        preferred_settings: true,
      },
    });

    if (!user) {
      throw new BadRequestException('Неверный логин пользователя.');
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

  // НУЖНО СДЕЛАТЬ НОРМАЛЬНУЮ ТИПИЗАЦИЮ
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
