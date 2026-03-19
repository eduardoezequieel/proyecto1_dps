import { z } from 'zod';
import { LIMITS } from '@/lib/validations';

export const loginSchema = z.object({
  email: z
    .string()
    .min(1, 'El correo es obligatorio')
    .max(LIMITS.email, `El correo no puede exceder ${LIMITS.email} caracteres`)
    .email('Ingresa un correo valido'),
  password: z
    .string()
    .min(1, 'La contraseña es obligatoria')
    .max(
      LIMITS.passwordMax,
      `La contraseña no puede exceder ${LIMITS.passwordMax} caracteres`
    ),
});

export type LoginInput = z.infer<typeof loginSchema>;
