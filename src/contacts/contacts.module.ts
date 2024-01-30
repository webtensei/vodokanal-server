import { Module } from '@nestjs/common';
import { ContactsService } from './contacts.service';
import { ContactsController } from './contacts.controller';
import { MailService } from '../mail/mail.service';

@Module({
  controllers: [ContactsController],
  providers: [ContactsService, MailService],
  exports: [ContactsService],
})
export class ContactsModule {}
