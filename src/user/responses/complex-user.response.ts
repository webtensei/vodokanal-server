import { $Enums } from '@prisma/client';
import { Exclude } from 'class-transformer';

export class ComplexUserResponse {
  created_at: Date;
  name: string;
  @Exclude()
  password: string;
  patronymic: string | null;
  role: $Enums.Role;
  surname: string;
  username: number;
  preferred_settings: {
    username: number;
    preferred_theme: string;
    preferred_address: string;
  };
  contacts: {
    username: number;
    email: string;
    email_activated: boolean;
    email_activated_at: Date;
    phone: string;
    phone_activated: boolean;
    phone_activated_at: Date;
  };
  addresses: [];

  constructor(user: any) {
    Object.assign(this, user);
  }
}
