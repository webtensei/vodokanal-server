import { Body, Controller, Get, Post } from '@nestjs/common';
import { GradService } from './grad.service';
import { IsString } from 'class-validator';
import { CheckAddressDto } from './dto/check-address.dto';

@Controller('grad')
export class GradController {
  constructor(private readonly gradService: GradService) {}

  @Get('generate')
  generateSession() {
    return this.gradService.generateSession();
  }

  @Get('testnet')
  testreq() {
    return this.gradService.getStreets();
  }

  @Post('check')
  checkAddr(@Body() address: CheckAddressDto) {
    return this.gradService.checkAddressExists(address);
  }
}
