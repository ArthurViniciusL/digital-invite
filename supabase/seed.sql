insert into auth.users (
  instance_id,
  id,
  aud,
  role,
  email,
  encrypted_password,
  email_confirmed_at,
  raw_app_meta_data,
  raw_user_meta_data,
  created_at,
  updated_at,
  confirmation_token,
  email_change,
  email_change_token_new,
  recovery_token
) values (
  '00000000-0000-0000-0000-000000000000',
  'e2e00000-0000-4000-8000-000000000001',
  'authenticated',
  'authenticated',
  'e2e-admin@muriconvite.com',
  crypt('e2e-admin-password', gen_salt('bf')),
  now(),
  '{"provider": "email", "providers": ["email"]}',
  '{}',
  now(),
  now(),
  '',
  '',
  '',
  ''
);

insert into auth.identities (
  id,
  user_id,
  provider_id,
  identity_data,
  provider,
  last_sign_in_at,
  created_at,
  updated_at
) values (
  'e2e00000-0000-4000-8000-000000000002',
  'e2e00000-0000-4000-8000-000000000001',
  'e2e00000-0000-4000-8000-000000000001',
  '{"sub": "e2e00000-0000-4000-8000-000000000001", "email": "e2e-admin@muriconvite.com", "email_verified": true}',
  'email',
  now(),
  now(),
  now()
);
