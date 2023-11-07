import {
  BadRequestException,
  Body,
  Controller,
  Get,
  HttpStatus,
  Post,
  Req,
  Res,
  UnauthorizedException,
} from '@nestjs/common';
import { LoginDto, RegisterDto } from '@auth/dto';
import { AuthService } from '@auth/auth.service';
import { Tokens } from '@auth/interfaces';
import { Response, Request } from 'express';
import { ConfigService } from '@nestjs/config';
import { Cookie } from '@shared/decorators';

const REFRESH_TOKEN = 'refreshtoken';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly configService: ConfigService,
  ) {}

  @Post('register')
  async register(@Body() dto: RegisterDto) {
    const user = await this.authService.register(dto);
    if (!user) {
      throw new BadRequestException(
        `Не получилось зарегестрировать пользователя: ${JSON.stringify(dto)}`,
      );
    }
    return { user: user };
  }

  @Post('login')
  async login(
    @Body() dto: LoginDto,
    @Res() res: Response,
    @Req() req: Request,
  ) {
    //   тут я хочу заодно проходиться  и регать в LoginHistory (ну, в сервисе, очевидно)
    const tokens = await this.authService.login(dto);
    if (!tokens) {
      throw new BadRequestException(
        `Не получилось войти с данными ${JSON.stringify(dto)}`,
      );
    }
    this.setRefreshTokenToCookies(tokens, res);
    // return { accessToken: tokens.accessToken };
    return tokens;
  }

  @Get('refresh')
  async refreshTokens(
    @Cookie(REFRESH_TOKEN) refreshToken: string,
    @Res() res: Response,
  ) {
    if (!refreshToken) {
      throw new UnauthorizedException();
    }
    const tokens = await this.authService.refreshTokens(refreshToken);
    this.setRefreshTokenToCookies(tokens, res);
    if (!tokens) {
      throw new UnauthorizedException();
    }
  }

  private setRefreshTokenToCookies(tokens: Tokens, res: Response) {
    if (!tokens) {
      throw new UnauthorizedException();
    }
    res.cookie(REFRESH_TOKEN, tokens.refreshToken.token, {
      httpOnly: true,
      sameSite: 'lax',
      expires: new Date(tokens.refreshToken.expired_in),
      secure:
        this.configService.get('NODE_ENV', 'development') === 'production',
      path: '/',
    });
    res.status(HttpStatus.CREATED).json({ accessToken: tokens.accessToken });
  }
}
