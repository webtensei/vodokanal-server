import { Injectable } from '@nestjs/common';
import { MailerService } from '@nestjs-modules/mailer';

@Injectable()
export class MailService {
  constructor(private readonly mailerService: MailerService) {}

  async sendActivationMail(to: string, link: string): Promise<void> {
    await this.mailerService.sendMail({
      to,
      subject: 'Активация аккаунта ООО ВОДОКАНАЛ',
      template: 'activation',
      context: { link },
    });
  }
}
