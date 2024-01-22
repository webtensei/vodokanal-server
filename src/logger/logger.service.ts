import { HttpStatus, Injectable } from '@nestjs/common';
import { PrismaService } from '@prisma/prisma.service';
import { ContactRequestDto, ServiceLoginDto } from './dto';
import * as process from 'process';
import axios from 'axios';

@Injectable()
export class LoggerService {
  constructor(private readonly prismaService: PrismaService) {}

  private readonly URI_TG_API = `https://api.telegram.org/bot${process.env.TG_TOKEN}/sendMessage`;
  private readonly URI_TG_API_DOC = `https://api.telegram.org/bot${process.env.TG_TOKEN}/sendDocument`;

  async serviceLogin(login: ServiceLoginDto) {
    return this.prismaService.loginHistory.create({
      data: {
        username: login.username,
        ip_address: login.ip_address,
        user_agent: login.user_agent,
      },
    });
  }

  async sendForm(form: ContactRequestDto) {
    const msg = `<b>${form.theme}</b>\n <b>${form.name}, <a href='mailto::${form.email}'>${form.email}</a></b>\n <i>Сообщение:</i> ${form.message}`;
    await axios
      .post(this.URI_TG_API, { chat_id: process.env.TG_CHAT_ID, parse_mode: 'html', message: msg, text: msg })
      .then((res) => {})
      .catch((e) => {
        console.log(e);
        if (e.response && e.response.data && e.response.data.message) {
          return e.response.data.message;
        } else {
          return 'An error occurred.';
        }
      });
    return HttpStatus.OK;
  }
}
