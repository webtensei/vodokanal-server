import { BadRequestException, ConflictException, Injectable } from '@nestjs/common';
import { CreateAddressDto } from './dto/create-address.dto';
import { PrismaService } from '@prisma/prisma.service';
import { UserService } from '@user/user.service';
import { DeleteAddressDto } from '@user/dto/delete-address.dto';

@Injectable()
export class AddressService {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly userService: UserService,
  ) {}

  async create(address: CreateAddressDto) {
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
  async deleteAddress(address: DeleteAddressDto) {
    await this.userService.checkUserCredentials(address.username, address.password);

    const existsAddress = await this.find(address.addressId);
    if (!existsAddress) {
      throw new BadRequestException('Адрес не найден.');
    }
    if (existsAddress.username !== address.username) {
      throw new BadRequestException('Адрес вам не принадлежит.');
    }

    return this.delete(address.addressId);
  }

  find(addressId: number) {
    return this.prismaService.address.findFirst({
      where: {
        id: addressId,
      },
    });
  }

  delete(addressId: number) {
    return this.prismaService.address.delete({
      where: {
        id: addressId,
      },
    });
  }
}
