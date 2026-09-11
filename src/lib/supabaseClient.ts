import { createClient } from '@supabase/supabase-js'

/**
 * Supabase browser client.
 *
 * Both values are read from Vite environment variables and must be filled in
 * `.env.local` before the app can talk to Supabase. Copy `.env.example` to
 * `.env.local` and paste the project URL and the anon key from the Supabase
 * dashboard (Project Settings -> API).
 *
 * The anon key is meant to be public: row level security on the `rsvp` table is
 * what actually protects the data. Never put the service role key here.
 */
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
