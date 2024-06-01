import { $Enums, Address } from '@prisma/client';

export class AddressResponse implements Address {
  apartment: string | null;
  house: string;
  id: string;
  street: string;
  username: number;
  system_id: string;
  type: $Enums.AddressType;

  constructor(address: Address) {
    Object.assign(this, address);
  }
}
