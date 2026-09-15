create table public.rsvp (
  id uuid primary key default gen_random_uuid(),
  nome text not null,
  email text not null,
  whatsapp text not null,
  numero_pessoas integer not null,
  status text not null default 'confirmado',
  created_at timestamptz not null default now(),
  constraint rsvp_email_key unique (email)
);

create index rsvp_created_at_idx on public.rsvp (created_at desc);

alter table public.rsvp enable row level security;

revoke all on table public.rsvp from anon, authenticated;
grant insert (nome, email, whatsapp, numero_pessoas) on table public.rsvp to anon, authenticated;
grant select on table public.rsvp to authenticated;

create policy "Guests can create an RSVP"
  on public.rsvp
  for insert
  to anon, authenticated
  with check (true);

create policy "Signed-in admins can read RSVPs"
  on public.rsvp
  for select
  to authenticated
  using (true);
