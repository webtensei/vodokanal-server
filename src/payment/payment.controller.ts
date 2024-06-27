import { Body, Controller, Get, Param, ParseIntPipe, Post } from '@nestjs/common';
import { PaymentService } from './payment.service';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { CurrentUser, Public } from '@shared/decorators';
import { JwtPayload } from '@auth/interfaces';

@Controller('payment')
export class PaymentController {
  constructor(private readonly paymentService: PaymentService) {}

  @Get('/:addressId')
  async getAddrPayments(@Param('addressId') addressId: string, @CurrentUser() currentUser: JwtPayload) {
    return this.paymentService.getAddrPayments(addressId);
  }
  @Post()
  async createPayment(@Body() dto: CreatePaymentDto, @CurrentUser() currentUser: JwtPayload) {
    return this.paymentService.create(dto, currentUser);
  }

  @Public()
  @Post('/notify')
  async notify(@Body() notification) {
    return this.paymentService.notify(notification);
  }
}
