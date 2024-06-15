import { IsNotEmpty, IsString } from 'class-validator';

export class ChangePasswordDto {
  @IsNotEmpty()
  password: string;
  @IsNotEmpty()
  @IsString()
  newPassword: string;
}
