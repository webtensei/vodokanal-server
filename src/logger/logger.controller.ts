import { Controller } from '@nestjs/common';
import { LoggerService } from './logger.service';

@Controller()
export class LoggerController {
  constructor(private readonly loggerService: LoggerService) {}
}
