import { LoginHistory, Token } from '@prisma/client';
import { Exclude } from 'class-transformer';

export class LoginHistoryResponse implements LoginHistory {
  id: string;
  ip_address: string;
  login_time: Date;
  user_agent: string;
  @Exclude()
  username: number;

  constructor(piece: LoginHistory) {
    Object.assign(this, piece);
  }
}
