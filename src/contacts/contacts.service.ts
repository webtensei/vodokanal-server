import { Injectable } from '@nestjs/common';
import { JwtPayload } from '@auth/interfaces';
import { PrismaService } from '@prisma/prisma.service';
import { UserService } from '@user/user.service';
import { UpdateUserContactsDto } from './dto/update-contacts.dto';

@Injectable()
export class ContactsService {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly userService: UserService,
  ) {}

  async updateContacts(contacts: UpdateUserContactsDto, currentUser: JwtPayload) {
    const existsUser = await this.userService.checkUserCredentials(
      {
        username: contacts.username,
        password: contacts.password,
      },
      currentUser,
    );

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
}
