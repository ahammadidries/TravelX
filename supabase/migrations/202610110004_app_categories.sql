begin;
alter table public.travelx_apps drop constraint if exists travelx_apps_category_check;
alter table public.travelx_apps
  add constraint travelx_apps_category_check
  check (category in ('Transport','Taxi','Food','Groceries','Hotels','Connectivity','Utilities'));
notify pgrst, 'reload schema';
commit;
