import { IsArray, IsEnum, IsNotEmpty, IsNumber, IsString, ValidateIf } from 'class-validator';

export class SendMeterIndicationDto {
  @IsNumber()
  @IsNotEmpty()
  addressId: number;
  @IsArray()
  metersList: [];
  @IsArray()
  chargesList: [];
}
