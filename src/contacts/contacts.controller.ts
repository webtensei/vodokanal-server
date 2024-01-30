import { Body, Controller, Get, HttpStatus, Post, Put } from '@nestjs/common';
import { ContactsService } from './contacts.service';
import { CurrentUser } from '@shared/decorators';
import { JwtPayload } from '@auth/interfaces';
import { UpdateUserContactsDto } from './dto/update-contacts.dto';
import { MailService } from '../mail/mail.service';

@Controller('contacts')
export class ContactsController {
  constructor(
    private readonly contactsService: ContactsService,
    private readonly mailService: MailService,
  ) {}

  @Put()
  async updateUserContacts(@Body() dto: UpdateUserContactsDto, @CurrentUser() currentUser: JwtPayload) {
    return this.contactsService.updateContacts(dto, currentUser);
  }

  @Get('verifyEmail')
  async verifyEmail(@CurrentUser() currentUser: JwtPayload) {
    console.log(currentUser);
    await this.mailService.sendActivationMail('webtensei@gmail.com', 'haha');
    return this.contactsService.verify(currentUser, 'email');
  }
}
