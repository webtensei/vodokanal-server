import { BadRequestException, ForbiddenException, Injectable, Logger, UnauthorizedException } from '@nestjs/common';
import { PrismaService } from '@prisma/prisma.service';
import { Prisma, Role } from '@prisma/client';
import { compareSync, genSaltSync, hashSync } from 'bcrypt';
import { CreateUserDto } from '@user/dto/create-user.dto';
import { UpdateUserContactsDto } from '@user/dto/update-user-contacts.dto';
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

  findOne(username: number) {
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

  async findAll() {
    return this.prismaService.user.findMany({
      include: {
        contacts: true,
        addresses: true,
        preferred_settings: true,
      },
    });
  }

  async updateContacts(contacts: UpdateUserContactsDto) {
    const existsUser = await this.checkUserCredentials(contacts.username, contacts.password);

    const newEmail = contacts.email !== existsUser.contacts.email;
    const newPhone = contacts.phone !== existsUser.contacts.phone;

    return this.prismaService.contact.update({
      where: { username: contacts.username },
      data: {
        email: contacts.email,
        phone: contacts.phone,
        email_activated: newEmail ? false : existsUser.contacts.email_activated,
        phone_activated: newPhone ? false : existsUser.contacts.phone_activated,
        email_activated_at: newEmail ? null : existsUser.contacts.email_activated_at,
        phone_activated_at: newPhone ? null : existsUser.contacts.phone_activated_at,
      },
    });
  }

  async delete(username: number, currentUser: JwtPayload) {
    if (currentUser.username !== username && !currentUser.role.includes(Role.ADMIN || Role.OWNER)) {
      throw new ForbiddenException();
    }
    const userExists = await this.prismaService.user.findFirst({
      where: { username },
    });

    if (!userExists) {
      throw new BadRequestException('Пользователь не был найден');
    }

    const modelsToDelete = ['contact', 'loginHistory', 'token', 'preferredSettings', 'address'];

    for (const model of modelsToDelete) {
      const modelName = model as keyof typeof Prisma;
      const records = await this.prismaService[modelName].findMany({
        where: { username },
      });

      if (records.length) {
        await this.prismaService[modelName].deleteMany({
          where: { username },
        });
      }
    }

    return this.prismaService.user.delete({
      where: { username },
      select: { username: true },
    });
  }

  async checkUserCredentials(username: number, password: string) {
    const user = await this.findOne(username).catch((err) => {
      this.logger.error(err);
      return null;
    });

    if (!user || !compareSync(password, user.password)) {
      throw new UnauthorizedException('Неверный логин или пароль.');
    }
    return user;
  }

  private hashPassword(password: string) {
    return hashSync(password, genSaltSync(10));
  }
}
