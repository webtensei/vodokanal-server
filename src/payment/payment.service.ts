import { ConflictException, ForbiddenException, Injectable, OnModuleInit } from '@nestjs/common';
import { ICreatePayment, Payment, YooCheckout } from '@a2seven/yoo-checkout';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { PrismaService } from '@prisma/prisma.service';
import { PaymentStatus, Role } from '@prisma/client';
import { GradService } from '../grad/grad.service';
import { JwtPayload } from '@auth/interfaces';

@Injectable()
export class PaymentService implements OnModuleInit {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly gradService: GradService,
  ) {}

  private checkout: YooCheckout;

  async onModuleInit() {
    this.checkout = new YooCheckout({
      shopId: `${process.env.YOOKASSA_SHOP_ID}`,
      secretKey: `${process.env.YOOKASSA_SECRET_KEY}`,
    });
  }

  async create(payment: CreatePaymentDto, currentUser: JwtPayload) {
    if (payment.username !== currentUser.username && !currentUser.role.includes(Role.ADMIN || Role.OWNER)) {
      throw new ForbiddenException('Невозможно оплатить услуги другого пользователя');
    }
    const paymentPayload = this.buildPaymentPayload(payment);
    const configuratedPayment = await this.createPayment(paymentPayload);
    await this.savePayment(configuratedPayment, payment);
    return configuratedPayment.confirmation.confirmation_url;
  }

  async notify(notification) {
    const updatedPayment = await this.updatePaymentStatus(notification.object.id, notification.object.status);
    if (notification.event === 'payment.waiting_for_capture') {
      try {
        await this.checkout.capturePayment(notification.object.id, notification.object.amount);
      } catch (error) {
        console.error(error);
        return 0;
      }
    }
    if (updatedPayment.status === 'succeeded') {
      const address = await this.prismaService.address.findUnique({ where: { id: updatedPayment.address } });
      switch (address.type) {
        case 'CITIZEN':
          return this.gradService.sendConfirmedPayment(
            address.system_id,
            Number(updatedPayment.amount) * 100,
            updatedPayment.id,
            updatedPayment.meters,
          );
        case 'BUSINESS':
          break;
      }
    }
    return 0;
  }

  private async updatePaymentStatus(paymentId: string, status: PaymentStatus) {
    return this.prismaService.payment.update({
      where: { id: paymentId },
      data: {
        status: status,
      },
    });
  }

  getAddrPayments(addressId: string) {
    return this.prismaService.payment.findMany({ where: { address: addressId } });
  }

  // функция передает список счетчиков и сумму оплаты по ним для notify
  private async informServices() {}

  private buildPaymentPayload(payment: CreatePaymentDto): ICreatePayment {
    const value = Number(payment.amount) * Number(process.env.PAYMENT_SERVICE_COMISSION);
    const createPayload: ICreatePayment = {
      amount: {
        value: String(value),
        currency: 'RUB',
      },
      confirmation: {
        type: 'redirect',
        return_url: `${process.env.YOOKASSA_REDIRECT_URL}`,
      },
    };
    return createPayload;
  }

  private async savePayment(configuratedPayment: Payment, payment: CreatePaymentDto) {
    try {
      await this.prismaService.payment.create({
        data: {
          amount: payment.amount,
          meters: payment.meters || null,
          services: payment.services,
          services_amount: payment.services_amount,
          status: configuratedPayment.status,
          id: configuratedPayment.id,
          created_at: configuratedPayment.created_at,
          addr: { connect: { id: payment.addressId } },
          user: { connect: { username: +payment.username } },
        },
      });
    } catch (error) {
      console.error('Ошибка при сохранении платежа:', error);
      throw new ConflictException('Ошибка при создании платежа на нашей стороне.');
    }
  }

  private async createPayment(paymentPayload: ICreatePayment) {
    try {
      return await this.checkout.createPayment(paymentPayload);
    } catch (error) {
      console.error('Ошибка при создании платежа в yoomoney:', error);
      throw new ConflictException('Ошибка при создании платежа на стороне yoomoney.');
    }
  }
}
