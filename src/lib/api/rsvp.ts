import { supabase } from '@/lib/supabaseClient';
import { toRsvpRow, type RsvpFormData } from '@/lib/schemas/rsvpSchema';

const RSVP_TABLE = 'rsvp';
const UNIQUE_VIOLATION_CODE = '23505';

export type CreateRsvpResult = { ok: true } | { ok: false; reason: 'duplicate_email' | 'unknown' };

export async function createRsvp(data: RsvpFormData): Promise<CreateRsvpResult> {
  const { error } = await supabase.from(RSVP_TABLE).insert(toRsvpRow(data));

  if (error === null) {
    return { ok: true };
  }

  if (error.code === UNIQUE_VIOLATION_CODE) {
    return { ok: false, reason: 'duplicate_email' };
  }

  return { ok: false, reason: 'unknown' };
}
