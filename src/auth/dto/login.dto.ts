import { IsEmpty, IsInt } from 'class-validator';

export class LoginDto {
  @IsInt()
  @IsEmpty()
  username: number;
  @IsEmpty()
  password: string;
}