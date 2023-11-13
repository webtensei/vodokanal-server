import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateContactDto } from './dto/create-contact.dto';
import { UpdateContactDto } from './dto/update-contact.dto';
import { PrismaService } from '@prisma/prisma.service';

@Injectable()
export class ContactService {
  constructor(private readonly prismaService: PrismaService) {}

  create(contact: Partial<CreateContactDto>) {
    return this.prismaService.contact.create({
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
      throw new NotFoundException(
        `Контакты пользователя ${username} не найдены. Посмотрите, существует ли пользователь.`,
      );
    }

    if (updateContactDto.email) {
      existingContact.email = updateContactDto.email;
    }

    if (updateContactDto.phone) {
      existingContact.phone = updateContactDto.phone;
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
