import { Module } from '@nestjs/common';
import { PaymentService } from './payment.service';
import { PaymentController } from './payment.controller';
import { GradService } from '../grad/grad.service';

@Module({
  controllers: [PaymentController],
  providers: [PaymentService, GradService],
})
export class PaymentModule {}
