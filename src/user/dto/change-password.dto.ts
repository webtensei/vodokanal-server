import { IsNotEmpty, IsString, IsStrongPassword } from 'class-validator';

export class ChangePasswordDto {
  @IsNotEmpty()
  password: string;
  @IsStrongPassword()
  @IsNotEmpty()
  @IsString()
  newPassword: string;
}
