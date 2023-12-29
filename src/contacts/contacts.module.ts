import { Module } from '@nestjs/common';
import { ContactsService } from './contacts.service';
import { ContactsController } from './contacts.controller';
import { UserService } from '@user/user.service';

@Module({
  controllers: [ContactsController],
  providers: [ContactsService, UserService],
  exports: [ContactsService],
})
export class ContactsModule {}
