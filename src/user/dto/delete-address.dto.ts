import { IsInt, IsNotEmpty } from 'class-validator';

export class DeleteAddressDto {
  @IsInt()
  @IsNotEmpty()
  username: number;
  @IsNotEmpty()
  password: string;
  @IsNotEmpty()
  addressId: number;
}
