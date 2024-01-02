import { Body, Controller, Post } from '@nestjs/common';
import { PaymentService } from './payment.service';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { Public } from '@shared/decorators';

@Controller('payment')
export class PaymentController {
  constructor(private readonly paymentService: PaymentService) {}

  @Post()
  async createPayment(@Body() dto: CreatePaymentDto) {
    return this.paymentService.create(dto);
  }

  @Public()
  @Post('/notify')
  async notify(@Body() notification) {
    return this.paymentService.notify(notification);
  }
}
