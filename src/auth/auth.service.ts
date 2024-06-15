import { ConflictException, HttpStatus, Injectable, Logger, UnauthorizedException } from '@nestjs/common';
import { LoginDto, RegisterDto } from '@auth/dto';
import { UserService } from '@user/user.service';
import { JwtPayload, Tokens } from '@auth/interfaces';
import { compareSync } from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { Token, User } from '@prisma/client';
import { PrismaService } from '@prisma/prisma.service';
import { v4 } from 'uuid';
import { add } from 'date-fns';
import { LoggerService } from '../logger/logger.service';
import { ContactsService } from '../contacts/contacts.service';
import { AddressService } from '../address/address.service';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private readonly userService: UserService,
    private readonly contactsService: ContactsService,
    private readonly addressService: AddressService,
    private readonly jwtService: JwtService,
    private readonly prismaService: PrismaService,
    private readonly loggerService: LoggerService,
  ) {}

  async register(dto: RegisterDto) {
    const user = await this.userService.find(dto.username).catch(() => {
      return null;
    });

    if (user) {
      throw new ConflictException('Пользователь с таким логином уже существует.');
    }

    const address = await this.addressService.findByAddress(dto.street, dto.house, dto.apartment).catch(() => {
      return null;
    });

    if (address) {
      throw new ConflictException('Пользователь с таким адресом уже существует.');
    }

    await this.userService.create(dto);
    await this.contactsService.create(dto);
    await this.addressService.create(dto).catch((err) => {
      this.userService.delete(dto.username);
      throw err;
    });

    return { statusCode: HttpStatus.CREATED, message: 'Created' };
  }

  async login(dto: LoginDto, agent: string, ip: string): Promise<Tokens> {
    const existsUser = await this.userService.find(dto.username, true).catch((err) => {
      this.logger.error(err);
      return null;
    });

    if (!existsUser || !compareSync(dto.password, existsUser.password)) {
      throw new UnauthorizedException('Неверный логин или пароль.');
    }

    await this.loggerService.serviceLogin({
      username: existsUser.username,
      ip_address: ip,
      user_agent: agent,
    });

    const tokens = await this.generateTokens(existsUser, agent);
    return { ...tokens };
  }

  async refreshTokens(refreshToken: string, agent: string): Promise<Tokens> {
    const token = await this.prismaService.token.findUnique({
      where: { token: refreshToken },
    });
    if (!token) throw new UnauthorizedException();

    await this.prismaService.token.delete({ where: { token: refreshToken } });

    if (new Date(token.expired_in) < new Date()) throw new UnauthorizedException();

    const user = await this.userService.find(token.username);
    return this.generateTokens(user, agent);
  }

  async findLoginHistory(user: JwtPayload) {
    return this.prismaService.loginHistory.findMany({ where: { username: Number(user.username) } });
  }
  async findUserDevices(user: JwtPayload) {
    return this.prismaService.token.findMany({ where: { username: Number(user.username) } });
  }

  async deleteDevice(id: string, user: JwtPayload) {
    const foundedSession = await this.prismaService.token.findUnique({ where: { id } });

    if (!foundedSession || foundedSession.username !== user.username) throw new ConflictException('Сессия не была найдена/удалена');

    return this.prismaService.token.delete({ where: { id }, select: { id: true } });
  }

  private async generateTokens(user: User, agent: string): Promise<Tokens> {
    const accessToken = this.jwtService.sign({
      username: user.username,
      role: user.role,
    });
    const refreshToken = await this.getRefreshToken(user.username, agent);
    return { accessToken, refreshToken };
  }

  private async getRefreshToken(username: number, agent: string): Promise<Token> {
    const _token = await this.prismaService.token.findFirst({
      where: { username, user_agent: agent },
    });
    const token = _token?.token ?? '';
    return this.prismaService.token.upsert({
      where: { token },
      update: {
        token: v4(),
        expired_in: add(new Date(), { months: 1 }),
      },
      create: {
        token: v4(),
        expired_in: add(new Date(), { months: 1 }),
        username: username,
        user_agent: agent,
      },
    });
  }

  deleteRefreshToken(token: string) {
    return this.prismaService.token.delete({ where: { token } });
  }
}
