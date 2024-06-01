import {
  ArrayMinSize,
  ArrayNotEmpty,
  IsArray,
  IsInt,
  IsNotEmpty,
  IsNumberString,
  IsString,
  IsUUID,
} from 'class-validator';

export class CreatePaymentDto {
  @IsUUID()
  @IsNotEmpty()
  addressId: string;
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
