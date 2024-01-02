import { Body, ClassSerializerInterceptor, Controller, Delete, Get, Param, ParseIntPipe, Post, UseGuards, UseInterceptors } from '@nestjs/common';
import { AddressService } from './address.service';
import { AddressResponse } from './responses';
import { CreateAddressDto } from './dto/create-address.dto';
import { CurrentUser, Roles } from '@shared/decorators';
import { JwtPayload } from '@auth/interfaces';
import { RolesGuard } from '@auth/guards/role.guard';
import { Role } from '@prisma/client';

@Controller('user/address')
export class AddressController {
  constructor(private readonly addressService: AddressService) {}

  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN || Role.OWNER)
  @UseInterceptors(ClassSerializerInterceptor)
  @Post()
  async createAddress(@Body() address: CreateAddressDto) {
    const response = await this.addressService.create(address);
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
