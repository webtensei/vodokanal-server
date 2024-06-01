import { BadRequestException, ConflictException, ForbiddenException, HttpStatus, Inject, Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtPayload } from '@auth/interfaces';
import { PrismaService } from '@prisma/prisma.service';
import { UpdateUserContactsDto } from './dto/update-contacts.dto';
import { CreateContactsDto } from './dto/create-contacts.dto';
import { Contact, Role } from '@prisma/client';
import { compareSync } from 'bcrypt';
import { MailService } from '../mail/mail.service';
import { v4 } from 'uuid';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';
import * as process from 'process';
import axios from 'axios';
import { Response } from 'express';

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
      return this.createEmailVerify(contacts, type);
    }
    if (type === 'phone') {
      return this.createPhoneVerify(contacts, type);
    }
    throw new BadRequestException('Неожиданная ошибка');
  }

  async verify(username: string, code: string, type: 'phone' | 'email', res: Response) {
    const foundedUser = await this.prismaService.contact.findUnique({ where: { username: +username } });

    const isActivated = type + '_activated';
    if (foundedUser[isActivated]) throw new ConflictException('Ваши данные уже подтверждены');

    const cachedValue = await this.cacheManager.get(foundedUser[type]);

    if (!cachedValue) throw new BadRequestException(`Запросите новый код/сообщение.`);

    if (code !== cachedValue) throw new BadRequestException(`Неверный код`);

    await this.prismaService.contact.update({
      where: { username: foundedUser.username },
      data:
        type === 'phone'
          ? { phone_activated: true, phone_activated_at: new Date() }
          : {
              email_activated: true,
              email_activated_at: new Date(),
            },
    });

    await this.cacheManager.del(foundedUser[type]);
    if (type === 'email') res.redirect(`${process.env.CLIENT_URL}`);
    return { status: HttpStatus.OK, message: 'Успешное подтверждение' };
  }

  private async createEmailVerify(contacts: Contact, type: 'email' | 'phone') {
    const activationCode = v4();

    const existingActivationCode = await this.cacheManager.get(contacts.email);
    if (existingActivationCode) {
      await this.cacheManager.del(contacts.email);
    }
    await this.cacheManager.set(contacts.email, activationCode, 60 * 60 * 24);

    await this.mailService.sendActivationMail(
      contacts.email,
      process.env.API_URL + `/contacts/verify/${contacts.username}?type=${type}&code=${activationCode}`,
    );

    return { status: HttpStatus.OK, message: 'Ссылка успешно отправлена' };
  }

  private async createPhoneVerify(contacts: Contact, type: 'email' | 'phone') {
    const formdata = new FormData();
    formdata.append('public_key', process.env.ZVONOK_COM_PUBLIC_API);
    formdata.append('phone', `${contacts.phone}`);
    formdata.append('campaign_id', process.env.ZVONOK_COM_VERIFY_CAMPAIGN);

    const config = {
      method: 'post',
      url: 'https://zvonok.com/manager/cabapi_external/api/v1/phones/flashcall/',
      data: formdata,
    };
    const response = await axios(config)
      .then(async function (response) {
        return response.data;
      })
      .catch(function (error) {
        console.log(error);
        throw new BadRequestException(`Ошибка:${error.response.data.data}.`);
      });
    console.log(response);
    if (response.status !== 'ok') throw new BadRequestException('Не удалось создать звонок');
    const existingActivationCode = await this.cacheManager.get(contacts.phone);
    if (existingActivationCode) {
      await this.cacheManager.del(contacts.phone);
    }
    await this.cacheManager.set(contacts.phone, response.data.pincode, 60 * 60 * 24);
    return { status: HttpStatus.OK, message: 'Код успешно создан' };
  }
}
