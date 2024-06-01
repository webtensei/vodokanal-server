import { Body, Controller, Get, Param, Put, Res } from '@nestjs/common';
import { ContactsService } from './contacts.service';
import { CurrentUser } from '@shared/decorators';
import { JwtPayload } from '@auth/interfaces';
import { UpdateUserContactsDto } from './dto/update-contacts.dto';
import { Public } from '@shared/decorators';
import { Response } from 'express';

@Public()
@Controller('contacts')
export class ContactsController {
  constructor(private readonly contactsService: ContactsService) {}

  @Put()
  async updateUserContacts(@Body() dto: UpdateUserContactsDto, @CurrentUser() currentUser: JwtPayload) {
    return this.contactsService.updateContacts(dto, currentUser);
  }

  @Get('verify/email')
  async verifyEmail(@CurrentUser() currentUser: JwtPayload) {
    return this.contactsService.createVerification(currentUser, 'email');
  }

  @Get('verify/phone')
  async verifyPhone(@CurrentUser() currentUser: JwtPayload) {
    return this.contactsService.createVerification(currentUser, 'phone');
  }

  @Public()
  @Get('/verify/:username?type=:type&code=:code')
  async confirmEmail(@Param('username') username: string, @Param('code') code: string, @Param('type') type: 'email' | 'phone', @Res() res: Response) {
    return this.contactsService.verify(username, code, type, res);
  }
}
