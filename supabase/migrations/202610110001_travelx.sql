begin;

create table public.travelx_profiles (
  id uuid primary key references auth.users on delete cascade,
  name text not null check (char_length(trim(name)) between 1 and 60),
  bio text not null default '' check (char_length(bio) <= 300),
  hometown text not null default '' check (char_length(hometown) <= 80),
  created_at timestamptz not null default now()
);
create table public.travelx_packs (
  user_id uuid primary key references auth.users on delete cascade,
  saved_cities text[] not null default '{}',
  saved_apps text[] not null default '{}',
  preferences jsonb not null default '{}',
  updated_at timestamptz not null default now(),
  check (saved_cities <@ array['tokyo','kozhikode']::text[])
);
create table public.travelx_events (
  id uuid primary key default gen_random_uuid(),
  host_id uuid not null references public.travelx_profiles on delete cascade,
  city text not null check (city in ('tokyo','kozhikode')),
  title text not null check (char_length(trim(title)) between 3 and 80),
  emoji text not null default '☕' check (char_length(emoji) <= 12),
  description text not null default '' check (char_length(description) <= 500),
  location text not null check (char_length(trim(location)) between 3 and 160),
  latitude double precision not null check (latitude between -90 and 90),
  longitude double precision not null check (longitude between -180 and 180),
  starts_at timestamptz not null,
  capacity integer not null default 6 check (capacity between 2 and 30),
  cancelled boolean not null default false,
  created_at timestamptz not null default now()
);
create table public.travelx_members (
  event_id uuid not null references public.travelx_events on delete cascade,
  user_id uuid not null references public.travelx_profiles on delete cascade,
  rsvp text not null default 'going' check (rsvp in ('going','maybe','cant')),
  joined_at timestamptz not null default now(),
  primary key(event_id,user_id)
);
create table public.travelx_messages (
  id uuid primary key default gen_random_uuid(),
  event_id uuid not null references public.travelx_events on delete cascade,
  user_id uuid not null references public.travelx_profiles on delete cascade,
  body text not null check (char_length(trim(body)) between 1 and 300),
  pinned boolean not null default false,
  created_at timestamptz not null default now()
);
create table public.travelx_blocks (
  user_id uuid not null references auth.users on delete cascade,
  blocked_id uuid not null references auth.users on delete cascade,
  primary key (user_id,blocked_id),
  check (user_id <> blocked_id)
);
create table public.travelx_reports (
  id uuid primary key default gen_random_uuid(),
  reporter_id uuid not null default auth.uid() references auth.users on delete cascade,
  target_type text not null check (target_type in ('event','message','user')),
  target_id uuid not null,
  reason text not null check (char_length(trim(reason)) between 3 and 500),
  created_at timestamptz not null default now()
);
create index travelx_events_city_time on public.travelx_events(city,starts_at);
create index travelx_messages_event_time on public.travelx_messages(event_id,created_at);
create index travelx_members_user on public.travelx_members(user_id);

-- Enable live group chat updates through Supabase Realtime.
alter publication supabase_realtime add table public.travelx_messages;

alter table public.travelx_profiles enable row level security;
alter table public.travelx_packs enable row level security;
alter table public.travelx_events enable row level security;
alter table public.travelx_members enable row level security;
alter table public.travelx_messages enable row level security;
alter table public.travelx_blocks enable row level security;
alter table public.travelx_reports enable row level security;

create function public.travelx_blocked(other uuid) returns boolean language sql stable security definer set search_path = '' as $$
  select exists(select 1 from public.travelx_blocks where (user_id=auth.uid() and blocked_id=other) or (blocked_id=auth.uid() and user_id=other));
$$;
create function public.travelx_host(e uuid) returns boolean language sql stable security definer set search_path = '' as $$
  select exists(select 1 from public.travelx_events where id=e and host_id=auth.uid());
$$;
create function public.travelx_member(e uuid) returns boolean language sql stable security definer set search_path = '' as $$
  select exists(select 1 from public.travelx_members m join public.travelx_events v on v.id=m.event_id where m.event_id=e and m.user_id=auth.uid() and not public.travelx_blocked(v.host_id));
$$;

create policy profile_read on public.travelx_profiles for select to authenticated using (not public.travelx_blocked(id));
create policy profile_insert on public.travelx_profiles for insert to authenticated with check(id=auth.uid());
create policy profile_update on public.travelx_profiles for update to authenticated using(id=auth.uid()) with check(id=auth.uid());
create policy own_packs on public.travelx_packs for all to authenticated using(user_id=auth.uid()) with check(user_id=auth.uid());
create policy event_read on public.travelx_events for select to anon, authenticated using(not public.travelx_blocked(host_id));
create policy members_read on public.travelx_members for select to authenticated using(public.travelx_member(event_id));
create policy messages_read on public.travelx_messages for select to authenticated using(public.travelx_member(event_id) and not public.travelx_blocked(user_id));
create policy messages_insert on public.travelx_messages for insert to authenticated with check(user_id=auth.uid() and public.travelx_member(event_id) and exists(select 1 from public.travelx_events where id=event_id and not cancelled and starts_at > now()-interval '24 hours'));
create policy messages_delete on public.travelx_messages for delete to authenticated using(public.travelx_member(event_id) and (user_id=auth.uid() or public.travelx_host(event_id)));
create policy own_blocks on public.travelx_blocks for all to authenticated using(user_id=auth.uid()) with check(user_id=auth.uid());
create policy reports_insert on public.travelx_reports for insert to authenticated with check(reporter_id=auth.uid());
create policy reports_read on public.travelx_reports for select to authenticated using(reporter_id=auth.uid());

-- Mutations use narrow RPC functions; there are no direct event/member write grants.
create function public.travelx_create_event(p_city text,p_title text,p_emoji text,p_description text,p_location text,p_latitude double precision,p_longitude double precision,p_starts_at timestamptz,p_capacity integer)
returns uuid language plpgsql security definer set search_path = '' as $$
declare e uuid;
begin
  if auth.uid() is null then raise exception 'Sign in to create an activity'; end if;
  if p_starts_at < now()-interval '5 minutes' or p_starts_at > now()+interval '365 days' then raise exception 'Choose a time within the next year'; end if;
  insert into public.travelx_events(host_id,city,title,emoji,description,location,latitude,longitude,starts_at,capacity)
  values(auth.uid(),p_city,trim(p_title),p_emoji,trim(p_description),trim(p_location),p_latitude,p_longitude,p_starts_at,p_capacity) returning id into e;
  insert into public.travelx_members(event_id,user_id) values(e,auth.uid());
  return e;
end; $$;
create function public.travelx_join_event(p_event uuid) returns void language plpgsql security definer set search_path = '' as $$
declare e public.travelx_events;
begin
  if auth.uid() is null then raise exception 'Sign in to join'; end if;
  select * into e from public.travelx_events where id=p_event for update;
  if not found or e.cancelled or e.starts_at < now()-interval '2 hours' then raise exception 'This activity is no longer available'; end if;
  if public.travelx_blocked(e.host_id) then raise exception 'This activity is unavailable'; end if;
  if exists(select 1 from public.travelx_members where event_id=p_event and user_id=auth.uid()) then return; end if;
  if (select count(*) from public.travelx_members where event_id=p_event) >= e.capacity then raise exception 'This activity is full'; end if;
  insert into public.travelx_members(event_id,user_id) values(p_event,auth.uid());
end; $$;
create function public.travelx_leave_event(p_event uuid) returns void language plpgsql security definer set search_path = '' as $$
begin
  if public.travelx_host(p_event) then raise exception 'Hosts must cancel the activity instead'; end if;
  delete from public.travelx_members where event_id=p_event and user_id=auth.uid();
end; $$;
create function public.travelx_rsvp(p_event uuid,p_status text) returns void language plpgsql security definer set search_path = '' as $$
begin
  if not public.travelx_member(p_event) then raise exception 'Join this activity first'; end if;
  update public.travelx_members set rsvp=p_status where event_id=p_event and user_id=auth.uid();
end; $$;
create function public.travelx_cancel_event(p_event uuid) returns void language plpgsql security definer set search_path = '' as $$
begin
  if not public.travelx_host(p_event) then raise exception 'Only the host can cancel'; end if;
  update public.travelx_events set cancelled=true where id=p_event;
end; $$;
create function public.travelx_remove_member(p_event uuid,p_user uuid) returns void language plpgsql security definer set search_path = '' as $$
begin
  if not public.travelx_host(p_event) or p_user=auth.uid() then raise exception 'Only hosts can remove other members'; end if;
  delete from public.travelx_members where event_id=p_event and user_id=p_user;
end; $$;
create function public.travelx_pin_message(p_message uuid,p_pinned boolean) returns void language plpgsql security definer set search_path = '' as $$
declare e uuid;
begin
  select event_id into e from public.travelx_messages where id=p_message;
  if not public.travelx_host(e) then raise exception 'Only the host can pin messages'; end if;
  update public.travelx_messages set pinned=p_pinned where id=p_message;
end; $$;

revoke all on public.travelx_profiles,public.travelx_packs,public.travelx_events,public.travelx_members,public.travelx_messages,public.travelx_blocks,public.travelx_reports from anon, authenticated;
grant select on public.travelx_events to anon,authenticated;
grant select,insert,update on public.travelx_profiles to authenticated;
grant select,insert,update,delete on public.travelx_packs,public.travelx_blocks to authenticated;
grant select on public.travelx_members to authenticated;
grant select,insert,delete on public.travelx_messages to authenticated;
grant select,insert on public.travelx_reports to authenticated;

revoke all on function public.travelx_blocked(uuid),public.travelx_host(uuid),public.travelx_member(uuid) from public;
grant execute on function public.travelx_blocked(uuid) to anon,authenticated;
grant execute on function public.travelx_host(uuid),public.travelx_member(uuid) to authenticated;
revoke all on function public.travelx_create_event(text,text,text,text,text,double precision,double precision,timestamptz,integer),public.travelx_join_event(uuid),public.travelx_leave_event(uuid),public.travelx_rsvp(uuid,text),public.travelx_cancel_event(uuid),public.travelx_remove_member(uuid,uuid),public.travelx_pin_message(uuid,boolean) from public;
grant execute on function public.travelx_create_event(text,text,text,text,text,double precision,double precision,timestamptz,integer),public.travelx_join_event(uuid),public.travelx_leave_event(uuid),public.travelx_rsvp(uuid,text),public.travelx_cancel_event(uuid),public.travelx_remove_member(uuid,uuid),public.travelx_pin_message(uuid,boolean) to authenticated;
notify pgrst, 'reload schema';
commit;
