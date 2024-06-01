import { createZodDto } from 'nestjs-zod';
import { loginRequest } from '@auth/dto/login.zod';

export class LoginDto  extends createZodDto(loginRequest) {}