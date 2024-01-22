import { Module } from '@nestjs/common';
import { AddressService } from './address.service';
import { AddressController } from './address.controller';
import { GradService } from '../grad/grad.service';

@Module({
  controllers: [AddressController],
  providers: [AddressService, GradService],
  exports: [AddressService],
})
export class AddressModule {}
