import { Module } from '@nestjs/common';
import { AddressService } from './address.service';
import { AddressController } from './address.controller';
import { UserService } from '@user/user.service';

@Module({
  controllers: [AddressController],
  providers: [AddressService, UserService],
  exports: [AddressService],
})
export class AddressModule {}
