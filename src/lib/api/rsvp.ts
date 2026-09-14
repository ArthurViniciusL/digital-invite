import { supabase } from '@/lib/supabaseClient';
import {
  toRsvpRecord,
  toRsvpRow,
  type RsvpFormData,
  type RsvpRecord,
  type RsvpRecordRow,
} from '@/lib/schemas/rsvpSchema';

const RSVP_TABLE = 'rsvp';
const RSVP_RECORD_COLUMNS = 'id, nome, email, whatsapp, numero_pessoas, status, created_at';
const UNIQUE_VIOLATION_CODE = '23505';

export type CreateRsvpResult = { ok: true } | { ok: false; reason: 'duplicate_email' | 'unknown' };

export type FetchRsvpListResult =
  { ok: true; records: RsvpRecord[] } | { ok: false; reason: 'unknown' };

export async function fetchRsvpList(): Promise<FetchRsvpListResult> {
  const { data, error } = await supabase
    .from(RSVP_TABLE)
    .select(RSVP_RECORD_COLUMNS)
    .order('created_at', { ascending: false })
    .returns<RsvpRecordRow[]>();

  if (error !== null) {
    return { ok: false, reason: 'unknown' };
  }

  return { ok: true, records: data.map(toRsvpRecord) };
}

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
