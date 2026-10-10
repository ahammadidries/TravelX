import { createContext, useContext, useEffect, useState, type PropsWithChildren } from 'react';
import { AppState, Platform } from 'react-native';
import type { Session } from '@supabase/supabase-js';
import { supabase, friendlyError } from '@/lib/supabase';

export type Profile = { id: string; name: string; bio: string; hometown: string };
type AuthValue = {
  session: Session | null;
  profile: Profile | null;
  loading: boolean;
  error: string | null;
  refreshProfile: () => Promise<void>;
  signOut: () => Promise<void>;
};
const AuthContext = createContext<AuthValue | null>(null);
export function AuthProvider({ children }: PropsWithChildren) {
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const user = session?.user;
  useEffect(() => {
    let active = true;
    supabase.auth
      .getSession()
      .then(({ data, error }) => {
        if (active) {
          setSession(data.session);
          setLoading(false);
          if (error) setError(friendlyError(error));
        }
      })
      .catch((e) => {
        if (active) {
          setError(friendlyError(e));
          setLoading(false);
        }
      });
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, next) => {
      setSession(next);
      setProfile((current) => (current?.id === next?.user.id ? current : null));
    });
    const listener = AppState.addEventListener('change', (state) => {
      if (Platform.OS !== 'web') {
        if (state === 'active') supabase.auth.startAutoRefresh();
        else supabase.auth.stopAutoRefresh();
      }
    });
    return () => {
      active = false;
      subscription.unsubscribe();
      listener.remove();
    };
  }, []);
  useEffect(() => {
    let active = true;
    if (!user?.id) return;
    void (async () => {
      const { data, error } = await supabase
        .from('travelx_profiles')
        .select('*')
        .eq('id', user.id)
        .maybeSingle();
      if (error) {
        if (active) setError(friendlyError(error));
        return;
      }
      if (data) {
        if (active) {
          setProfile(data as Profile);
          setError(null);
        }
        return;
      }
      const name = String(user.user_metadata?.name || 'Traveler').slice(0, 60);
      const result = await supabase
        .from('travelx_profiles')
        .upsert({ id: user.id, name }, { onConflict: 'id', ignoreDuplicates: true })
        .select()
        .maybeSingle();
      if (active) {
        setProfile(result.data as Profile | null);
        setError(result.error ? friendlyError(result.error) : null);
      }
    })();
    return () => {
      active = false;
    };
  }, [user]);
  const refreshProfile = async () => {
    if (!session) return;
    const { data, error } = await supabase
      .from('travelx_profiles')
      .select('*')
      .eq('id', session.user.id)
      .single();
    if (error) throw error;
    setProfile(data as Profile);
    setError(null);
  };
  const signOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
    setProfile(null);
  };
  return (
    <AuthContext.Provider value={{ session, profile, loading, error, refreshProfile, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}
export function useAuth() {
  const value = useContext(AuthContext);
  if (!value) throw new Error('AuthProvider is missing');
  return value;
}
