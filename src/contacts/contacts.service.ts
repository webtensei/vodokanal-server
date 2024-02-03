import { BadRequestException, ConflictException, ForbiddenException, HttpStatus, Inject, Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtPayload } from '@auth/interfaces';
import { PrismaService } from '@prisma/prisma.service';
import { UpdateUserContactsDto } from './dto/update-contacts.dto';
import { CreateContactsDto } from './dto/create-contacts.dto';
import { Role } from '@prisma/client';
import { compareSync } from 'bcrypt';
import { MailService } from '../mail/mail.service';
import { v4 } from 'uuid';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';
import * as process from 'process';

@Injectable()
export class ContactsService {
  constructor(
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
    private readonly prismaService: PrismaService,
    private readonly mailService: MailService,
  ) {}

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

  async createVerification(currentUser: JwtPayload, type: 'email' | 'phone') {
    const contacts = await this.prismaService.contact.findUnique({ where: { username: currentUser.username } });

    if (type === 'email') {
      const activationCode = v4();

      const existingActivationCode = await this.cacheManager.get(contacts.email);
      if (existingActivationCode) {
        await this.cacheManager.del(contacts.email);
      }
      await this.cacheManager.set(contacts.email, activationCode, 60 * 60 * 24);

      await this.mailService.sendActivationMail(
        contacts.email,
        process.env.API_URL + `/cabinet/verify/${contacts.username}&type=${type}&code=${activationCode}`,
      );
      console.log(await this.cacheManager.get(contacts.email));

      return { status: HttpStatus.OK, message: 'Ссылка успешно отправлена' };
    }
  }

  // TODO: тут я получаю вытащенный из запроса хуйню и уже провожу верификацию (меняю записи в бд) и редерект чтоли надо сделать, хз
  async verify(username: string, code: string, type: 'phone' | 'email') {
    const foundedUser = await this.prismaService.contact.findUnique({ where: { username: +username } });

    const isActivated = type + '_activated';
    if (foundedUser[isActivated]) throw new ConflictException('Ваши данные уже подтверждены');

    const cachedValue = await this.cacheManager.get(foundedUser[type]);

    if (!cachedValue) throw new BadRequestException(`Запросите новый код/сообщение.`);

    if (code !== cachedValue) throw new BadRequestException(`Неверный код`);

    await this.prismaService.contact.update({
      where: { username: foundedUser.username },
      data: { email_activated: true, email_activated_at: new Date() },
    });

    await this.cacheManager.del(foundedUser[type]);

    return { status: HttpStatus.OK, message: 'Успешное подтверждение' };
  }
}
