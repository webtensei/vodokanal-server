import { Controller, Get } from '@nestjs/common';
import { GradService } from './grad.service';

@Controller('grad')
export class GradController {
  constructor(private readonly gradService: GradService) {}

  @Get('generate')
  generateSession() {
    return this.gradService.generateSession();
  }
  @Get('testnet')
  testreq() {
    return this.gradService.getApartments(6888);
  }
}
