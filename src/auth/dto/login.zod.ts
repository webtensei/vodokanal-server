import { z } from 'zod';

export const loginRequest = z
  .object({
    username: z.number(),
    password: z.string().min(8, 'Минимальная длинна пароля 8 символов'),
  })
  .required();
