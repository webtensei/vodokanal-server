import { $Enums, Contact, User } from '@prisma/client';
import { Exclude } from 'class-transformer';

export class UserResponse implements User, Contact {
  @Exclude()
  created_at: Date;
  email: string;
  email_activated: boolean;
  @Exclude()
  email_activated_at: Date | null;
  name: string;
  @Exclude()
  password: string;
  patronymic: string | null;
  phone: string;
  phone_activated: boolean;
  @Exclude()
  phone_activated_at: Date | null;
  role: $Enums.Role;
  surname: string;
  username: number;

  constructor(user: User) {
    Object.assign(this, user);
  }
}
