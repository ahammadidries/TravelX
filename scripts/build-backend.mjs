import { readFile, writeFile } from 'node:fs/promises';
import { runInNewContext } from 'node:vm';
import ts from 'typescript';

async function dataModule(path) {
  const source = await readFile(new URL(path, import.meta.url), 'utf8');
  const compiled = ts.transpileModule(source, {
    compilerOptions: { module: ts.ModuleKind.CommonJS },
  }).outputText;
  const exports = {};
  runInNewContext(compiled, { exports });
  return exports;
}
const { localApps } = await dataModule('../src/data/apps.ts');
const { cityGuides } = await dataModule('../src/data/guides.ts');
const quote = (value) => "'" + String(value).replaceAll("'", "''") + "'";
function insert(table, rows) {
  const columns = Object.keys(rows[0]);
  return `insert into public.${table} (${columns.join(',')}) values\n${rows.map((row) => '(' + columns.map((key) => quote(row[key])).join(',') + ')').join(',\n')}\non conflict(id) do update set ${columns
    .filter((key) => key !== 'id')
    .map((key) => `${key}=excluded.${key}`)
    .join(',')};\n`;
}
const apps = localApps.map((app, index) => ({
  ...app,
  checked_on: '2026-10-11',
  sort_order: index,
}));
const seed =
  '-- Generated from the researched, bundled app and guide catalog. No fabricated activities.\nbegin;\n' +
  insert('travelx_apps', apps) +
  insert('travelx_guides', cityGuides) +
  "notify pgrst, 'reload schema';\ncommit;\n";
await writeFile(
  new URL('../supabase/migrations/202610110003_seed_catalog.sql', import.meta.url),
  seed,
);
await writeFile(
  new URL('../supabase/migrations/202610110005_catalog_refresh.sql', import.meta.url),
  seed,
);
await writeFile(
  new URL('../supabase/migrations/202610110007_catalog_refresh.sql', import.meta.url),
  seed,
);
// One atomic, rerunnable setup file. Applied phases are recorded independently.
let setup =
  '-- Run this whole file in the Supabase SQL Editor. Safe to rerun.\nbegin;\ncreate schema if not exists travelx_private;\nrevoke all on schema travelx_private from public,anon,authenticated;\ncreate table if not exists travelx_private.migrations(version text primary key);\n';
for (const name of [
  '202610110001_travelx',
  '202610110002_catalog_and_activity_api',
  '202610110004_app_categories',
  '202610110006_catalog_categories',
  '202610110003_seed_catalog',
  '202610110005_catalog_refresh',
  '202610110007_catalog_refresh',
]) {
  let sql = await readFile(new URL(`../supabase/migrations/${name}.sql`, import.meta.url), 'utf8');
  sql = sql.replace(/^begin;\s*$/gm, '').replace(/^commit;\s*$/gm, '');
  const guard = name.startsWith('202610110001')
    ? "to_regclass('public.travelx_events') is null"
    : name.startsWith('202610110002')
      ? "to_regclass('public.travelx_apps') is null"
      : `not exists(select 1 from travelx_private.migrations where version=${quote(name)})`;
  setup += `\ndo $phase$ begin\nif ${guard} then\nexecute $migration$\n${sql}\n$migration$;\nend if;\ninsert into travelx_private.migrations values(${quote(name)}) on conflict do nothing;\nend $phase$;\n`;
}
setup += 'commit;\n';
await writeFile(new URL('../supabase/setup.sql', import.meta.url), setup);
console.log(
  `Prepared setup.sql with ${apps.length} provider entries and ${cityGuides.length} city guides.`,
);
