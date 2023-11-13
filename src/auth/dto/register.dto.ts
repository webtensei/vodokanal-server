import { IsEmail, IsInt, IsNotEmpty, IsPhoneNumber, IsString, IsStrongPassword } from 'class-validator';

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
  @IsNotEmpty()
  @IsString()
  street: string;
  @IsNotEmpty()
  @IsString()
  house: string;
  apartment?: string;
}
