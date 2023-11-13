import { Body, ClassSerializerInterceptor, Controller, Post, UseInterceptors } from '@nestjs/common';
import { AddressService } from './address.service';
import { Public } from '@shared/decorators';
import { AddressResponse } from './responses';
import { CreateAddressDto } from './dto/create-address.dto';

@Controller('address')
export class AddressController {
  constructor(private readonly addressService: AddressService) {}

  @UseInterceptors(ClassSerializerInterceptor)
  @Public()
  @Post()
  async createAddress(@Body() dto: CreateAddressDto) {
    const address = await this.addressService.create(dto);
    return new AddressResponse(address);
  }
}
