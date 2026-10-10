import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { PGlite } from '@electric-sql/pglite';

// Local PostgreSQL executes the actual setup SQL. Auth roles/UID emulate Supabase;
// HTTP, email delivery and Realtime delivery still require a deployed project.
const db = new PGlite();
const host = '00000000-0000-0000-0000-000000000001';
const guest = '00000000-0000-0000-0000-000000000002';
const outsider = '00000000-0000-0000-0000-000000000003';
await db.exec(`
  create role anon; create role authenticated;
  create schema auth;
  create table auth.users(id uuid primary key,raw_user_meta_data jsonb default '{}');
  create function auth.uid() returns uuid language sql stable as $$
    select nullif(current_setting('request.jwt.claim.sub',true),'')::uuid;
  $$;
  grant usage on schema public,auth to anon,authenticated;
  grant execute on function auth.uid() to anon,authenticated;
  create publication supabase_realtime;
`);
const setup = await readFile(new URL('../supabase/setup.sql', import.meta.url), 'utf8');
await db.exec(setup);
await db.exec(setup);
console.log('PASS: atomic setup runs twice without duplicate schema/data');
await db.exec(
  `insert into auth.users(id,raw_user_meta_data) values ('${host}','{"name":"Host"}'),('${guest}','{"name":"Guest"}'),('${outsider}','{}');`,
);
assert.equal((await db.query('select count(*)::int as n from travelx_profiles')).rows[0].n, 3);
console.log('PASS: signup trigger creates profiles');

async function asUser(id, run) {
  await db.exec(`set role ${id ? 'authenticated' : 'anon'};`);
  await db.query("select set_config('request.jwt.claim.sub',$1,false)", [id || '']);
  try {
    return await run();
  } finally {
    await db.exec("reset role; select set_config('request.jwt.claim.sub','',false);");
  }
}
async function denied(run) {
  await assert.rejects(run);
}
let event;
await asUser(null, async () => {
  assert.equal((await db.query('select count(*)::int as n from travelx_apps')).rows[0].n, 13);
  assert.equal((await db.query('select count(*)::int as n from travelx_guides')).rows[0].n, 13);
  await denied(() => db.exec('delete from travelx_apps'));
  await denied(() => db.exec('select * from travelx_packs'));
});
console.log('PASS: visitor catalog readable, edits and account packs protected');
await asUser(host, async () => {
  await db.query('insert into travelx_packs(user_id,saved_cities) values($1,$2)', [
    host,
    ['tokyo'],
  ]);
  event = (
    await db.query(
      `select travelx_create_event('tokyo','Coffee and a stroll','☕','','Ueno Park',35.71,139.77,now()+interval '1 hour',2) as id`,
    )
  ).rows[0].id;
  await db.query('insert into travelx_messages(event_id,user_id,body) values($1,$2,$3)', [
    event,
    host,
    'Meet at the entrance',
  ]);
});
await asUser(guest, async () => {
  assert.equal((await db.query('select * from travelx_packs')).rows.length, 0);
  await denied(() => db.query('insert into travelx_packs(user_id) values($1)', [host]));
  assert.equal((await db.query('select * from travelx_messages')).rows.length, 0);
  assert.equal((await db.query('select * from travelx_members')).rows.length, 0);
  const summary = (await db.query("select * from travelx_event_summaries('tokyo')")).rows[0];
  assert.equal(Number(summary.member_count), 1);
  assert.equal(summary.is_member, false);
  await denied(() => db.query('select travelx_cancel_event($1)', [event]));
  await db.query('select travelx_join_event($1)', [event]);
  await db.query('select travelx_join_event($1)', [event]);
  assert.equal((await db.query('select * from travelx_members')).rows.length, 2);
  assert.equal((await db.query('select * from travelx_messages')).rows.length, 1);
  await db.query("select travelx_rsvp($1,'maybe')", [event]);
  await denied(() => db.query("select travelx_rsvp($1,'invalid')", [event]));
  await denied(() =>
    db.query('insert into travelx_messages(event_id,user_id,body) values($1,$2,$3)', [
      event,
      host,
      'Impersonation',
    ]),
  );
});
console.log(
  'PASS: pack isolation, private chat, idempotent join, RSVP validation, host-only cancellation',
);
await asUser(outsider, async () => {
  await denied(() => db.query('select travelx_join_event($1)', [event]));
  await denied(() => db.query('select travelx_remove_member($1,$2)', [event, guest]));
});
await asUser(null, async () => {
  const row = (await db.query("select * from travelx_event_summaries('tokyo')")).rows[0];
  assert.equal(Number(row.member_count), 2);
  assert.equal(row.is_member, false);
});
await asUser(host, () => db.query('select travelx_remove_member($1,$2)', [event, guest]));
await asUser(guest, async () => {
  await denied(() => db.query('select travelx_join_event($1)', [event]));
  assert.equal((await db.query('select * from travelx_messages')).rows.length, 0);
  await denied(() =>
    db.query('insert into travelx_messages(event_id,user_id,body) values($1,$2,$3)', [
      event,
      guest,
      'After removal',
    ]),
  );
});
console.log(
  'PASS: capacity enforced, anonymous counts correct, removal persists and revokes chat access',
);
await asUser(outsider, async () => {
  await db.query('insert into travelx_blocks(user_id,blocked_id) values($1,$2)', [outsider, host]);
  assert.equal((await db.query("select * from travelx_event_summaries('tokyo')")).rows.length, 0);
  await denied(() => db.query('select travelx_join_event($1)', [event]));
});
await asUser(host, () => db.query('select travelx_cancel_event($1)', [event]));
await asUser(null, async () =>
  assert.equal((await db.query("select * from travelx_event_summaries('tokyo')")).rows.length, 0),
);
console.log('PASS: blocks and cancellations hide activity listings');
await db.close();
