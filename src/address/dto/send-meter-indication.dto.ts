import { IsArray, IsEnum, IsNotEmpty, IsNumber, IsString, IsUUID, ValidateIf } from 'class-validator';

export class SendMeterIndicationDto {
  @IsUUID()
  @IsNotEmpty()
  addressId: string;
  @IsArray()
  metersList: [];
  @IsArray()
  chargesList: [];
}
