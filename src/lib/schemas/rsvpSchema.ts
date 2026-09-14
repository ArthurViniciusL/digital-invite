import { z } from 'zod';

export const MAX_GUEST_COUNT = 10;

export const rsvpSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, 'Informe seu nome')
    .max(60, { error: '{{copy: rsvp_error_name_max}}' }),

  whatsapp: z
    .string()
    .trim()
    .min(1, { error: '{{copy: rsvp_error_whatsapp_required}}' })
    .regex(/^\d{2} 9 \d{4}-\d{4}$/, { error: '{{copy: rsvp_error_whatsapp_format}}' }),

  email: z.email('E-mail inválido'),

  guestCount: z.coerce
    .number({ error: '{{copy: rsvp_error_guest_count_type}}' })
    .int({ error: '{{copy: rsvp_error_guest_count_int}}' })
    .min(1, 'Mínimo de 1 pessoa')
    .max(MAX_GUEST_COUNT, { error: '{{copy: rsvp_error_guest_count_max}}' }),
});

export type RsvpFormData = z.infer<typeof rsvpSchema>;

export type RsvpFormInput = z.input<typeof rsvpSchema>;

export interface RsvpRow {
  nome: string;
  email: string;
  whatsapp: string;
  numero_pessoas: number;
}

export function toRsvpRow(data: RsvpFormData): RsvpRow {
  return {
    nome: data.name,
    email: data.email.trim().toLowerCase(),
    whatsapp: data.whatsapp,
    numero_pessoas: data.guestCount,
  };
}
