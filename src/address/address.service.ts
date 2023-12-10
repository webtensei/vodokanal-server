import { BadRequestException, ConflictException, Injectable } from '@nestjs/common';
import { CreateAddressDto } from './dto/create-address.dto';
import { PrismaService } from '@prisma/prisma.service';

@Injectable()
export class AddressService {
  constructor(private readonly prismaService: PrismaService) {}

  async create(address: CreateAddressDto) {
    if (!address || !address.street || !address.house) {
      throw new BadRequestException('Некорректные данные адреса');
    }

    const whereCondition = {
      street: address.street,
      house: address.house,
      apartment: address.apartment || null,
    };

    const addressExists = await this.prismaService.address.findFirst({
      where: whereCondition,
    });

    if (addressExists) {
      throw new ConflictException('Данный адрес уже зарегистрирован в системе. Обратитесь в поддержку');
    }

    const newAddress = await this.prismaService.address.create({
      data: {
        ...address,
        apartment: address.apartment || null,
      },
    });

    return { ...newAddress };
  }

  find(username: number) {
    return this.prismaService.address.findMany({
      where: {
        username: username,
      },
    });
  }
}
