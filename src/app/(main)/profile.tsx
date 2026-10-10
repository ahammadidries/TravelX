import { useState } from 'react';
import { StyleSheet, Text, TextInput } from 'react-native';
import { router } from 'expo-router';
import { ActionButton, Heading, Note, Page } from '@/components/TravelUI';
import { useAuth } from '@/state/AuthContext';
import { friendlyError, supabase } from '@/lib/supabase';
import { colors } from '@/theme/colors';
import { fontFamily } from '@/theme/typography';

export default function ProfileRoute() {
  const { session, profile, error } = useAuth();
  if (session && !profile && !error)
    return (
      <Page>
        <Note>Loading your profile…</Note>
      </Page>
    );
  return <ProfileEditor key={session?.user.id || 'guest'} />;
}
function ProfileEditor() {
  const { session, profile, refreshProfile, error } = useAuth();
  const [name, setName] = useState(profile?.name || '');
  const [bio, setBio] = useState(profile?.bio || '');
  const [hometown, setHometown] = useState(profile?.hometown || '');
  const [notice, setNotice] = useState('');
  const [busy, setBusy] = useState(false);
  const save = async () => {
    if (!session || busy) return;
    if (!name.trim()) {
      setNotice('Add the name you want other travelers to see.');
      return;
    }
    setBusy(true);
    setNotice('');
    try {
      const result = await supabase.from('travelx_profiles').upsert({
        id: session.user.id,
        name: name.trim(),
        bio: bio.trim(),
        hometown: hometown.trim(),
      });
      if (result.error) throw result.error;
      await refreshProfile();
      setNotice('Your profile is saved.');
    } catch (e) {
      setNotice(friendlyError(e));
    } finally {
      setBusy(false);
    }
  };
  return (
    <Page>
      <Heading
        title="A little about you"
        subtitle="Your name helps people recognize you in Together."
      />
      {session ? (
        <>
          <Text style={styles.label}>DISPLAY NAME</Text>
          <TextInput
            accessibilityLabel="Display name"
            style={styles.input}
            value={name}
            onChangeText={setName}
            maxLength={60}
            placeholder="Your name"
            placeholderTextColor={colors.textSecondary}
          />
          <Text style={styles.label}>HOMETOWN · OPTIONAL</Text>
          <TextInput
            accessibilityLabel="Hometown"
            style={styles.input}
            value={hometown}
            onChangeText={setHometown}
            maxLength={80}
            placeholder="Where is home?"
            placeholderTextColor={colors.textSecondary}
          />
          <Text style={styles.label}>ABOUT YOU · OPTIONAL</Text>
          <TextInput
            accessibilityLabel="About you"
            style={[styles.input, styles.bio]}
            multiline
            value={bio}
            onChangeText={setBio}
            maxLength={300}
            placeholder="What do you like doing when you travel?"
            placeholderTextColor={colors.textSecondary}
          />
          <Note>
            {bio.length}/300 · These details are visible to signed-in travelers. Your email stays
            private.
          </Note>
          {notice || error ? (
            <Text accessibilityRole="alert" style={styles.notice}>
              {notice || error}
            </Text>
          ) : null}
          <ActionButton
            disabled={busy}
            label={busy ? 'Saving…' : 'Save profile'}
            onPress={() => void save()}
          />
          <ActionButton
            secondary
            label="Account & sign out"
            onPress={() => router.push('/(auth)/login')}
          />
        </>
      ) : (
        <ActionButton label="Sign in" onPress={() => router.push('/(auth)/login')} />
      )}
      <ActionButton secondary label="Back to city" onPress={() => router.replace('/(main)/city')} />
    </Page>
  );
}
const styles = StyleSheet.create({
  label: {
    fontFamily: fontFamily.semibold,
    fontSize: 11,
    letterSpacing: 1,
    color: colors.textSecondary,
    marginTop: 20,
    marginBottom: 10,
  },
  input: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    minHeight: 56,
    padding: 16,
    fontFamily: fontFamily.regular,
    fontSize: 15,
    color: colors.textPrimary,
  },
  bio: { minHeight: 140, textAlignVertical: 'top' },
  notice: {
    fontFamily: fontFamily.regular,
    fontSize: 13,
    lineHeight: 21,
    color: colors.textSecondary,
    marginVertical: 16,
  },
});
