import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from '@prisma/prisma.module';

@Module({
  imports: [ConfigModule.forRoot(), PrismaModule],
  controllers: [],
  providers: [],
  exports: [],
})
export class AppModule {}
