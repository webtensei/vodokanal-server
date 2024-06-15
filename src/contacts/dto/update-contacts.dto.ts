import { IsEmail, IsInt, IsNotEmpty, IsPhoneNumber } from 'class-validator';

export class UpdateUserContactsDto {
  @IsInt()
  @IsNotEmpty()
  username: number;
  @IsNotEmpty()
  @IsEmail()
  email: string;
  @IsNotEmpty()
  @IsPhoneNumber('RU')
  phone: string;
}
