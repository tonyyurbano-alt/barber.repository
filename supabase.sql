-- BARBEARIA SILVA — SUPABASE
-- Execute tudo no SQL Editor do seu projeto Supabase.
create extension if not exists pgcrypto;

create table if not exists public.business_settings (
  id bigint primary key default 1,
  enabled boolean not null default true,
  open_time time not null default '08:00',
  close_time time not null default '19:30',
  updated_at timestamptz not null default now()
);
insert into public.business_settings(id,enabled,open_time,close_time)
values(1,true,'08:00','19:30')
on conflict(id) do nothing;

create table if not exists public.appointments (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  customer_name text not null,
  customer_phone text not null,
  service_id text not null,
  service_name text not null,
  price numeric(10,2) not null,
  duration integer not null,
  appointment_date date not null,
  start_time time not null,
  end_time time not null,
  note text,
  status text not null default 'pending' check(status in ('pending','confirmed','cancelled'))
);

alter table public.business_settings enable row level security;
alter table public.appointments enable row level security;

drop policy if exists "public read settings" on public.business_settings;
create policy "public read settings" on public.business_settings for select using (true);

drop policy if exists "public create appointment" on public.appointments;
create policy "public create appointment" on public.appointments for insert with check (true);

drop policy if exists "public read active appointments" on public.appointments;
create policy "public read active appointments" on public.appointments for select using (status in ('pending','confirmed'));

-- Para o painel do barbeiro, o usuário administrador deve ser criado em:
-- Supabase > Authentication > Users.
-- Depois crie as policies abaixo substituindo a lógica de admin conforme sua preferência.
-- A forma simples para este projeto é permitir UPDATE apenas para usuários autenticados:
drop policy if exists "authenticated update appointments" on public.appointments;
create policy "authenticated update appointments" on public.appointments
for update to authenticated using (true) with check (true);

drop policy if exists "authenticated update settings" on public.business_settings;
create policy "authenticated update settings" on public.business_settings
for update to authenticated using (true) with check (true);

alter table public.appointments replica identity full;
alter publication supabase_realtime add table public.appointments;

create index if not exists appointments_date_idx on public.appointments(appointment_date,start_time);
