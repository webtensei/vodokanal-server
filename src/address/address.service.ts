import { BadRequestException, ConflictException, ForbiddenException, Injectable } from '@nestjs/common';
import { CreateAddressDto } from './dto/create-address.dto';
import { PrismaService } from '@prisma/prisma.service';
import { UserService } from '@user/user.service';
import { JwtPayload } from '@auth/interfaces';
import { Role } from '@prisma/client';

@Injectable()
export class AddressService {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly userService: UserService,
  ) {}

  async create(address: CreateAddressDto, currentUser: JwtPayload) {
    if (address.username !== currentUser.username && !currentUser.role.includes(Role.ADMIN || Role.OWNER)) {
      throw new ForbiddenException();
    }
    const existsAddress = await this.prismaService.address.findFirst({
      where: {
        street: address.street,
        house: address.house,
        apartment: address.apartment || null,
      },
    });

    if (existsAddress) {
      throw new ConflictException('Данный адрес уже зарегистрирован в системе. Обратитесь в поддержку');
    }
    switch (address.type) {
      case 'CITIZEN':
        break;
      case 'BUSINESS':
        break;
    }
    return this.prismaService.address.create({
      data: {
        ...address,
        system_id: 'asd',
        apartment: address.apartment || null,
      },
    });
  }

  async delete(addressId: number, currentUser: JwtPayload) {
    await this.checkAddressCredentials(addressId, currentUser);

    return this.prismaService.address.delete({
      where: {
        id: addressId,
      },
    });
  }

  async findOne(addressId: number, currentUser: JwtPayload) {
    return this.checkAddressCredentials(addressId, currentUser);
  }

  private async checkAddressCredentials(addressId: number, currentUser: JwtPayload) {
    const address = await this.prismaService.address.findFirst({
      where: {
        id: +addressId,
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
