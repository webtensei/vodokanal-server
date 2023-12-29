import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { UserModule } from '@user/user.module';
import { options } from './config';
import { STRATEGIES } from '@auth/strategies';
import { GUARDS } from '@auth/guards';
import { LoggerModule } from '../logger/logger.module';
import { ContactsModule } from '../contacts/contacts.module';
import { AddressModule } from '../address/address.module';

@Module({
  controllers: [AuthController],
  providers: [AuthService, ...STRATEGIES, ...GUARDS],
  imports: [PassportModule, JwtModule.registerAsync(options()), UserModule, LoggerModule, ContactsModule, AddressModule],
})
export class AuthModule {}
