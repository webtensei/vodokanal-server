import { ConflictException, Injectable, Logger, UnauthorizedException } from '@nestjs/common';
import { LoginDto, RegisterDto } from '@auth/dto';
import { UserService } from '@user/user.service';
import { LoginInterface, Tokens } from '@auth/interfaces';
import { compareSync } from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { Token, User } from '@prisma/client';
import { PrismaService } from '@prisma/prisma.service';
import { v4 } from 'uuid';
import { add } from 'date-fns';
import { ContactService } from '@contact/contact.service';
import { AddressService } from '../address/address.service';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private readonly userService: UserService,
    private readonly addressService: AddressService,
    private readonly jwtService: JwtService,
    private readonly prismaService: PrismaService,
    private readonly contactService: ContactService,
  ) {}

  async register(dto: RegisterDto) {
    const user = await this.userService.findOne(dto.username).catch((err) => {
      this.logger.error(err);
      return null;
    });
    if (user) {
      throw new ConflictException('Пользователь с таким логином уже существует.');
    }

    const newUser = await this.userService.create(dto).catch((err) => {
      this.logger.error(err);
      return null;
    });
    const newContacts = await this.contactService.create(dto).catch();
    return { ...newUser, ...newContacts };
  }

  async login(dto: LoginDto, agent: string): Promise<LoginInterface> {
    const { password, ...user } = await this.userService.findOne(dto.username).catch((err) => {
      this.logger.error(err);
      return null;
    });
    if (!user || !compareSync(dto.password, password)) {
      throw new UnauthorizedException('Неверный логин или пароль.');
    }
    const tokens = await this.generateTokens(user, agent);
    const { username, phone_activation_code, email_activation_code, ...contacts } = await this.contactService.findOne(dto.username);

    const addresses = await this.addressService.find(dto.username);
    return { ...tokens, user, contacts, addresses };
  }

  async refreshTokens(refreshToken: string, agent: string): Promise<Tokens> {
    const token = await this.prismaService.token.findUnique({
      where: { token: refreshToken },
    });
    if (!token) {
      throw new UnauthorizedException();
    }
    await this.prismaService.token.delete({ where: { token: refreshToken } });
    if (new Date(token.expired_in) < new Date()) {
      throw new UnauthorizedException();
    }
    const user = await this.userService.findOne(token.username);
    return this.generateTokens(user, agent);
  }

  private async generateTokens(user: User, agent: string): Promise<Tokens> {
    const accessToken =
      `Bearer ` +
      this.jwtService.sign({
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
}
