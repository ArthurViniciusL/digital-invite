import { supabase } from '@/lib/supabaseClient';
import { toAdminEmail, type LoginFormData } from '@/lib/schemas/loginSchema';

const INVALID_CREDENTIALS_CODE = 'invalid_credentials';

export type SignInResult = { ok: true } | { ok: false; reason: 'invalid_credentials' | 'unknown' };

export async function signIn({ username, password }: LoginFormData): Promise<SignInResult> {
  const { error } = await supabase.auth.signInWithPassword({
    email: toAdminEmail(username),
    password,
  });

  if (error === null) {
    return { ok: true };
  }

  if (error.code === INVALID_CREDENTIALS_CODE) {
    return { ok: false, reason: 'invalid_credentials' };
  }

  return { ok: false, reason: 'unknown' };
}

export async function signOut(): Promise<void> {
  await supabase.auth.signOut();
}
