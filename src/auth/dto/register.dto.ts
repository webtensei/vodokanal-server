import { IsEmail, IsEnum, IsInt, IsNotEmpty, IsPhoneNumber, IsString, IsStrongPassword } from 'class-validator';
import { AddressType } from '@prisma/client';

export class RegisterDto {
  @IsInt()
  @IsNotEmpty()
  username: number;
  @IsStrongPassword()
  @IsNotEmpty()
  password: string;
  @IsString()
  @IsNotEmpty()
  name: string;
  @IsString()
  @IsNotEmpty()
  surname: string;
  @IsString()
  patronymic?: string;
  @IsNotEmpty()
  @IsEmail()
  email: string;
  @IsNotEmpty()
  @IsPhoneNumber('RU')
  phone: string;
  @IsEnum(AddressType)
  type: AddressType;
  @IsNotEmpty()
  @IsString()
  street: string;
  @IsNotEmpty()
  @IsString()
  house: string;
  apartment?: string;
  @IsNotEmpty()
  @IsString()
  system_id: string;
}
