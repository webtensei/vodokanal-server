import {
  ArrayMinSize,
  ArrayNotEmpty,
  IsArray,
  IsNotEmpty, IsNumber,
  IsNumberString,
  IsString,
  IsUUID,
} from 'class-validator';

export class CreatePaymentDto {
  @IsNotEmpty()
  @IsNumber()
  username: number;
  @IsUUID()
  @IsNotEmpty()
  addressId: string;
  meters?: string[];
  @IsArray()
  @ArrayNotEmpty()
  @ArrayMinSize(1)
  @IsString({ each: true })
  services: string[];
  @IsArray()
  @ArrayNotEmpty()
  @ArrayMinSize(1)
  @IsString({ each: true })
  services_amount: string[];
  @IsNumberString()
  @IsNotEmpty()
  amount: string;
}
