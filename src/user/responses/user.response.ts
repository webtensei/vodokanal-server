import { $Enums, User } from '@prisma/client';
import { Exclude } from 'class-transformer';

export class UserResponse implements User {
  @Exclude()
  created_at: Date;
  name: string;
  @Exclude()
  password: string;
  patronymic: string | null;
  role: $Enums.Role;
  surname: string;
  username: number;

  constructor(user: User) {
    Object.assign(this, user);
  }
}
