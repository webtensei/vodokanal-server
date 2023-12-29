import { IsInt, IsNotEmpty, IsString, IsStrongPassword } from 'class-validator';
import { Role } from '@prisma/client';

export class CreateUserDto {
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
  role?: Role;
}
