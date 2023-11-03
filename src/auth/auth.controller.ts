import { Body, Controller, Get, Post } from '@nestjs/common';
import { LoginDto, RegisterDto } from '@auth/dto';

@Controller('auth')
export class AuthController {
  @Post('register')
  register(@Body() dto: RegisterDto) {}

  @Post('login')
  login(@Body() dto: LoginDto) {

  //   тут я хочу заодно проходиться  и регать в LoginHistory (ну, в сервисе, очевидно)

  }

  @Get('refresh')
  refreshTokens() {}
}
