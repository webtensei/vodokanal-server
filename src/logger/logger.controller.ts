import { Body, Controller, Post } from '@nestjs/common';
import { LoggerService } from './logger.service';
import { Public } from 'libs/shared/src/decorators';
import { ContactRequestDto } from './dto';

@Controller('logger')
export class LoggerController {
  constructor(private readonly loggerService: LoggerService) {}

  @Public()
  @Post('contactRequest')
  async sendForm(@Body() dto: ContactRequestDto) {
    const form = await this.loggerService.sendForm(dto);

    return form;
  }
}
