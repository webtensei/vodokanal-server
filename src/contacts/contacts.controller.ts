import { Body, Controller, Put } from '@nestjs/common';
import { ContactsService } from './contacts.service';
import { CurrentUser } from '@shared/decorators';
import { JwtPayload } from '@auth/interfaces';
import { UpdateUserContactsDto } from './dto/update-contacts.dto';

@Controller('user/contacts')
export class ContactsController {
  constructor(private readonly contactsService: ContactsService) {}

  @Put()
  async updateUserContacts(@Body() dto: UpdateUserContactsDto, @CurrentUser() currentUser: JwtPayload) {
    return this.contactsService.updateContacts(dto, currentUser);
  }
}
