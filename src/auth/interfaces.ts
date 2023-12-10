import { Token } from '@prisma/client';
import { UserResponse } from '@user/responses';
import { AddressResponse } from '../address/responses';
import { ContactResponse } from '@contact/responses';

export interface Tokens {
  accessToken: string;
  refreshToken: Token;
}

export interface LoginInterface extends Tokens {
  user: UserResponse;
  contacts: Partial<ContactResponse>;
  addresses: AddressResponse[];
}

export interface JwtPayload {
  username: number;
  role: string;
}
