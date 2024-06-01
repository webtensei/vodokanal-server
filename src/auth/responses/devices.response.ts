import { Token } from '@prisma/client';
import { Exclude } from 'class-transformer';

export class DevicesResponse implements Token {
  id: string;
  expired_in: Date;
  @Exclude()
  token: string;
  user_agent: string;
  @Exclude()
  username: number;

  constructor(token: Token) {
    Object.assign(this, token);
  }
}
