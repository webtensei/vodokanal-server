import { IsEmail, IsInt, IsNotEmpty, IsPhoneNumber } from 'class-validator';

export class UpdateUserContactsDto {
  @IsInt()
  @IsNotEmpty()
  username: number;
  @IsNotEmpty()
  password: string;
  @IsNotEmpty()
  @IsEmail()
  email: string;
  @IsNotEmpty()
  @IsPhoneNumber('RU')
  phone: string;
}
