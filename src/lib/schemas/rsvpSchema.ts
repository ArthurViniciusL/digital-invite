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
 *   whatsapp      -> rsvp.whatsapp   (recommended; no column is documented yet)
 *
 * FLAG: no Supabase column exists for a phone number. Neither `PROJECT.md` §6
 * nor `SYSTEM-DESIGN.md` §3.1 defines one, so `rsvp.whatsapp` above is a
 * recommendation this file records and does not act on. `whatsapp` is validated
 * and kept as the formatted string the guest sees; normalising it to bare
 * digits for the database belongs to the change that adds the insert, together
 * with the migration that creates the column.
 *
 * FLAG: the guest-count column name is contradictory across the documents.
 * `PROJECT.md` §6 says `number_of_persons`, `SYSTEM-DESIGN.md` §3.1's DDL says
 * `numero_pessoas`, and the mapping above says `numero_pessoas`. Resolving it
 * is a data-model decision that belongs with the migration, so no winner is
 * picked here.
 */

export const MAX_GUEST_COUNT = 10

export const rsvpSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, 'Informe seu nome')
    .max(60, { error: '{{copy: rsvp_error_name_max}}' }),
  /**
   * The literal `9` is the Brazilian mobile ninth digit, so the pattern rejects
   * landlines: the field exists so the organizer can reach the guest on
   * WhatsApp, and a landline cannot.
   */
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
})

export type RsvpFormData = z.infer<typeof rsvpSchema>

/**
 * `guestCount` is coerced, so the value the form holds while the guest types is
 * wider than the validated one: the stepper's field is a text input.
 */
export type RsvpFormInput = z.input<typeof rsvpSchema>
