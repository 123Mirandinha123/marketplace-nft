import { z } from 'zod'

export const loginSchema = z.object({
  email: z.string().trim().email('Informe um e-mail válido.'),
  password: z.string().min(1, 'Informe sua senha.'),
})

export const registerSchema = z
  .object({
    username: z
      .string()
      .trim()
      .min(3, 'Use pelo menos 3 caracteres.')
      .max(24, 'Use no máximo 24 caracteres.')
      .regex(/^[a-zA-Z0-9_]+$/, 'Use apenas letras, números e underscore.'),
    email: z.string().trim().email('Informe um e-mail válido.'),
    password: z.string().min(8, 'Use pelo menos 8 caracteres.'),
    confirmPassword: z.string().min(1, 'Confirme sua senha.'),
  })
  .refine((values) => values.password === values.confirmPassword, {
    message: 'As senhas não coincidem.',
    path: ['confirmPassword'],
  })

export type LoginValues = z.infer<typeof loginSchema>
export type RegisterValues = z.infer<typeof registerSchema>
