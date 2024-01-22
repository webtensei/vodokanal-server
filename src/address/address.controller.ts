import {
  Body,
  ClassSerializerInterceptor,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { AddressService } from './address.service';
import { AddressResponse } from './responses';
import { CreateAddressDto } from './dto/create-address.dto';
import { CurrentUser, Public, Roles } from '@shared/decorators';
import { JwtPayload } from '@auth/interfaces';
import { RolesGuard } from '@auth/guards/role.guard';
import { AddressType, Role } from '@prisma/client';
import { CheckAddressValidDto } from './dto/check-address-valid.dto';
import { SendMeterIndicationDto } from './dto/send-meter-indication.dto';

@Controller('address')
export class AddressController {
  constructor(private readonly addressService: AddressService) {}

  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN || Role.OWNER)
  @Patch('/streets')
  async updateStreets() {
    return this.addressService.updateStreets();
  }

  @Public()
  @Get('/streets')
  async externalStreets() {
    return this.addressService.getExternalStreets();
  }

  @Get(':addressId/meters')
  async findMeters(@Param('addressId', ParseIntPipe) addressId: number, @CurrentUser() currentUser: JwtPayload) {
    const response = await this.addressService.findMeters(addressId, currentUser);
    return response;
  }

  @Post('/sendIndication')
  async sendMeterIndications(@Body() dto: SendMeterIndicationDto, @CurrentUser() currentUser: JwtPayload) {
    return this.addressService.sendMeterIndications(dto, currentUser);
  }

  @Get(':addressId/services')
  async findServices(@Param('addressId', ParseIntPipe) addressId: number, @CurrentUser() currentUser: JwtPayload) {
    return this.addressService.findServices(addressId, currentUser);
  }
  @Get(':addressId')
  async findAddress(@Param('addressId', ParseIntPipe) addressId: number, @CurrentUser() currentUser: JwtPayload) {
    const response = await this.addressService.findOne(addressId, currentUser);
    return new AddressResponse(response);
  }

  @Public()
  @Post('/checkAddress')
  async checkExternalAddressCredentials(@Body() address: CheckAddressValidDto) {
    return this.addressService.checkExternalAddressCredentials(address);
  }

  @Delete(':id')
  async deleteAddress(@Param('addressId', ParseIntPipe) addressId: number, @CurrentUser() currentUser: JwtPayload) {
    const response = await this.addressService.delete(addressId, currentUser);
    return new AddressResponse(response);
  }

  @UseInterceptors(ClassSerializerInterceptor)
  @Post()
  async createAddress(@Body() address: CreateAddressDto) {
    const response = await this.addressService.create(address);
    return new AddressResponse(response);
  }
}
