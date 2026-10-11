import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  type PropsWithChildren,
} from 'react';
import { ActivityIndicator, View } from 'react-native';
import { cities, type CityKey } from '@/data/cities';
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
  ready: boolean;
  storageError: string | null;
  setCity: (city: CityKey) => void;
  setPreference: <K extends keyof Preferences>(key: K, value: Preferences[K]) => void;
  toggleSavedCity: (city?: CityKey) => Promise<void>;
  toggleSavedApp: (id: string) => Promise<void>;
  retrySave: () => Promise<void>;
};
const TravelContext = createContext<TravelValue | null>(null);
const initial: TravelState = {
  cityKey: 'kozhikode',
  preferences: { language: 'English', localNumber: 'Not yet', payment: 'Both', stepFree: false },
  savedCities: [],
  savedAppIds: [],
};
function restore(value: Partial<TravelState>): TravelState {
  return {
    cityKey: value.cityKey === 'tokyo' ? 'tokyo' : 'kozhikode',
    preferences: { ...initial.preferences, ...value.preferences },
    savedCities: Array.isArray(value.savedCities)
      ? value.savedCities.filter((x): x is CityKey => x === 'tokyo' || x === 'kozhikode')
      : [],
    savedAppIds: Array.isArray(value.savedAppIds)
      ? value.savedAppIds.filter((x) => typeof x === 'string')
      : [],
  };
}
export function TravelProvider({ children }: PropsWithChildren) {
  const [state, setState] = useState(initial);
  const [ready, setReady] = useState(false);
  const [storageError, setStorageError] = useState<string | null>(null);
  const current = useRef(initial);
  const queue = useRef(Promise.resolve());
  const storageKey = 'travelx.local-pack.v1';
  useEffect(() => {
    let alive = true;
    void (async () => {
      let next = initial;
      try {
        const local = await AsyncStorage.getItem(storageKey);
        const cached = local ? JSON.parse(local) : null;
        if (cached) next = restore(cached.state || cached);
      } catch {
        if (alive) setStorageError('Could not load saved items from this device.');
      }
      if (alive) {
        current.current = next;
        setState(next);
        setReady(true);
      }
    })();
    return () => {
      alive = false;
    };
  }, [storageKey]);
  const persist = useCallback(
    (next: TravelState) => {
      current.current = next;
      setState(next);
      // Serialize snapshots so a slow earlier request cannot overwrite a later change.
      const task = queue.current
        .catch(() => {})
        .then(async () => {
          await AsyncStorage.setItem(storageKey, JSON.stringify({ state: next }));
          setStorageError(null);
        })
        .catch((error) => {
          setStorageError('Could not save changes on this device. Please try again.');
          throw error;
        });
      queue.current = task;
      return task;
    },
    [storageKey],
  );
  const setCity = (cityKey: CityKey) => {
    void persist({ ...current.current, cityKey }).catch(() => {});
  };
  const setPreference = <K extends keyof Preferences>(key: K, value: Preferences[K]) => {
    void persist({
      ...current.current,
      preferences: { ...current.current.preferences, [key]: value },
    }).catch(() => {});
  };
  const toggleSavedCity = (key = current.current.cityKey) =>
    persist({
      ...current.current,
      savedCities: current.current.savedCities.includes(key)
        ? current.current.savedCities.filter((x) => x !== key)
        : [...current.current.savedCities, key],
    });
  const toggleSavedApp = (id: string) =>
    persist({
      ...current.current,
      savedAppIds: current.current.savedAppIds.includes(id)
        ? current.current.savedAppIds.filter((x) => x !== id)
        : [...current.current.savedAppIds, id],
    });
  if (!ready)
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
        <ActivityIndicator />
      </View>
    );
  return (
    <TravelContext.Provider
      value={{
        ...state,
        city: cities[state.cityKey],
        ready,
        storageError,
        setCity,
        setPreference,
        toggleSavedCity,
        toggleSavedApp,
        retrySave: () => persist(current.current),
      }}
    >
      {children}
    </TravelContext.Provider>
  );
}
export function useTravel() {
  const value = useContext(TravelContext);
  if (!value) throw new Error('TravelProvider is missing');
  return value;
}
