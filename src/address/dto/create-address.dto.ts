import { AddressType } from '@prisma/client';
import { IsEnum, IsInt, IsNotEmpty, IsString } from 'class-validator';

export class CreateAddressDto {
  @IsInt()
  username: number;
  @IsNotEmpty()
  @IsString()
  street: string;
  @IsNotEmpty()
  @IsString()
  house: string;
  apartment?: string;
  @IsEnum(AddressType)
  buildingType: AddressType;
}
