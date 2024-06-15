import { Body, Controller, Get, Param, Put, Query, Res } from '@nestjs/common';
import { ContactsService } from './contacts.service';
import { CurrentUser } from '@shared/decorators';
import { JwtPayload } from '@auth/interfaces';
import { UpdateUserContactsDto } from './dto/update-contacts.dto';
import { Public } from '@shared/decorators';
import { Response } from 'express';

@Controller('contacts')
export class ContactsController {
  constructor(private readonly contactsService: ContactsService) {}

  @Put()
  async updateUserContacts(@Body() dto: UpdateUserContactsDto, @CurrentUser() currentUser: JwtPayload) {
    return this.contactsService.updateContacts(dto, currentUser);
  }

  @Public()
  @Get('/verify')
  async confirmEmail(@Query('username') username: string, @Query('code') code: string, @Query('type') type: 'email' | 'phone', @Res() res: Response) {
    return this.contactsService.verify(username, code, type, res);
  }
  @Get('verify/email')
  async verifyEmail(@CurrentUser() currentUser: JwtPayload) {
    return this.contactsService.createVerification(currentUser, 'email');
  }

  @Get('verify/phone')
  async verifyPhone(@CurrentUser() currentUser: JwtPayload) {
    return this.contactsService.createVerification(currentUser, 'phone');
  }
}
