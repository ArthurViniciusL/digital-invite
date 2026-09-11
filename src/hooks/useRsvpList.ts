/**
 * Loads every RSVP record for the administrator dashboard.
 *
 * TODO: implement as `supabase.from('rsvp').select('*').order('created_at')`,
 * exposing the rows plus loading and error state. The select policy only allows
 * authenticated reads, so this hook is only ever called from a protected route.
 */
export function useRsvpList() {
  return { rsvpList: [], isLoading: false, error: null }
}
