import { BadRequestException, Injectable } from '@nestjs/common';
import { PrismaService } from '@prisma/prisma.service';
import { Prisma, User } from '@prisma/client';
import { genSaltSync, hashSync } from 'bcrypt';

@Injectable()
export class UserService {
  constructor(private readonly prismaService: PrismaService) {}

  create(user: Partial<User>) {
    const hashedPassword = this.hashPassword(user.password);
    return this.prismaService.user.create({
      data: {
        username: user.username,
        password: hashedPassword,
        name: user.name,
        surname: user.surname,
        patronymic: user.patronymic || null,
        role: user.role || 'VISITOR',
      },
    });
  }

  findAll() {}

  findOne(username: number) {
    return this.prismaService.user.findFirst({
      where: {
        username: username,
      },
    });
  }

  async delete(username: number) {
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

  private hashPassword(password: string) {
    return hashSync(password, genSaltSync(10));
  }
}
