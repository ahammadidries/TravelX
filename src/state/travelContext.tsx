import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type PropsWithChildren,
} from 'react';
import { cities, type CityKey } from '@/data/cities';
import { isSupabaseConfigured, supabase } from '@/lib/supabase';
import { useAuth } from '@/state/AuthContext';

export type Preferences = {
  language: string;
  localNumber: string;
  payment: string;
  stepFree: boolean;
};
type TravelState = {
  cityKey: CityKey;
  preferences: Preferences;
  savedCities: CityKey[];
  savedAppIds: string[];
};
type TravelValue = TravelState & {
  city: (typeof cities)[CityKey];
  setCity: (city: CityKey) => void;
  setPreference: <K extends keyof Preferences>(key: K, value: Preferences[K]) => void;
  toggleSavedCity: (city?: CityKey) => Promise<void>;
  toggleSavedApp: (id: string) => Promise<void>;
  ready: boolean;
};
const TravelContext = createContext<TravelValue | null>(null);
const STORAGE_KEY = 'travelx.local-pack.v1';
const initial: TravelState = {
  cityKey: 'kozhikode',
  preferences: { language: 'English', localNumber: 'Not yet', payment: 'Both', stepFree: false },
  savedCities: [],
  savedAppIds: [],
};

export function TravelProvider({ children }: PropsWithChildren) {
  const { session, loading: authLoading } = useAuth();
  const [state, setState] = useState<TravelState>(initial);
  const [ready, setReady] = useState(false);
  const [remoteReady, setRemoteReady] = useState(false);
  const remoteUser = useRef<string | null>(null);
  useEffect(() => {
    let alive = true;
    void AsyncStorage.getItem(STORAGE_KEY)
      .then((value) => {
        if (!alive || !value) return;
        try {
          const stored = JSON.parse(value) as Partial<TravelState>;
          setState((s) => ({
            ...s,
            ...stored,
            cityKey: stored.cityKey && stored.cityKey in cities ? stored.cityKey : s.cityKey,
            preferences: { ...s.preferences, ...stored.preferences },
          }));
        } catch {
          void AsyncStorage.removeItem(STORAGE_KEY);
        }
      })
      .finally(() => {
        if (alive) setReady(true);
      });
    return () => {
      alive = false;
    };
  }, []);
  useEffect(() => {
    if (ready) void AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }, [ready, state]);
  useEffect(() => {
    if (!ready || authLoading) return;
    const userId = session?.user.id || null;
    if (!userId) {
      remoteUser.current = null;
      queueMicrotask(() => setRemoteReady(true));
      return;
    }
    if (!isSupabaseConfigured) {
      queueMicrotask(() => setRemoteReady(true));
      return;
    }
    if (remoteUser.current === userId) return;
    remoteUser.current = userId;
    queueMicrotask(() => setRemoteReady(false));
    let alive = true;
    void (async () => {
      const { data, error } = await supabase
        .from('travelx_packs')
        .select('*')
        .eq('user_id', userId)
        .maybeSingle();
      if (!alive) return;
      if (!error && data) {
        const citiesInPack = (data.saved_cities || []).filter(
          (x: string): x is CityKey => x in cities,
        );
        setState((s) => ({
          ...s,
          cityKey: citiesInPack.includes(s.cityKey) ? s.cityKey : citiesInPack[0] || s.cityKey,
          savedCities: citiesInPack,
          savedAppIds: (data.saved_apps || []) as string[],
          preferences: { ...s.preferences, ...data.preferences },
        }));
      }
      setRemoteReady(true);
    })();
    return () => {
      alive = false;
    };
  }, [ready, authLoading, session?.user.id]);
  useEffect(() => {
    if (!ready || !remoteReady || authLoading || !session?.user.id || !isSupabaseConfigured) return;
    void supabase
      .from('travelx_packs')
      .upsert(
        {
          user_id: session.user.id,
          saved_cities: state.savedCities,
          saved_apps: state.savedAppIds,
          preferences: state.preferences,
          updated_at: new Date().toISOString(),
        },
        { onConflict: 'user_id' },
      );
  }, [ready, remoteReady, authLoading, session?.user.id, state]);
  const setCity = useCallback((city: CityKey) => setState((s) => ({ ...s, cityKey: city })), []);
  const setPreference = useCallback(
    <K extends keyof Preferences>(key: K, value: Preferences[K]) =>
      setState((s) => ({ ...s, preferences: { ...s.preferences, [key]: value } })),
    [],
  );
  const toggleSavedCity = useCallback(
    async (city = state.cityKey) => {
      setState((s) => ({
        ...s,
        savedCities: s.savedCities.includes(city)
          ? s.savedCities.filter((x) => x !== city)
          : [...s.savedCities, city],
      }));
    },
    [state.cityKey],
  );
  const toggleSavedApp = useCallback(async (id: string) => {
    setState((s) => ({
      ...s,
      savedAppIds: s.savedAppIds.includes(id)
        ? s.savedAppIds.filter((x) => x !== id)
        : [...s.savedAppIds, id],
    }));
  }, []);
  const value = useMemo<TravelValue>(
    () => ({
      ...state,
      city: cities[state.cityKey],
      setCity,
      setPreference,
      toggleSavedCity,
      toggleSavedApp,
      ready,
    }),
    [state, setCity, setPreference, toggleSavedCity, toggleSavedApp, ready],
  );
  return <TravelContext.Provider value={value}>{children}</TravelContext.Provider>;
}
export function useTravel() {
  const value = useContext(TravelContext);
  if (!value) throw new Error('TravelProvider is missing');
  return value;
}
