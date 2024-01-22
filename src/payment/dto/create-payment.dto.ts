import { ArrayMinSize, ArrayNotEmpty, IsArray, IsInt, IsNotEmpty, IsNumberString, IsString } from 'class-validator';

export class CreatePaymentDto {
  @IsInt()
  @IsNotEmpty()
  addressId: number;
  @IsArray()
  @ArrayNotEmpty()
  @ArrayMinSize(1)
  @IsString({ each: true })
  meters: string[];
  services?: string[];
  @IsNumberString()
  @IsNotEmpty()
  amount: string;
  @IsNotEmpty()
  @IsString()
  payer: string;
}
