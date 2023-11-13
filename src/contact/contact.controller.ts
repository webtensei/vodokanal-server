import { Body, ClassSerializerInterceptor, Controller, Delete, Get, Param, Patch, UseInterceptors } from '@nestjs/common';
import { ContactService } from './contact.service';
import { UpdateContactDto } from './dto/update-contact.dto';
import { ContactResponse } from '@contact/responses';

@Controller('contact')
export class ContactController {
  constructor(private readonly contactService: ContactService) {}

  @UseInterceptors(ClassSerializerInterceptor)
  @Get(':username')
  async getContact(@Param('username') username: number) {
    const foundedContact = await this.contactService.findOne(+username);
    return new ContactResponse(foundedContact);
  }

  @UseInterceptors(ClassSerializerInterceptor)
  @Patch(':username')
  async updateContact(@Param('username') username: number, @Body() updateContactDto: UpdateContactDto) {
    const updatedContact = await this.contactService.update(+username, updateContactDto);
    return new ContactResponse(updatedContact);
  }

  @Delete(':username')
  async removeContact(@Param('username') username: number) {
    return this.contactService.remove(+username);
  }
}
