import { z } from 'zod'

/**
 * Validation contract for the public RSVP form.
 *
 * The field names are the English equivalents of the columns in the Supabase
 * `rsvp` table, which was modelled in Portuguese. The mapping is applied when
 * the insert is implemented, so it lives in one place only:
 *
 *   name          -> rsvp.nome
 *   email         -> rsvp.email
 *   guestCount    -> rsvp.numero_pessoas
 */
export const rsvpSchema = z.object({
  name: z.string().min(2, 'Informe seu nome'),
  email: z.email('E-mail inválido'),
  guestCount: z.coerce.number().int().min(1, 'Mínimo de 1 pessoa'),
})

export type RsvpFormData = z.infer<typeof rsvpSchema>
