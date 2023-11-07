import { IsInt, IsString } from 'class-validator';

export class LoginDto {
  @IsInt()
  username: number;
  @IsString()
  password: string;
}
