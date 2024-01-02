import { ConflictException, Injectable, OnModuleInit } from '@nestjs/common';
import { ICreatePayment, Payment, YooCheckout } from '@a2seven/yoo-checkout';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { PrismaService } from '@prisma/prisma.service';
import { PaymentStatus } from '@prisma/client';

@Injectable()
export class PaymentService implements OnModuleInit {
  constructor(private readonly prismaService: PrismaService) {}

  private checkout: YooCheckout;

  async onModuleInit() {
    this.checkout = new YooCheckout({
      shopId: `${process.env.YOOKASSA_SHOP_ID}`,
      secretKey: `${process.env.YOOKASSA_SECRET_KEY}`,
    });
  }

  async create(payment: CreatePaymentDto) {
    const paymentPayload = this.buildPaymentPayload(payment);
    const configuratedPayment = await this.createPayment(paymentPayload);
    await this.savePayment(configuratedPayment, payment);
    return configuratedPayment.confirmation.confirmation_url;
  }

  async notify(notification) {
    await this.updatePaymentStatus(notification.object.id, notification.object.status);
    if (notification.event === 'payment.waiting_for_capture') {
      try {
        await this.checkout.capturePayment(notification.object.id, notification.object.amount);
        return 0;
      } catch (error) {
        console.error(error);
      }
    }

    return 0;
  }

  private async updatePaymentStatus(paymentId: string, status: PaymentStatus) {
    return this.prismaService.payment.update({
      where: { payment_id: paymentId },
      data: {
        status: status,
      },
    });
  }

  // функция передает список счетчиков и сумму оплаты по ним
  private async informServices() {}

  private buildPaymentPayload(payment: CreatePaymentDto): ICreatePayment {
    const createPayload: ICreatePayment = {
      amount: {
        value: payment.amount,
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
          payer: payment.payer,
          amount: payment.amount,
          metters: payment.metters,
          status: configuratedPayment.status,
          payment_id: configuratedPayment.id,
          created_at: configuratedPayment.created_at,
          addr: { connect: { id: payment.addressId } },
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
