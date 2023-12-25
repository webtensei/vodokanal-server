import { Token } from '@prisma/client';
import { UserResponse } from '@user/responses';

export interface Tokens {
  accessToken: string;
  refreshToken: Token;
}

export interface LoginInterface extends Tokens {
  user: UserResponse;
}

export interface JwtPayload {
  username: number;
  role: string;
}
