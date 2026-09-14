import { z } from 'zod';

export const ADMIN_EMAIL_DOMAIN = 'muriconvite.com';

export const loginSchema = z.object({
  username: z.string().trim().min(1, 'Informe o usuário'),
  password: z.string().min(1, 'Informe a senha'),
});

export type LoginFormData = z.infer<typeof loginSchema>;

export type LoginFormInput = z.input<typeof loginSchema>;

export function toAdminEmail(username: string): string {
  return `${username.trim().toLowerCase()}@${ADMIN_EMAIL_DOMAIN}`;
}
