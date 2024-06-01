import { BadRequestException, ConflictException, ForbiddenException, Injectable } from '@nestjs/common';
import { CreateAddressDto } from './dto/create-address.dto';
import { PrismaService } from '@prisma/prisma.service';
import { JwtPayload } from '@auth/interfaces';
import { Role } from '@prisma/client';
import { GradService } from '../grad/grad.service';
import { CheckAddressValidDto } from './dto/check-address-valid.dto';
import { SendMeterIndicationDto } from './dto/send-meter-indication.dto';

@Injectable()
export class AddressService {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly gradService: GradService,
  ) {}

  async create(address: CreateAddressDto) {
    const existsAddress = await this.findByAddress(address.street, address.house, address.apartment).catch(() => {
      return null;
    });

    if (existsAddress && existsAddress.system_id === address.system_id) {
      throw new ConflictException('Данный адрес уже зарегистрирован в системе.');
    }

    try {
      return this.prismaService.address.create({
        data: {
          street: address.street,
          house: address.house,
          apartment: address.apartment || null,
          user: { connect: { username: +address.username } },
          // hardcoded shit under
          type: address.type,
          system_id: address.system_id,
        },
      });
    } catch (error) {
      console.error('Error creating contacts:', error);
      throw new BadRequestException('Не удалось создать адрес.');
    }
  }

  async delete(id: string, currentUser: JwtPayload) {
    await this.checkAddressCredentials(id, currentUser);

    return this.prismaService.address.delete({ where: { id } });
  }

  async findByAddress(street: string, house: string, apartment?: string) {
    const address = await this.prismaService.address.findFirst({
      where: {
        street: street,
        house: house,
        apartment: apartment || null,
      },
    });

    if (!address) {
      throw new ConflictException('Не удалось найти адрес.');
    }

    return address;
  }

  async findOne(id: string, currentUser: JwtPayload) {
    return this.checkAddressCredentials(id, currentUser);
  }

  async updateStreets() {
    const gradList = await this.gradService.getStreets();
    const formatedGradList = gradList.map((street) => ({ grad_id: street.id, name: street.name }));

    return this.prismaService.externalStreetMap.createMany({ data: formatedGradList });
  }

  async getExternalStreets() {
    return this.prismaService.externalStreetMap.findMany({});
  }

  async checkExternalAddressCredentials(address: CheckAddressValidDto) {
    switch (address.type) {
      case 'CITIZEN':
        return await this.gradService.checkAddressExists(address);
      case 'BUSINESS':
        break;
    }
  }

  async sendMeterIndications(dto: SendMeterIndicationDto, currentUser: JwtPayload) {
    const address = await this.prismaService.address.findFirst({ where: { id: dto.addressId } });

    if (!address) throw new BadRequestException('Адрес не найден');

    if (address.username !== currentUser.username && !currentUser.role.includes(Role.ADMIN || Role.OWNER)) {
      throw new ForbiddenException();
    }

    switch (address.type) {
      case 'CITIZEN':
        return await this.gradService.sendMeterIndications(address.system_id, dto.metersList, dto.chargesList);
      case 'BUSINESS':
        break;
    }
  }

  async findMeters(addressId: string, currentUser: JwtPayload) {
    const address = await this.prismaService.address.findFirst({ where: { id: addressId } });

    if (!address) throw new BadRequestException('Адрес не найден');

    if (address.username !== currentUser.username && !currentUser.role.includes(Role.ADMIN || Role.OWNER)) {
      throw new ForbiddenException();
    }

    switch (address.type) {
      case 'CITIZEN':
        return await this.gradService.getMeters(address.system_id);
      case 'BUSINESS':
        break;
    }
  }

  async findServices(addressId: string, currentUser: JwtPayload) {
    const address = await this.prismaService.address.findFirst({ where: { id: addressId } });
    if (!address) throw new BadRequestException('Адрес не найден');

    if (address.username !== currentUser.username && !currentUser.role.includes(Role.ADMIN || Role.OWNER)) {
      throw new ForbiddenException();
    }

    switch (address.type) {
      case 'CITIZEN':
        return await this.gradService.getAbonentServices(address.system_id);
      case 'BUSINESS':
        break;
    }
  }

  private async checkAddressCredentials(id: string, currentUser: JwtPayload) {
    const address = await this.prismaService.address.findFirst({ where: { id } });

    if (!address) {
      throw new BadRequestException('Адрес не найден.');
    }

    if (address.username !== currentUser.username && !currentUser.role.includes(Role.ADMIN || Role.OWNER)) {
      throw new ForbiddenException();
    }

    return address;
  }
}
