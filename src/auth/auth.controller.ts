import {
  BadRequestException,
  Body,
  ClassSerializerInterceptor,
  Controller,
  Delete,
  Get,
  HttpStatus,
  Param,
  Post,
  Res,
  UnauthorizedException,
  UseInterceptors,
  UsePipes,
} from '@nestjs/common';
import { LoginDto, RegisterDto } from '@auth/dto';
import { AuthService } from '@auth/auth.service';
import { JwtPayload, Tokens } from '@auth/interfaces';
import { Response } from 'express';
import { ConfigService } from '@nestjs/config';
import { Cookie, CurrentUser, IpDoor, Public, UserAgent } from '@shared/decorators';
import { DevicesResponse } from '@auth/responses/devices.response';
import { ZodValidationPipe } from 'nestjs-zod';

const REFRESH_TOKEN = 'refreshToken';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly configService: ConfigService,
  ) {}

  @Public()
  @UseInterceptors(ClassSerializerInterceptor)
  @Post('register')
  async register(@Body() dto: RegisterDto) {
    const user = await this.authService.register(dto);
    if (user === null || undefined) {
      throw new BadRequestException(`Не получилось зарегестрировать пользователя: ${JSON.stringify(dto)}`);
    }
    //     res.status(HttpStatus.CREATED).json('somethingf');
    return user;
  }

  @Public()
  @UseInterceptors(ClassSerializerInterceptor)
  @Post('login')
  @UsePipes(ZodValidationPipe)
  async login(@Body() dto: LoginDto, @Res() res: Response, @UserAgent() agent: string, @IpDoor() ip: string) {
    const userdata = await this.authService.login(dto, agent, ip);
    if (!userdata) {
      throw new BadRequestException(`Не получилось войти с данными ${JSON.stringify(dto)}`);
    }
    return this.setRefreshTokenToCookies(userdata, res);
  }

  @Public()
  @Get('logout')
  async logout(@Cookie(REFRESH_TOKEN) refreshToken: string, @Res() res: Response) {
    if (!refreshToken) {
      res.sendStatus(HttpStatus.OK);
      return;
    }
    await this.authService.deleteRefreshToken(refreshToken);
    res.cookie(REFRESH_TOKEN, '', { httpOnly: true, secure: true, expires: new Date() });
    return res.sendStatus(HttpStatus.OK);
  }

  @Public()
  @Get('refresh')
  async refreshTokens(@Cookie(REFRESH_TOKEN) refreshToken: string, @Res() res: Response, @UserAgent() agent: string) {
    if (!refreshToken) throw new UnauthorizedException();

    const tokens = await this.authService.refreshTokens(refreshToken, agent);
    this.setRefreshTokenToCookies(tokens, res);

    if (!tokens) throw new UnauthorizedException();
  }

  @Get('me')
  me(@CurrentUser() user: JwtPayload) {
    return user;
  }

  @UseInterceptors(ClassSerializerInterceptor)
  @Get('authenticated-devices')
  async authenticated(@CurrentUser() currentUser: JwtPayload) {
    const devices = await this.authService.findUserDevices(currentUser);
    return devices.map((device) => new DevicesResponse(device));
  }

  @Delete('authenticated-devices/:device')
  async deauthenticate(@CurrentUser() currentUser: JwtPayload, @Param('device') device: string, @Res() res: Response) {
    await this.authService.deleteDevice(device, currentUser);
    return res.sendStatus(HttpStatus.OK);
  }

  private setRefreshTokenToCookies(tokens: Tokens, res: Response) {
    if (!tokens) {
      throw new UnauthorizedException();
    }
    res.cookie(REFRESH_TOKEN, tokens.refreshToken.token, {
      httpOnly: true,
      sameSite: 'lax',
      expires: new Date(tokens.refreshToken.expired_in),
      secure: this.configService.get('NODE_ENV', 'development') === 'production',
      path: '/',
    });
    res.status(HttpStatus.CREATED).json({ accessToken: tokens.accessToken });
  }
}
