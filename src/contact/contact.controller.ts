import {
  Controller,
  Body,
  Patch,
  Param,
} from '@nestjs/common';
import { ContactService } from './contact.service';
import { UpdateContactDto } from './dto/update-contact.dto';
import { Public } from '@shared/decorators';

@Public()
@Controller('contact')
export class ContactController {
  constructor(private readonly contactService: ContactService) {}

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateContactDto: UpdateContactDto) {
    return this.contactService.update(+id, updateContactDto);
  }
}
