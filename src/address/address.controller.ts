import { Body, ClassSerializerInterceptor, Controller, Delete, Get, Param, ParseIntPipe, Post, UseInterceptors } from '@nestjs/common';
import { AddressService } from './address.service';
import { AddressResponse } from './responses';
import { CreateAddressDto } from './dto/create-address.dto';
import { CurrentUser } from '@shared/decorators';
import { JwtPayload } from '@auth/interfaces';

@Controller('user/address')
export class AddressController {
  constructor(private readonly addressService: AddressService) {}

  @UseInterceptors(ClassSerializerInterceptor)
  @Post()
  async createAddress(@Body() address: CreateAddressDto, @CurrentUser() currentUser: JwtPayload) {
    const response = await this.addressService.create(address, currentUser);
    return new AddressResponse(response);
  }

  @Get(':addressId')
  async findAddress(@Param('addressId', ParseIntPipe) addressId: number, @CurrentUser() currentUser: JwtPayload) {
    const response = await this.addressService.findOne(addressId, currentUser);
    return new AddressResponse(response);
  }

  @Delete(':id')
  async deleteAddress(@Param('addressId', ParseIntPipe) addressId: number, @CurrentUser() currentUser: JwtPayload) {
    const response = await this.addressService.delete(addressId, currentUser);
    return new AddressResponse(response);
  }
}
