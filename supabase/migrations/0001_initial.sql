create extension if not exists pgcrypto;

create table public.admin_users (
  user_id uuid primary key references auth.users(id) on delete cascade,
  created_at timestamptz not null default now()
);
create table public.events (
  id uuid primary key default gen_random_uuid(), slug varchar(8) not null unique,
  title text not null, description text not null, cover_image_path text,
  host_name varchar(80) not null, start_at timestamptz not null, end_at timestamptz not null,
  timezone text not null default 'Asia/Seoul', location_type text not null,
  location_name text, location_url text, map_url text, registration_enabled boolean not null default true,
  registration_open_at timestamptz, registration_close_at timestamptz, capacity integer,
  approval_mode text not null default 'auto', status text not null default 'published',
  created_by uuid not null references auth.users(id), created_at timestamptz not null default now(), updated_at timestamptz not null default now(),
  constraint events_location_type_check check (location_type in ('in_person','online')),
  constraint events_approval_mode_check check (approval_mode in ('auto','manual')),
  constraint events_status_check check (status in ('draft','published','cancelled')),
  constraint events_capacity_check check (capacity is null or capacity > 0),
  constraint events_dates_check check (start_at < end_at)
);
create table public.registration_fields (
  id uuid primary key default gen_random_uuid(), event_id uuid not null references public.events(id) on delete cascade,
  type text not null, label varchar(120) not null, description text, placeholder varchar(200), options jsonb,
  required boolean not null default false, sort_order integer not null default 0, created_at timestamptz not null default now(),
  constraint registration_fields_type_check check (type in ('text','textarea','select','checkbox'))
);
create table public.registrations (
  id uuid primary key default gen_random_uuid(), event_id uuid not null references public.events(id) on delete cascade,
  name varchar(120) not null, email text not null, normalized_email text not null, answers jsonb not null default '{}',
  status text not null, consent_at timestamptz not null, cancel_token_hash text not null,
  registered_at timestamptz not null default now(), updated_at timestamptz not null default now(), cancelled_at timestamptz,
  constraint registrations_status_check check (status in ('pending','approved','rejected','cancelled'))
);
create unique index registrations_event_email_unique on public.registrations(event_id, normalized_email) where status in ('pending','approved');
create table public.email_deliveries (
  id uuid primary key default gen_random_uuid(), registration_id uuid not null references public.registrations(id) on delete cascade,
  email_type text not null, attempt_no integer not null, to_email text not null, status text not null,
  sent_at timestamptz, error_message text, created_at timestamptz not null default now(),
  unique(registration_id, email_type, attempt_no)
);

create or replace function public.is_admin() returns boolean language sql stable security definer set search_path = public as $$
  select exists(select 1 from public.admin_users where user_id = auth.uid());
$$;

alter table public.admin_users enable row level security;
alter table public.events enable row level security;
alter table public.registration_fields enable row level security;
alter table public.registrations enable row level security;
alter table public.email_deliveries enable row level security;
create policy "admins can read own admin row" on public.admin_users for select using (user_id = auth.uid());
create policy "public can read published events" on public.events for select using (status in ('published','cancelled') or public.is_admin());
create policy "admins manage events" on public.events for all using (public.is_admin()) with check (public.is_admin());
create policy "public can read fields for public events" on public.registration_fields for select using (exists(select 1 from public.events e where e.id = event_id and e.status in ('published','cancelled')) or public.is_admin());
create policy "admins manage fields" on public.registration_fields for all using (public.is_admin()) with check (public.is_admin());
create policy "admins manage registrations" on public.registrations for all using (public.is_admin()) with check (public.is_admin());
create policy "admins manage deliveries" on public.email_deliveries for all using (public.is_admin()) with check (public.is_admin());

create or replace function public.register_for_event(p_event_id uuid, p_name text, p_email text, p_answers jsonb, p_consent boolean, p_cancel_token_hash text)
returns json language plpgsql security definer set search_path = public as $$
declare e public.events; v_status text; v_id uuid; v_token_hash text;
begin
  if not p_consent then raise exception using errcode = 'P0001', message = 'CONSENT_REQUIRED'; end if;
  select * into e from public.events where id = p_event_id for update;
  if not found or e.status not in ('published','cancelled') then raise exception using errcode = 'P0001', message = 'EVENT_NOT_FOUND'; end if;
  if e.status = 'cancelled' or not e.registration_enabled or (e.registration_open_at is not null and now() < e.registration_open_at) or (e.registration_close_at is not null and now() >= e.registration_close_at) then raise exception using errcode = 'P0001', message = 'REGISTRATION_NOT_OPEN'; end if;
  if exists(select 1 from public.registrations where event_id = p_event_id and normalized_email = lower(trim(p_email)) and status in ('pending','approved')) then raise exception using errcode = 'P0001', message = 'DUPLICATE_EMAIL'; end if;
  if e.capacity is not null and (select count(*) from public.registrations where event_id = p_event_id and status = 'approved') >= e.capacity then raise exception using errcode = 'P0001', message = 'EVENT_FULL'; end if;
  v_status := case when e.approval_mode = 'auto' then 'approved' else 'pending' end;
  insert into public.registrations(event_id,name,email,normalized_email,answers,status,consent_at,cancel_token_hash) values (p_event_id,trim(p_name),trim(p_email),lower(trim(p_email)),coalesce(p_answers,'{}'),v_status,now(),p_cancel_token_hash) returning id into v_id;
  return json_build_object('id', v_id, 'status', v_status);
end; $$;
revoke all on function public.register_for_event(uuid,text,text,jsonb,boolean,text) from public;
grant execute on function public.register_for_event(uuid,text,text,jsonb,boolean,text) to anon, authenticated;

insert into storage.buckets (id, name, public) values ('event-covers','event-covers',true) on conflict (id) do nothing;
create policy "public read event covers" on storage.objects for select using (bucket_id = 'event-covers');
create policy "admins manage event covers" on storage.objects for all using (bucket_id = 'event-covers' and public.is_admin()) with check (bucket_id = 'event-covers' and public.is_admin());
