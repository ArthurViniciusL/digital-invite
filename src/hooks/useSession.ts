/**
 * Reads the current Supabase Auth session and keeps it in sync.
 *
 * TODO: implement. It should resolve `supabase.auth.getSession()` once on
 * mount, subscribe to `supabase.auth.onAuthStateChange` for later updates, and
 * unsubscribe on unmount. Until then it reports a settled, signed-out state so
 * consumers can be written against the final shape.
 */
export function useSession() {
  return { session: null, isLoading: false };
}
