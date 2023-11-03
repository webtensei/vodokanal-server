import { Body, Controller, Get, Post } from '@nestjs/common';
import { RegisterDto } from '@auth/dto';

@Controller('auth')
export class AuthController {
  @Post('register')
  register(@Body dto: RegisterDto) {}

  @Post('login')
  login(@Body dto) {}

  @Get('refresh')
  refreshTokens() {}
}
