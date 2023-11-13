import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { CreateContactDto } from './dto/create-contact.dto';
import { UpdateContactDto } from './dto/update-contact.dto';
import { PrismaService } from '@prisma/prisma.service';
import { Public } from '@shared/decorators';

@Injectable()
export class ContactService {
  constructor(private readonly prismaService: PrismaService) {}

  @Public()
  async create(contact: Partial<CreateContactDto>) {
    const data = await this.prismaService.contact.create({
      data: {
        email: contact.email,
        phone: contact.phone,
        email_activation_code: null,
        phone_activation_code: null,
        phone_activated_at: null,
        email_activated_at: null,
        user: { connect: { username: +contact.username } },
      },
    });
    return data;
  }

  findOne(username: number) {
    return this.prismaService.contact.findFirst({
      where: {
        username,
      },
    });
  }

  async update(username: number, updateContactDto: UpdateContactDto) {
    const existingContact = await this.prismaService.contact.findUnique({
      where: { username },
    });

    if (!existingContact) {
      throw new NotFoundException(`Контакты пользователя ${username} не найдены. Посмотрите, существует ли пользователь.`);
    }
    if (updateContactDto.email && updateContactDto.email === existingContact.email) {
      throw new ConflictException('Введенная почта является актуальной для аккаунта');
    }
    if (updateContactDto.phone && updateContactDto.phone === existingContact.phone) {
      throw new ConflictException('Введенный номер телефона является актуальным для аккаунта');
    }

    if (updateContactDto.email) {
      existingContact.email = updateContactDto.email;
      existingContact.email_activated_at = null;
      existingContact.email_activated = false;
      existingContact.email_activation_code = null;
    }

    if (updateContactDto.phone) {
      existingContact.phone = updateContactDto.phone;
      existingContact.phone_activated_at = null;
      existingContact.phone_activated = false;
      existingContact.phone_activation_code = null;
    }

    return this.prismaService.contact.update({
      where: { username },
      data: existingContact,
    });
  }

  remove(username: number) {
    return this.prismaService.contact.delete({ where: { username } });
  }
}
