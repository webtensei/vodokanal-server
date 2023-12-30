import { ArrayMinSize, ArrayNotEmpty, IsArray, IsDecimal, IsInt, IsNotEmpty, IsString } from 'class-validator';

export class CreatePaymentDto {
  @IsInt()
  @IsNotEmpty()
  addressId: number;
  @IsArray()
  @ArrayNotEmpty()
  @ArrayMinSize(1)
  @IsString({ each: true })
  metters: string[];
  @IsDecimal()
  @IsNotEmpty()
  amount: string;
  @IsNotEmpty()
  @IsString()
  payer: string;
}
