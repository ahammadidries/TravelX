-- Run this whole file in the Supabase SQL Editor. Safe to rerun.
begin;
create schema if not exists travelx_private;
revoke all on schema travelx_private from public,anon,authenticated;
create table if not exists travelx_private.migrations(version text primary key);

do $phase$ begin
if to_regclass('public.travelx_events') is null then
execute $migration$

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

$migration$;
end if;
insert into travelx_private.migrations values('202610110001_travelx') on conflict do nothing;
end $phase$;

do $phase$ begin
if to_regclass('public.travelx_apps') is null then
execute $migration$

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

$migration$;
end if;
insert into travelx_private.migrations values('202610110002_catalog_and_activity_api') on conflict do nothing;
end $phase$;

do $phase$ begin
if not exists(select 1 from travelx_private.migrations where version='202610110003_seed_catalog') then
execute $migration$
-- Generated from the researched, bundled app and guide catalog. No fabricated activities.

insert into public.travelx_apps (id,city,name,category,initials,color,purpose,url,language,phone,payment,tip,checked_on,sort_order) values
('navitime','tokyo','Japan Travel by NAVITIME','Transport','N','#287D47','Train, subway and walking routes in one place.','https://static.japan.travel.navitime.com/app-lp/en/index.html','English and other languages','Browse route information without a local number','Some features require a paid plan','Check your destination station and last connection before leaving.','2026-10-11','0'),
('tokyo-metro','tokyo','Tokyo Metro for Tourists','Transport','M','#087DAD','Official subway information for visitors.','https://www.tokyometro.jp/en/','English visitor website','No number needed for the website','Ticket purchases have separate conditions','Use station numbers and line colors to match signs.','2026-10-11','1'),
('go','tokyo','GO Taxi','Taxi','GO','#137C75','Request a licensed taxi in Japan.','https://go.goinc.jp/en/','English supported','SMS-capable supported number required; check your country','Check GO Pay and in-car options before requesting','Check pickup instructions, fees and supported payment methods in the app.','2026-10-11','2'),
('uber-eats','tokyo','Uber Eats','Food','UE','#176543','Food delivery to an eligible address in Tokyo.','https://www.ubereats.com/jp','Language depends on app settings and listing','Account and contact number required','Available methods shown at checkout','Add your building name and ask whether your accommodation accepts deliveries.','2026-10-11','3'),
('ubigi-jp','tokyo','Ubigi','Connectivity','U','#B44516','Prepaid mobile data on an eSIM-compatible phone.','https://cellulardata.ubigi.com/help-center/faq/ubigi-esim-service/esim-for-japan/','English website and app','Data eSIM does not provide a local voice number','Check current plans and checkout options','Confirm that your phone is unlocked and supports eSIM before purchasing.','2026-10-11','4'),
('irctc','kozhikode','IRCTC Rail Connect','Transport','IR','#315589','Official Indian Railways reserved train booking.','https://www.irctc.co.in/nget/train-search','English and Hindi options','Account verification required; international registration rules vary','Methods displayed during booking','Use Kozhikode station code CLT. A timetable search is not a confirmed ticket.','2026-10-11','5'),
('ksrtc','kozhikode','Kerala RTC','Transport','KS','#A54545','Official reservation portal for bookable Kerala bus services.','https://onlineksrtcswift.com/','English booking website','Contact details required for reservations','Check available methods at booking','This portal does not represent every local city bus. Confirm the boarding point.','2026-10-11','6'),
('uber-clt','kozhikode','Uber','Taxi','UB','#202127','Request an available ride in Kozhikode.','https://www.uber.com/in/en/r/cities/taxi/kozhikode-kerala-in/','App language options vary','Account with a reachable number required','Options shown in your account and trip','Availability depends on your pickup location. Match the plate before boarding.','2026-10-11','7'),
('kerala-savaari','kozhikode','Kerala Savaari','Taxi','KS','#167259','Kerala Government direct-to-driver auto and taxi service.','https://www.keralasavaari.kerala.gov.in/','Check the app for available language options','Account and reachable number required','Confirm shown payment choices before booking','Confirm the vehicle, pickup point and fare shown in the app.','2026-10-11','8'),
('swiggy','kozhikode','Swiggy','Food','S','#BF530D','Restaurant delivery in supported Kozhikode neighborhoods.','https://www.swiggy.com/city/kozhikode/order-online','Check current app language support','Phone verification may be required','Options depend on the order','Enter your exact delivery address first; coverage and restaurant hours vary.','2026-10-11','9'),
('airtel','kozhikode','Airtel','Connectivity','a','#BA263E','Find official mobile service and store information.','https://www.airtel.in/store/','English website; ask store staff about support','A local SIM requires provider identity checks','Confirm prepaid and store payment options','Bring your passport and entry documents and ask what is required for a visitor SIM.','2026-10-11','10'),
('google-maps-tokyo','tokyo','Google Maps','Transport','G','#397FA1','Walking directions, places and transit planning.','https://www.google.com/maps','Multiple languages','No local number needed for basic maps','No payment for basic map use','Use the address and station exit name when meeting someone.','2026-10-11','11'),
('google-maps-clt','kozhikode','Google Maps','Transport','G','#397FA1','Navigate to streets, landmarks and local businesses.','https://www.google.com/maps','Multiple languages','No local number needed for basic maps','No payment for basic map use','Confirm local bus stops and routes with staff when information is incomplete.','2026-10-11','12')
on conflict(id) do update set city=excluded.city,name=excluded.name,category=excluded.category,initials=excluded.initials,color=excluded.color,purpose=excluded.purpose,url=excluded.url,language=excluded.language,phone=excluded.phone,payment=excluded.payment,tip=excluded.tip,checked_on=excluded.checked_on,sort_order=excluded.sort_order;
insert into public.travelx_guides (id,city,section,title,body,source,url,checked_on,sort_order) values
('tokyo-haneda','tokyo','airport','Arriving at Haneda','Follow terminal signs for trains, monorail, buses or the taxi stand. Choose your route using your hotel address and terminal. Check the airport access page for operating hours and accessible routes.','Haneda Airport','https://tokyo-haneda.com/en/access/index.html','2026-10-11','1'),
('tokyo-narita','tokyo','airport','Arriving at Narita','Narita has rail, bus and taxi connections. Check the station for your arrival terminal, then choose a connection to your destination. Confirm the last departure with the operator before a late arrival.','Narita International Airport','https://www.narita-airport.jp/en/access/','2026-10-11','2'),
('tokyo-trains','tokyo','transport','Tickets & trains','Check your line, direction and station exit before entering. Buy the appropriate ticket or use a supported IC card. Keep your ticket or card ready at the exit. Different operators can have different ticket rules.','Japan National Tourism Organization','https://www.japan.travel/en/guide/how-to-travel-by-train-and-bus-in-japan/','2026-10-11','3'),
('tokyo-taxi','tokyo','taxi','Finding your taxi','GO supports taxi requests in Japan. Set your pickup and destination and check the assigned vehicle number. Its official visitor page lists international credit cards and Apple Pay; check the current registration requirements before requesting.','GO Taxi','https://go.goinc.jp/en/','2026-10-11','4'),
('tokyo-payments','tokyo','payments','Cash, cards & IC cards','Ask which payment methods are accepted before buying. IC cards can pay at compatible transport gates and shops displaying the relevant logo. Keep yen available when cards or mobile payments are unavailable.','JNTO · Cashless payments','https://www.japan.travel/en/plan/cashless-payments-in-japan/','2026-10-11','5'),
('tokyo-etiquette','tokyo','etiquette','Small local courtesies','Keep conversations quiet on public transport, avoid phone calls, and give priority seats to people who need them. Stand still on escalators and keep luggage out of other passengers’ way.','JNTO · Customs and etiquette','https://www.japan.travel/en/responsible-travel-guide/japanese-customs-and-etiquette/','2026-10-11','6'),
('tokyo-access','tokyo','access','Plan a step-free route','Check the station map for elevators and accessible entrances before setting out. The nearest exit may use stairs; allow time to reach the lift exit and ask station staff for assistance.','Tokyo Metro · Visitor tips','https://www.tokyometro.jp/en/tips/','2026-10-11','7'),
('kozhikode-airport','kozhikode','airport','Arriving at Calicut Airport','Calicut International Airport (CCJ) serves Kozhikode. Use the official arrival information or staffed transport counter to arrange onward travel. Confirm your exact hotel address and the fare basis before leaving.','Kozhikode District · How to reach','https://kozhikode.nic.in/en/tourism/how-to-reach/','2026-10-11','1'),
('kozhikode-transport','kozhikode','transport','Trains & local buses','Kozhikode railway station uses the code CLT. Reserved trains and bookable intercity buses have separate booking systems. For local buses, confirm the destination and boarding point with staff; reservation portals do not list every city bus.','Kozhikode District · Travel information','https://kozhikode.nic.in/en/tourism/how-to-reach/','2026-10-11','2'),
('kozhikode-taxi','kozhikode','taxi','Taxis & auto-rickshaws','Uber lists Uber Go service in Kozhikode. Enter your pickup and destination to see current availability and the offered price. At a local taxi or auto stand, confirm the destination, fare basis and payment method before boarding.','Uber · Kozhikode','https://www.uber.com/in/en/r/cities/taxi/kozhikode-kerala-in/','2026-10-11','3'),
('kozhikode-payments','kozhikode','payments','Paying for everyday things','Keep some rupees for small purchases and local transport. Check whether a business accepts your card before ordering. A displayed UPI code does not guarantee that your foreign bank account or phone can use it.','Kerala Tourism · Travel tips','https://www.keralatourism.org/travel-tips/','2026-10-11','4'),
('kozhikode-etiquette','kozhikode','etiquette','Visiting respectfully','Follow dress and photography rules at religious sites and ask before photographing people. Ask your host or staff about local customs when you are unsure.','Kerala Tourism · Visitor guidelines','https://www.keralatourism.org/guidelines/','2026-10-11','5'),
('kozhikode-access','kozhikode','access','Ask about step-free access','Confirm entrance steps, lifts and boarding assistance directly with your accommodation or transport provider. Accessibility information is incomplete for many local stops; do not assume every entrance or vehicle is step-free.','Kerala Tourism · Travel tips','https://www.keralatourism.org/travel-tips/','2026-10-11','6')
on conflict(id) do update set city=excluded.city,section=excluded.section,title=excluded.title,body=excluded.body,source=excluded.source,url=excluded.url,checked_on=excluded.checked_on,sort_order=excluded.sort_order;
notify pgrst, 'reload schema';

$migration$;
end if;
insert into travelx_private.migrations values('202610110003_seed_catalog') on conflict do nothing;
end $phase$;
commit;
