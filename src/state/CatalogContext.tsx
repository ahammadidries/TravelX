import { createContext, useContext, useEffect, useState, type PropsWithChildren } from 'react';
import { localApps, type LocalApp } from '@/data/apps';
import { cityGuides, type CityGuide } from '@/data/guides';
import { isSupabaseConfigured, supabase } from '@/lib/supabase';

type Catalog = {
  apps: LocalApp[];
  guides: CityGuide[];
  source: 'bundled' | 'supabase';
  loading: boolean;
};
const fallback: Catalog = { apps: localApps, guides: cityGuides, source: 'bundled', loading: true };
const CatalogContext = createContext(fallback);
export function CatalogProvider({ children }: PropsWithChildren) {
  const [catalog, setCatalog] = useState(fallback);
  useEffect(() => {
    let active = true;
    void (async () => {
      if (!isSupabaseConfigured) {
        if (active) setCatalog({ ...fallback, loading: false });
        return;
      }
      const [apps, guides] = await Promise.all([
        supabase.from('travelx_apps').select('*').order('sort_order'),
        supabase.from('travelx_guides').select('*').order('sort_order'),
      ]);
      if (!active) return;
      if (apps.error || guides.error) {
        setCatalog({ ...fallback, loading: false });
        return;
      }
      setCatalog({
        apps: (apps.data || []) as LocalApp[],
        guides: (guides.data || []) as CityGuide[],
        source: 'supabase',
        loading: false,
      });
    })().catch(() => {
      if (active) setCatalog({ ...fallback, loading: false });
    });
    return () => {
      active = false;
    };
  }, []);
  return <CatalogContext.Provider value={catalog}>{children}</CatalogContext.Provider>;
}
export const useCatalog = () => useContext(CatalogContext);
