import { IsEnum, IsNotEmpty, IsString, ValidateIf } from 'class-validator';
import { AddressType } from '@prisma/client';

export class CheckAddressValidDto {
  @IsEnum(AddressType)
  @IsNotEmpty()
  type: AddressType;
  @IsString()
  @IsNotEmpty()
  street: string;
  @IsString()
  @IsNotEmpty()
  house: string;
  @IsString()
  @ValidateIf((object, value) => value !== null)
  apartment?: string;
}
