import { createContext, useContext, useMemo, useState, type PropsWithChildren } from 'react';

export type CityKey = 'tokyo' | 'kozhikode';
export type City = { key: CityKey; name: string; region: string; country: string; flag: string };

export const cities: Record<CityKey, City> = {
  tokyo: { key: 'tokyo', name: 'Tokyo', region: 'Tokyo', country: 'Japan', flag: '🇯🇵' },
  kozhikode: {
    key: 'kozhikode',
    name: 'Kozhikode',
    region: 'Kerala',
    country: 'India',
    flag: '🇮🇳',
  },
};

type Preferences = { language: string; localNumber: string; payment: string };
type TravelContextValue = {
  city: City;
  setCity: (city: CityKey) => void;
  preferences: Preferences;
  setPreference: (key: keyof Preferences, value: string) => void;
  saved: boolean;
  toggleSaved: () => void;
};

const TravelContext = createContext<TravelContextValue | null>(null);

export function TravelProvider({ children }: PropsWithChildren) {
  const [cityKey, setCityKey] = useState<CityKey>('kozhikode');
  const [preferences, setPreferences] = useState<Preferences>({
    language: 'English',
    localNumber: 'Not yet',
    payment: 'Both',
  });
  const [saved, setSaved] = useState(false);
  const value = useMemo(
    () => ({
      city: cities[cityKey],
      setCity: setCityKey,
      preferences,
      setPreference: (key: keyof Preferences, value: string) =>
        setPreferences((current) => ({ ...current, [key]: value })),
      saved,
      toggleSaved: () => setSaved((current) => !current),
    }),
    [cityKey, preferences, saved],
  );

  return <TravelContext.Provider value={value}>{children}</TravelContext.Provider>;
}

export function useTravel() {
  const context = useContext(TravelContext);
  if (!context) throw new Error('useTravel must be used within TravelProvider');
  return context;
}
