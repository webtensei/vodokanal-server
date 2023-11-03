import { Injectable } from '@nestjs/common';
import { PrismaService } from '@prisma/prisma.service';
import { User } from '@prisma/client';
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

  delete(username: number) {
    return this.prismaService.user.delete({
      where: {
        username: username,
      },
    });
  }

  private hashPassword(password: string) {
    return hashSync(password, genSaltSync(10));
  }
}
