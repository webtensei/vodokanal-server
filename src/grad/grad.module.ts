import { Module } from '@nestjs/common';
import { GradService } from './grad.service';
import { GradController } from './grad.controller';

@Module({
  controllers: [GradController],
  providers: [GradService],
})
export class GradModule {}
