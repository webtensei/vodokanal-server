import { Injectable } from '@nestjs/common';
import { PrismaService } from '@prisma/prisma.service';
import { ServiceLoginDto } from './dto';

@Injectable()
export class LoggerService {
  constructor(private readonly prismaService: PrismaService) {}

  async serviceLogin(login: ServiceLoginDto) {
    return this.prismaService.loginHistory.create({
      data: {
        username: login.username,
        ip_address: login.ip_address,
        user_agent: login.user_agent,
      },
    });
  }
}
