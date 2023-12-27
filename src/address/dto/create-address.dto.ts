import { AddressType } from '@prisma/client';

export class CreateAddressDto {
  username: number;
  street: string;
  house: string;
  apartment?: string;
  type: AddressType;
}
