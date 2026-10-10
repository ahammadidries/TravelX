begin;
create table public.travelx_apps (
  id text primary key,
  city text not null check (city in ('tokyo','kozhikode')),
  name text not null,
  category text not null check (category in ('Transport','Taxi','Food','Connectivity')),
  initials text not null, color text not null,
  purpose text not null, url text not null check (url like 'https://%'),
  language text not null, phone text not null, payment text not null, tip text not null,
  checked_on date not null, sort_order integer not null default 0
);
create table public.travelx_guides (
  id text primary key, city text not null check (city in ('tokyo','kozhikode')),
  section text not null, title text not null, body text not null,
  source text not null, url text not null check (url like 'https://%'),
  checked_on date not null, sort_order integer not null default 0
);
alter table public.travelx_apps enable row level security;
alter table public.travelx_guides enable row level security;
revoke all on public.travelx_apps, public.travelx_guides from anon, authenticated;
grant select on public.travelx_apps, public.travelx_guides to anon, authenticated;
create policy catalog_read on public.travelx_apps for select to anon, authenticated using (true);
create policy guide_read on public.travelx_guides for select to anon, authenticated using (true);
create index travelx_apps_city on public.travelx_apps(city,sort_order);
create index travelx_guides_city on public.travelx_guides(city,sort_order);

-- Public counts do not expose private participant identities to nonmembers.
create function public.travelx_event_summaries(p_city text)
returns table(id uuid,city text,title text,emoji text,description text,location text,
latitude double precision,longitude double precision,starts_at timestamptz,
capacity integer,cancelled boolean,host_id uuid,member_count bigint,is_member boolean)
language sql stable security definer set search_path = '' as $$
  select e.id,e.city,e.title,e.emoji,e.description,e.location,e.latitude,e.longitude,
    e.starts_at,e.capacity,e.cancelled,e.host_id,
    (select count(*) from public.travelx_members m where m.event_id=e.id),
    exists(select 1 from public.travelx_members m where m.event_id=e.id and m.user_id=auth.uid())
  from public.travelx_events e
  where e.city=p_city and not e.cancelled and e.starts_at >= now()-interval '2 hours'
    and not public.travelx_blocked(e.host_id)
  order by e.starts_at limit 50;
$$;
revoke all on function public.travelx_event_summaries(text) from public;
grant execute on function public.travelx_event_summaries(text) to anon,authenticated;

-- Create a minimal profile within the same transaction as signup.
create function public.travelx_new_user() returns trigger language plpgsql security definer set search_path='' as $$
begin
  insert into public.travelx_profiles(id,name)
  values(new.id,coalesce(nullif(left(trim(new.raw_user_meta_data->>'name'),60),''),'Traveler'))
  on conflict(id) do nothing;
  return new;
end; $$;
revoke all on function public.travelx_new_user() from public;
create trigger travelx_on_signup after insert on auth.users for each row execute function public.travelx_new_user();
insert into public.travelx_profiles(id,name)
select id,coalesce(nullif(left(trim(raw_user_meta_data->>'name'),60),''),'Traveler') from auth.users
on conflict(id) do nothing;

-- A host removal persists; the removed user cannot immediately join again.
create table public.travelx_event_removals (
  event_id uuid references public.travelx_events on delete cascade,
  user_id uuid references auth.users on delete cascade,
  primary key(event_id,user_id)
);
alter table public.travelx_event_removals enable row level security;
revoke all on public.travelx_event_removals from anon,authenticated;
create or replace function public.travelx_remove_member(p_event uuid,p_user uuid)
returns void language plpgsql security definer set search_path='' as $$
begin
  perform 1 from public.travelx_events where id=p_event for update;
  if not public.travelx_host(p_event) or p_user=auth.uid() then raise exception 'Only hosts can remove other members'; end if;
  insert into public.travelx_event_removals values(p_event,p_user) on conflict do nothing;
  delete from public.travelx_members where event_id=p_event and user_id=p_user;
end; $$;
create or replace function public.travelx_join_event(p_event uuid)
returns void language plpgsql security definer set search_path='' as $$
declare e public.travelx_events;
begin
  if auth.uid() is null then raise exception 'Sign in to join'; end if;
  select * into e from public.travelx_events where id=p_event for update;
  if not found or e.cancelled or e.starts_at<now()-interval '2 hours' then raise exception 'This activity is no longer available'; end if;
  if public.travelx_blocked(e.host_id) or exists(select 1 from public.travelx_event_removals where event_id=p_event and user_id=auth.uid()) then raise exception 'This activity is unavailable'; end if;
  if exists(select 1 from public.travelx_members where event_id=p_event and user_id=auth.uid()) then return; end if;
  if (select count(*) from public.travelx_members where event_id=p_event)>=e.capacity then raise exception 'This activity is full'; end if;
  insert into public.travelx_members(event_id,user_id) values(p_event,auth.uid());
end; $$;
notify pgrst, 'reload schema';
commit;
