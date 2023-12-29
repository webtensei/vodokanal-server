import { BadRequestException, ConflictException, ForbiddenException, Injectable } from '@nestjs/common';
import { CreateAddressDto } from './dto/create-address.dto';
import { PrismaService } from '@prisma/prisma.service';
import { JwtPayload } from '@auth/interfaces';
import { Role } from '@prisma/client';

@Injectable()
export class AddressService {
  constructor(private readonly prismaService: PrismaService) {}

  async create(address: CreateAddressDto) {
    const existsAddress = await this.findByAddress(address.street, address.house, address.apartment).catch(() => {
      return null;
    });

    if (existsAddress) {
      throw new ConflictException('Данный адрес уже зарегистрирован в системе.');
    }
    switch (address.buildingType) {
      case 'CITIZEN':
        break;
      case 'BUSINESS':
        break;
    }

    try {
      return this.prismaService.address.create({
        data: {
          street: address.street,
          house: address.house,
          apartment: address.apartment || null,
          user: { connect: { username: +address.username } },
          // hardcoded shit under
          type: address.buildingType,
          system_id: 'asd',
        },
      });
    } catch (error) {
      console.error('Error creating contacts:', error);
      throw new BadRequestException('Не удалось создать адрес.');
    }
  }

  async delete(addressId: number, currentUser: JwtPayload) {
    await this.checkAddressCredentials(addressId, currentUser);

    return this.prismaService.address.delete({
      where: {
        id: addressId,
      },
    });
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

  async findOne(addressId: number, currentUser: JwtPayload) {
    return this.checkAddressCredentials(addressId, currentUser);
  }

  private async checkAddressCredentials(addressId: number, currentUser: JwtPayload) {
    const address = await this.prismaService.address.findFirst({
      where: {
        id: addressId,
      },
    });

    if (!address) {
      throw new BadRequestException('Адрес не найден.');
    }

    if (address.username !== currentUser.username && !currentUser.role.includes(Role.ADMIN || Role.OWNER)) {
      throw new ForbiddenException();
    }

    return address;
  }
}
