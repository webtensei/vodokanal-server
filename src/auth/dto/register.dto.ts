import {
  IsEmail,
  IsEmpty,
  IsInt,
  IsPhoneNumber,
  IsString,
  IsStrongPassword,
} from 'class-validator';

export class RegisterDto {
  @IsInt()
  username: number;

  @IsEmpty()
  @IsStrongPassword()
  password: string;
  @IsEmpty()
  @IsString()
  name: string;
  @IsEmpty()
  @IsString()
  surname: string;
  @IsEmpty()
  @IsString()
  patronymic?: string;
  @IsEmpty()
  @IsEmail()
  email: string;
  @IsEmpty()
  @IsPhoneNumber('RU')
  phone: string;
  @IsEmpty()
  @IsString()
  street: string;
  @IsEmpty()
  @IsString()
  house: string;
  @IsEmpty()
  @IsString()
  apartment?: string;
}
