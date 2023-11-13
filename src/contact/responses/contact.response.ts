import { Contact } from '@prisma/client';
import { Exclude } from 'class-transformer';

export class ContactResponse implements Contact {
  email: string;
  email_activated: boolean;
  email_activated_at: Date | null;
  @Exclude()
  email_activation_code: string | null;
  phone: string;
  phone_activated: boolean;
  phone_activated_at: Date | null;
  @Exclude()
  phone_activation_code: string | null;
  @Exclude()
  username: number;

  constructor(contact: Contact) {
    Object.assign(this, contact);
  }
}
