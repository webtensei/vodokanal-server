import {
  ConflictException,
  Injectable,
  Logger,
  UnauthorizedException,
} from '@nestjs/common';
import { LoginDto, RegisterDto } from '@auth/dto';
import { UserService } from '@user/user.service';
import { Tokens } from '@auth/interfaces';
import { compareSync } from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { Token, User } from '@prisma/client';
import { PrismaService } from '@prisma/prisma.service';
import { v4 } from 'uuid';
import { add } from 'date-fns';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private readonly userService: UserService, // private readonly contactService: contactService
    private readonly jwtService: JwtService,
    private readonly prismaService: PrismaService,
  ) {}

  async register(dto: RegisterDto) {
    const user = await this.userService.findOne(dto.username).catch((err) => {
      this.logger.error(err);
      return null;
    });
    if (user) {
      throw new ConflictException(
        'Пользователь с таким логином уже существует.',
      );
    }

    return this.userService.create(dto).catch((err) => {
      this.logger.error(err);
      return null;
    });
  }

  async login(dto: LoginDto): Promise<Tokens> {
    const user = await this.userService.findOne(dto.username).catch((err) => {
      this.logger.error(err);
      return null;
    });
    if (!user || !compareSync(dto.password, user.password)) {
      throw new UnauthorizedException('Неверный логин или пароль.');
    }
    return this.generateTokens(user);
  }

  async refreshTokens(refreshToken: string): Promise<Tokens> {
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
    return this.generateTokens(user);
  }

  private async generateTokens(user: User): Promise<Tokens> {
    const accessToken =
      `Bearer ` +
      this.jwtService.sign({
        username: user.username,
        role: user.role,
      });
    const refreshToken = await this.getRefreshToken(user.username);
    return { accessToken, refreshToken };
  }

  private async getRefreshToken(username: number): Promise<Token> {
    return this.prismaService.token.create({
      data: {
        token: v4(),
        expired_in: add(new Date(), { months: 1 }),
        username: username,
      },
    });
  }
}
