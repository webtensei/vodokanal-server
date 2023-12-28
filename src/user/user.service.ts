import { BadRequestException, ForbiddenException, Injectable, Logger, UnauthorizedException } from '@nestjs/common';
import { PrismaService } from '@prisma/prisma.service';
import { Role } from '@prisma/client';
import { compareSync, genSaltSync, hashSync } from 'bcrypt';
import { CreateUserDto } from '@user/dto/create-user.dto';
import { JwtPayload } from '@auth/interfaces';

@Injectable()
export class UserService {
  private readonly logger = new Logger(UserService.name);

  constructor(private readonly prismaService: PrismaService) {}

  // Partial<User>
  async create(user: CreateUserDto) {
    try {
      const hashedPassword = this.hashPassword(user.password);

      const createdUser = await this.prismaService.user.create({
        data: {
          username: user.username,
          password: hashedPassword,
          name: user.name,
          surname: user.surname,
          patronymic: user.patronymic || null,
          role: user.role || 'VISITOR',
        },
      });

      const createdContact = await this.prismaService.contact.create({
        data: {
          phone: user.phone,
          email: user.email,
          user: { connect: { username: +user.username } },
        },
      });

      return { ...createdUser, ...createdContact };
    } catch (error) {
      console.error('Error creating user or contact:', error);
      throw new BadRequestException('Пользователь уже существует');
    }
  }

  findOne(username: number, currentUser: JwtPayload) {
    return this.checkUserCredentials({ username }, currentUser, true);
  }

  find(username: number) {
    return this.prismaService.user.findFirst({
      where: {
        username: username,
      },
      include: {
        contacts: true,
        addresses: true,
        preferred_settings: true,
      },
    });
  }

  async findAll(userRole: Role) {
    if (!userRole.includes(Role.ADMIN || Role.OWNER)) {
      throw new ForbiddenException();
    }
    return this.prismaService.user.findMany({
      include: {
        contacts: true,
        addresses: true,
        preferred_settings: true,
      },
    });
  }

  async delete(username: number, currentUser: JwtPayload) {
    await this.checkUserCredentials({ username }, currentUser, true);

    return this.prismaService.user.delete({
      where: { username },
      select: { username: true },
    });
  }

  // НУЖНО СДЕЛАТЬ НОРМАЛЬНУЮ ТИПИЗАЦИЮ
  async checkUserCredentials(credentials: { username: number; password?: string }, currentUser: JwtPayload, withoutPassword: boolean = false) {
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
