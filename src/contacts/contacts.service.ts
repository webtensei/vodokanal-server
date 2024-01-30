import { BadRequestException, ConflictException, ForbiddenException, HttpStatus, Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtPayload } from '@auth/interfaces';
import { PrismaService } from '@prisma/prisma.service';
import { UpdateUserContactsDto } from './dto/update-contacts.dto';
import { CreateContactsDto } from './dto/create-contacts.dto';
import { Role } from '@prisma/client';
import { compareSync } from 'bcrypt';

@Injectable()
export class ContactsService {
  constructor(private readonly prismaService: PrismaService) {}

  async create(userContacts: CreateContactsDto) {
    try {
      return this.prismaService.contact.create({
        data: {
          phone: userContacts.phone,
          email: userContacts.email,
          user: { connect: { username: +userContacts.username } },
        },
      });
    } catch (error) {
      console.error('Error creating contacts:', error);
      throw new ConflictException('Не удалось создать контактные данные.');
    }
  }

  // USER PASSWORD CHECK FAILS
  async updateContacts(contacts: UpdateUserContactsDto, currentUser: JwtPayload) {
    const isAdmin = currentUser.role.includes(Role.ADMIN || Role.OWNER);

    if (currentUser.username !== contacts.username && !isAdmin) {
      throw new ForbiddenException();
    }

    if (!isAdmin && !contacts.password) {
      throw new BadRequestException('Пароль не предоставлен');
    }

    const existsUser = await this.prismaService.user.findFirst({
      where: { username: contacts.username },
      include: { contacts: true },
    });

    const isPasswordEquals = compareSync(contacts.password, existsUser.password);

    if (!existsUser || (isAdmin ? false : !isPasswordEquals)) {
      throw new UnauthorizedException('Неверный логин или пароль.');
    }
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

  async delete(username: number) {
    return this.prismaService.contact.delete({ where: { username } });
  }

  verify(currentUser: JwtPayload, type: 'email' | 'phone') {
    if (type === 'email') {
      return { status: HttpStatus.OK, message: 'Ссылка успешно оптправлена' };
    }
  }
}
