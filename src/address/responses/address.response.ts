import { Address } from '@prisma/client';

export class AddressResponse implements Address {
  apartment: string | null;
  g_account_id: string | null;
  house: string;
  id: number;
  street: string;
  username: number;

  constructor(address: Address) {
    Object.assign(this, address);
  }
}
