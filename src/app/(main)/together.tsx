import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { router } from 'expo-router';
import TogetherMap from '@/components/TogetherMap';
import { ActionButton, CityPill, Note } from '@/components/TravelUI';
import { cities } from '@/data/cities';
import { friendlyError, isSupabaseConfigured, supabase } from '@/lib/supabase';
import { useAuth } from '@/state/AuthContext';
import { useTravel } from '@/state/travelContext';
import { colors } from '@/theme/colors';
import { fontFamily } from '@/theme/typography';

type EventRecord = {
  id: string;
  city: 'tokyo' | 'kozhikode';
  title: string;
  emoji: string;
  description: string;
  location: string;
  latitude: number;
  longitude: number;
  starts_at: string;
  capacity: number;
  cancelled: boolean;
  host_id: string;
};
type ChatMessage = {
  id: string;
  user_id: string;
  body: string;
  pinned: boolean;
  created_at: string;
};
type Member = { user_id: string; rsvp: 'going' | 'maybe' | 'cant'; name?: string };
type Panel = 'create' | 'details' | 'chat' | null;
const emojiOptions = ['☕', '🚶', '🍜', '🏖️', '🎨', '🛍️', '🌿', '🎉'];
const dateLabel = (value: string) =>
  new Date(value).toLocaleString([], {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
const defaultStartTime = () => new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString();
const eventsSince = () => new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString();

export default function TogetherScreen() {
  const { city } = useTravel();
  const { session, profile } = useAuth();
  const meta = cities[city.key];
  const [events, setEvents] = useState<EventRecord[]>([]);
  const [counts, setCounts] = useState<Record<string, number>>({});
  const [mine, setMine] = useState<string[]>([]);
  const [loading, setLoading] = useState(isSupabaseConfigured);
  const [loadError, setLoadError] = useState(false);
  const [panel, setPanel] = useState<Panel>(null);
  const [selected, setSelected] = useState<EventRecord | null>(null);
  const [members, setMembers] = useState<Member[]>([]);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [draft, setDraft] = useState('');
  const [busy, setBusy] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [emoji, setEmoji] = useState('☕');
  const [placeName, setPlaceName] = useState('');
  const [capacity, setCapacity] = useState('6');
  const place = meta.meetingPlaces.find((p) => p.name === placeName) || meta.meetingPlaces[0]!;
  const loadMessages = useCallback(async (id: string) => {
    const { data, error } = await supabase
      .from('travelx_messages')
      .select('*')
      .eq('event_id', id)
      .order('created_at')
      .limit(100);
    if (error) {
      Alert.alert('Could not load chat', friendlyError(error));
      return;
    }
    setMessages((data || []) as unknown as ChatMessage[]);
  }, []);
  const loadEvents = useCallback(async () => {
    if (!isSupabaseConfigured) return;
    const { data, error } = await supabase
      .from('travelx_events')
      .select('*')
      .eq('city', city.key)
      .eq('cancelled', false)
      .gte('starts_at', eventsSince())
      .order('starts_at')
      .limit(50);
    if (error) {
      setLoadError(true);
      setLoading(false);
      return;
    }
    setLoadError(false);
    const rows = (data || []) as unknown as EventRecord[];
    setEvents(rows);
    if (rows.length) {
      const { data: joined } = await supabase
        .from('travelx_members')
        .select('event_id,user_id')
        .in(
          'event_id',
          rows.map((e) => e.id),
        );
      const memberships = (joined || []) as { event_id: string; user_id: string }[];
      const grouped: Record<string, number> = {};
      for (const m of memberships) grouped[m.event_id] = (grouped[m.event_id] || 0) + 1;
      setCounts(grouped);
      setMine(memberships.filter((m) => m.user_id === session?.user.id).map((m) => m.event_id));
    } else {
      setCounts({});
      setMine([]);
    }
    setLoading(false);
  }, [city.key, session?.user.id]);
  // This starts an async database request; its state updates follow the network response.
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void loadEvents();
  }, [loadEvents]);
  const activeEventId = selected?.id;
  useEffect(() => {
    if (panel !== 'chat' || !activeEventId) return;
    const channel = supabase
      .channel(`travelx-chat-${activeEventId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'travelx_messages',
          filter: `event_id=eq.${activeEventId}`,
        },
        () => void loadMessages(activeEventId),
      )
      .subscribe();
    return () => {
      void supabase.removeChannel(channel);
    };
  }, [panel, activeEventId, loadMessages]);
  const selectedIsHost = Boolean(selected && session?.user.id === selected.host_id);
  const isMember = Boolean(selected && mine.includes(selected.id));
  const loadDetails = useCallback(async (event: EventRecord) => {
    setSelected(event);
    setPanel('details');
    const { data } = await supabase
      .from('travelx_members')
      .select('user_id,rsvp')
      .eq('event_id', event.id);
    const raw = (data || []) as unknown as Member[];
    if (raw.length) {
      const { data: profiles } = await supabase
        .from('travelx_profiles')
        .select('id,name')
        .in(
          'id',
          raw.map((m) => m.user_id),
        );
      const names = (profiles || []) as { id: string; name: string }[];
      setMembers(
        raw.map((m) => ({ ...m, name: names.find((p) => p.id === m.user_id)?.name || 'Traveler' })),
      );
    } else setMembers([]);
  }, []);
  const openChat = async () => {
    if (!selected) return;
    if (!requireLogin()) return;
    if (!isMember) {
      Alert.alert('Join this activity first', 'The group chat is available to participants.');
      return;
    }
    setPanel('chat');
    await loadMessages(selected.id);
  };
  const requireLogin = () => {
    if (session) return true;
    Alert.alert('Sign in to continue', 'Create an account or sign in to join local activities.', [
      { text: 'Later', style: 'cancel' },
      { text: 'Sign in', onPress: () => router.push('/(auth)/login') },
    ]);
    return false;
  };
  const act = async (name: string, args: Record<string, unknown> = {}) => {
    if (!requireLogin()) return;
    setBusy(true);
    const { error } = await supabase.rpc(name, args as never);
    setBusy(false);
    if (error) {
      Alert.alert('Could not complete action', friendlyError(error));
      return;
    }
    await loadEvents();
    if (selected) {
      if (name === 'travelx_cancel_event') {
        setSelected(null);
        setPanel(null);
      } else await loadDetails(selected);
    }
  };
  const create = async () => {
    if (!requireLogin()) return;
    if (title.trim().length < 3) {
      Alert.alert('Add a short activity name', 'Use at least 3 characters.');
      return;
    }
    setBusy(true);
    const { error } = await supabase.rpc('travelx_create_event', {
      p_city: city.key,
      p_title: title.trim(),
      p_emoji: emoji,
      p_description: description.trim(),
      p_location: place.name,
      p_latitude: place.latitude,
      p_longitude: place.longitude,
      p_starts_at: defaultStartTime(),
      p_capacity: Math.max(2, Math.min(30, Number(capacity) || 6)),
    });
    setBusy(false);
    if (error) {
      Alert.alert('Could not create activity', friendlyError(error));
      return;
    }
    setPanel(null);
    setTitle('');
    setDescription('');
    await loadEvents();
  };
  const send = async () => {
    if (!selected || !draft.trim()) return;
    const body = draft.trim();
    setDraft('');
    const { error } = await supabase
      .from('travelx_messages')
      .insert({ event_id: selected.id, user_id: session!.user.id, body });
    if (error) {
      setDraft(body);
      Alert.alert('Message not sent', friendlyError(error));
      return;
    }
    await loadMessages(selected.id);
  };
  const displayEvents = useMemo(() => events, [events]);
  return (
    <View style={styles.screen}>
      <View style={styles.mapArea}>
        <TogetherMap
          city={meta}
          events={displayEvents}
          onSelect={(id) => {
            const event = displayEvents.find((item) => item.id === id);
            if (event) void loadDetails(event);
          }}
        />
        <View style={styles.mapHeader}>
          <View>
            <Text style={styles.mapTitle}>Together</Text>
            <CityPill onPress={() => router.push('/')} />
          </View>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Account"
            onPress={() => router.push('/(auth)/login')}
            style={styles.account}
          >
            <Text style={styles.accountText}>{profile?.name?.slice(0, 1) || '○'}</Text>
          </Pressable>
        </View>
      </View>
      <View style={styles.panel}>
        <View style={styles.listHeader}>
          <View>
            <Text style={styles.sectionTitle}>Meet someone nearby</Text>
            <Text style={styles.subhead}>{city.name} · public-place meetups</Text>
          </View>
          <Pressable
            accessibilityRole="button"
            onPress={() => {
              if (!requireLogin()) return;
              setPanel('create');
            }}
            style={styles.add}
          >
            <Text style={styles.addText}>＋</Text>
          </Pressable>
        </View>
        {loading ? <Text style={styles.stateText}>Finding activities…</Text> : null}
        {!loading && !displayEvents.length ? (
          <View style={styles.empty}>
            <Text style={styles.emptyEmoji}>☕</Text>
            <Text style={styles.emptyTitle}>
              {loadError ? 'Together is still being set up' : 'No meetups yet'}
            </Text>
            <Text style={styles.emptyCopy}>
              {!isSupabaseConfigured
                ? 'Add the Supabase project URL and publishable key to .env.local, then restart Expo.'
                : loadError
                  ? 'Run the SQL migration in supabase/migrations to enable Together.'
                  : `Create a small public meetup in ${city.name}. You choose the place and who can join.`}
            </Text>
            {!loadError && isSupabaseConfigured ? (
              <Pressable
                onPress={() => {
                  if (!requireLogin()) return;
                  setPanel('create');
                }}
                style={styles.createLink}
              >
                <Text style={styles.createLinkText}>Create an activity</Text>
              </Pressable>
            ) : null}
          </View>
        ) : null}
        <ScrollView contentContainerStyle={styles.eventList} showsVerticalScrollIndicator={false}>
          {displayEvents.map((event) => (
            <Pressable
              key={event.id}
              onPress={() => void loadDetails(event)}
              style={({ pressed }) => [styles.eventCard, pressed && { opacity: 0.75 }]}
            >
              <View style={styles.eventEmoji}>
                <Text>{event.emoji}</Text>
              </View>
              <View style={styles.eventCopy}>
                <Text numberOfLines={1} style={styles.eventTitle}>
                  {event.title}
                </Text>
                <Text numberOfLines={1} style={styles.eventMeta}>
                  {dateLabel(event.starts_at)} · {event.location}
                </Text>
                <Text style={styles.eventMeta}>
                  {counts[event.id] || 0} going · {event.capacity} spots
                </Text>
              </View>
              <Text style={styles.eventArrow}>›</Text>
            </Pressable>
          ))}
        </ScrollView>
        <Note>Meet in a public place. Share personal details only when you feel comfortable.</Note>
      </View>
      <Modal
        transparent
        animationType="slide"
        visible={panel !== null}
        onRequestClose={() => setPanel(null)}
      >
        <KeyboardAvoidingView
          style={styles.modalShade}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >
          <Pressable style={styles.dismiss} onPress={() => setPanel(null)} />
          <View style={[styles.sheet, panel === 'chat' && styles.chatSheet]}>
            <View style={styles.handle} />
            <View style={styles.sheetHeader}>
              <Text style={styles.sheetTitle}>
                {panel === 'create'
                  ? 'New activity'
                  : panel === 'chat'
                    ? 'Group chat'
                    : selected?.title || 'Activity details'}
              </Text>
              <Pressable onPress={() => setPanel(null)}>
                <Text style={styles.close}>×</Text>
              </Pressable>
            </View>
            {panel === 'create' ? (
              <ScrollView keyboardShouldPersistTaps="handled">
                <Text style={styles.emojiBig}>{emoji}</Text>
                <Text style={styles.formLabel}>CHOOSE A VIBE</Text>
                <View style={styles.emojiRow}>
                  {emojiOptions.map((x) => (
                    <Pressable
                      key={x}
                      onPress={() => setEmoji(x)}
                      style={[styles.emojiChoice, emoji === x && styles.emojiChoiceSelected]}
                    >
                      <Text style={{ fontSize: 22 }}>{x}</Text>
                    </Pressable>
                  ))}
                </View>
                <Text style={styles.formLabel}>WANT TO</Text>
                <TextInput
                  value={title}
                  onChangeText={setTitle}
                  maxLength={80}
                  placeholder="Grab a coffee…"
                  placeholderTextColor="#858592"
                  style={styles.input}
                />
                <Text style={styles.formLabel}>DETAILS (OPTIONAL)</Text>
                <TextInput
                  value={description}
                  onChangeText={setDescription}
                  maxLength={500}
                  multiline
                  placeholder="Add a little context"
                  placeholderTextColor="#858592"
                  style={[styles.input, styles.multiline]}
                />
                <Text style={styles.formLabel}>PUBLIC MEETING PLACE</Text>
                {meta.meetingPlaces.map((item) => (
                  <Pressable
                    key={item.name}
                    onPress={() => setPlaceName(item.name)}
                    style={[styles.placeRow, place.name === item.name && styles.placeSelected]}
                  >
                    <Text style={styles.placeName}>{item.name}</Text>
                    <Text style={styles.placeCheck}>{place.name === item.name ? '✓' : '○'}</Text>
                  </Pressable>
                ))}
                <Text style={styles.formLabel}>GROUP SIZE</Text>
                <View style={styles.capRow}>
                  {['4', '6', '10'].map((n) => (
                    <Pressable
                      key={n}
                      onPress={() => setCapacity(n)}
                      style={[styles.capChip, capacity === n && styles.capSelected]}
                    >
                      <Text style={[styles.capText, capacity === n && styles.capTextSelected]}>
                        {n} people
                      </Text>
                    </Pressable>
                  ))}
                </View>
                <Text style={styles.helper}>Starts in about 2 hours · {city.name} local time</Text>
                <ActionButton
                  label={busy ? 'Creating…' : 'Create activity'}
                  onPress={() => void create()}
                />
              </ScrollView>
            ) : null}
            {panel === 'details' && selected ? (
              <ScrollView>
                <Text style={styles.detailsEmoji}>{selected.emoji}</Text>
                <Text style={styles.detailsTitle}>{selected.title}</Text>
                <Text style={styles.detailsMeta}>
                  {dateLabel(selected.starts_at)} · {selected.location}
                </Text>
                {selected.description ? (
                  <Text style={styles.description}>{selected.description}</Text>
                ) : null}
                <Text style={styles.memberCount}>
                  {members.length} participant{members.length === 1 ? '' : 's'}
                </Text>
                {members.map((member) => (
                  <View key={member.user_id} style={styles.memberRow}>
                    <View style={styles.memberAvatar}>
                      <Text style={styles.memberAvatarText}>
                        {member.name?.slice(0, 1).toUpperCase()}
                      </Text>
                    </View>
                    <Text style={styles.memberName}>
                      {member.name}
                      {member.user_id === selected.host_id ? ' · host' : ''}
                      {member.user_id === session?.user.id ? ' · you' : ''}
                    </Text>
                    <Text style={styles.memberRsvp}>{member.rsvp}</Text>
                    {selectedIsHost && member.user_id !== session?.user.id ? (
                      <Pressable
                        onPress={() =>
                          Alert.alert(
                            'Remove participant?',
                            `Remove ${member.name} from this activity?`,
                            [
                              { text: 'Keep', style: 'cancel' },
                              {
                                text: 'Remove',
                                style: 'destructive',
                                onPress: () =>
                                  void act('travelx_remove_member', {
                                    p_event: selected.id,
                                    p_user: member.user_id,
                                  }),
                              },
                            ],
                          )
                        }
                      >
                        <Text style={styles.remove}>Remove</Text>
                      </Pressable>
                    ) : null}
                  </View>
                ))}
                {isMember ? (
                  <>
                    <Text style={styles.formLabel}>YOUR RSVP</Text>
                    <View style={styles.rsvpRow}>
                      {(['going', 'maybe', 'cant'] as const).map((status) => (
                        <Pressable
                          key={status}
                          onPress={() =>
                            void act('travelx_rsvp', { p_event: selected.id, p_status: status })
                          }
                          style={[
                            styles.rsvpChip,
                            members.find((m) => m.user_id === session?.user.id)?.rsvp === status &&
                              styles.rsvpSelected,
                          ]}
                        >
                          <Text style={styles.rsvpText}>
                            {status === 'cant'
                              ? 'Can’t go'
                              : status[0]!.toUpperCase() + status.slice(1)}
                          </Text>
                        </Pressable>
                      ))}
                    </View>
                    <ActionButton
                      secondary
                      label="Open group chat"
                      onPress={() => void openChat()}
                    />
                    {selectedIsHost ? (
                      <ActionButton
                        secondary
                        label="Cancel activity"
                        onPress={() =>
                          Alert.alert(
                            'Cancel this activity?',
                            'Participants will no longer be able to use the activity.',
                            [
                              { text: 'Keep', style: 'cancel' },
                              {
                                text: 'Cancel activity',
                                style: 'destructive',
                                onPress: () =>
                                  void act('travelx_cancel_event', { p_event: selected.id }),
                              },
                            ],
                          )
                        }
                      />
                    ) : (
                      <ActionButton
                        secondary
                        label="Leave activity"
                        onPress={() =>
                          Alert.alert('Leave this activity?', undefined, [
                            { text: 'Stay', style: 'cancel' },
                            {
                              text: 'Leave',
                              style: 'destructive',
                              onPress: () =>
                                void act('travelx_leave_event', { p_event: selected.id }),
                            },
                          ])
                        }
                      />
                    )}
                  </>
                ) : (
                  <ActionButton
                    label={busy ? 'Joining…' : 'Join activity'}
                    onPress={() => void act('travelx_join_event', { p_event: selected.id })}
                  />
                )}
                <Note>Choose a public place and arrange your own transport to the meetup.</Note>
              </ScrollView>
            ) : null}
            {panel === 'chat' && selected ? (
              <>
                <ScrollView style={styles.messageList} contentContainerStyle={{ gap: 9 }}>
                  {messages.map((message) => (
                    <View
                      key={message.id}
                      style={[
                        styles.bubble,
                        message.user_id === session?.user.id && styles.myBubble,
                      ]}
                    >
                      <Text style={styles.bubbleText}>{message.body}</Text>
                      <Text style={styles.messageTime}>
                        {new Date(message.created_at).toLocaleTimeString([], {
                          hour: 'numeric',
                          minute: '2-digit',
                        })}
                      </Text>
                      {selectedIsHost ? (
                        <Pressable
                          onPress={() =>
                            void supabase
                              .rpc('travelx_pin_message', {
                                p_message: message.id,
                                p_pinned: !message.pinned,
                              })
                              .then(({ error }) =>
                                error
                                  ? Alert.alert('Could not update', friendlyError(error))
                                  : void loadMessages(selected.id),
                              )
                          }
                        >
                          <Text style={styles.pinText}>{message.pinned ? 'Unpin' : 'Pin'}</Text>
                        </Pressable>
                      ) : null}
                    </View>
                  ))}
                </ScrollView>
                <View style={styles.composer}>
                  <TextInput
                    value={draft}
                    onChangeText={setDraft}
                    maxLength={300}
                    placeholder="Message the group…"
                    placeholderTextColor="#858592"
                    style={styles.messageInput}
                  />
                  <Pressable
                    accessibilityRole="button"
                    accessibilityLabel="Send message"
                    onPress={() => void send()}
                    style={styles.send}
                  >
                    <Text style={styles.sendText}>↑</Text>
                  </Pressable>
                </View>
              </>
            ) : null}
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.background },
  mapArea: { height: '40%', minHeight: 250, backgroundColor: '#DCEEE4', overflow: 'hidden' },
  mapHeader: {
    position: 'absolute',
    top: 12,
    left: 16,
    right: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  mapTitle: {
    alignSelf: 'flex-start',
    backgroundColor: '#FFFFFFED',
    paddingHorizontal: 16,
    paddingVertical: 9,
    borderRadius: 22,
    fontFamily: fontFamily.bold,
    fontSize: 17,
    color: colors.textPrimary,
    marginBottom: 8,
    overflow: 'hidden',
  },
  account: {
    width: 42,
    height: 42,
    borderRadius: 22,
    backgroundColor: '#FFF',
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 2,
  },
  accountText: { color: colors.accent, fontFamily: fontFamily.bold, fontSize: 17 },
  panel: {
    flex: 1,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    backgroundColor: '#FFF',
    marginTop: -20,
    paddingHorizontal: 20,
    paddingTop: 18,
    paddingBottom: 8,
  },
  listHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: { fontFamily: fontFamily.semibold, fontSize: 19, color: colors.textPrimary },
  subhead: {
    fontFamily: fontFamily.regular,
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 3,
  },
  add: {
    height: 46,
    width: 46,
    borderRadius: 25,
    backgroundColor: colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
  },
  addText: { fontSize: 28, lineHeight: 32, color: '#FFF' },
  eventList: { paddingBottom: 10 },
  eventCard: {
    minHeight: 72,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.divider,
  },
  eventEmoji: {
    width: 44,
    height: 44,
    borderRadius: 16,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: 22,
  },
  eventCopy: { flex: 1, gap: 3 },
  eventTitle: { fontFamily: fontFamily.semibold, fontSize: 14, color: colors.textPrimary },
  eventMeta: { fontFamily: fontFamily.regular, fontSize: 11, color: colors.textSecondary },
  eventArrow: { fontSize: 25, color: colors.textSecondary },
  empty: {
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 20,
    backgroundColor: colors.surface,
    borderRadius: 18,
  },
  emptyEmoji: { fontSize: 28 },
  emptyTitle: {
    fontFamily: fontFamily.semibold,
    fontSize: 16,
    color: colors.textPrimary,
    marginTop: 6,
  },
  emptyCopy: {
    fontFamily: fontFamily.regular,
    fontSize: 12,
    lineHeight: 18,
    textAlign: 'center',
    color: colors.textSecondary,
    marginTop: 5,
  },
  createLink: { paddingVertical: 10 },
  createLinkText: { fontFamily: fontFamily.semibold, color: colors.accent, fontSize: 13 },
  stateText: { color: colors.textSecondary, padding: 10 },
  modalShade: { flex: 1, justifyContent: 'flex-end', backgroundColor: '#0005' },
  dismiss: { flex: 1 },
  sheet: {
    maxHeight: '90%',
    backgroundColor: '#FFF',
    borderTopLeftRadius: 26,
    borderTopRightRadius: 26,
    paddingHorizontal: 22,
    paddingTop: 10,
    paddingBottom: 24,
  },
  chatSheet: { height: '82%' },
  handle: {
    width: 38,
    height: 4,
    borderRadius: 4,
    backgroundColor: '#D0D0D5',
    alignSelf: 'center',
    marginBottom: 14,
  },
  sheetHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sheetTitle: { fontFamily: fontFamily.semibold, fontSize: 18, color: colors.textPrimary },
  close: { fontSize: 28, color: colors.textSecondary, paddingHorizontal: 4 },
  emojiBig: { fontSize: 44, textAlign: 'center', marginVertical: 6 },
  formLabel: {
    fontFamily: fontFamily.semibold,
    fontSize: 10,
    letterSpacing: 0.7,
    color: colors.textSecondary,
    marginTop: 12,
    marginBottom: 7,
  },
  emojiRow: { flexDirection: 'row', justifyContent: 'space-between' },
  emojiChoice: {
    width: 39,
    height: 39,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surface,
  },
  emojiChoiceSelected: {
    borderColor: colors.accent,
    borderWidth: 1.5,
    backgroundColor: colors.accentMuted,
  },
  input: {
    backgroundColor: colors.surface,
    borderRadius: 14,
    minHeight: 49,
    paddingHorizontal: 14,
    color: colors.textPrimary,
    fontFamily: fontFamily.regular,
  },
  multiline: { height: 75, textAlignVertical: 'top', paddingTop: 12 },
  placeRow: {
    minHeight: 43,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
    borderRadius: 12,
    marginBottom: 6,
    backgroundColor: colors.surface,
  },
  placeSelected: {
    borderWidth: 1,
    borderColor: colors.accent,
    backgroundColor: colors.accentMuted,
  },
  placeName: { flex: 1, fontFamily: fontFamily.medium, fontSize: 12, color: colors.textPrimary },
  placeCheck: { color: colors.accent, fontSize: 16 },
  capRow: { flexDirection: 'row', gap: 8 },
  capChip: {
    paddingVertical: 9,
    paddingHorizontal: 14,
    borderRadius: 18,
    backgroundColor: colors.surface,
  },
  capSelected: { backgroundColor: colors.accentMuted },
  capText: { fontFamily: fontFamily.medium, fontSize: 12, color: colors.textSecondary },
  capTextSelected: { color: colors.accent },
  helper: {
    fontFamily: fontFamily.regular,
    fontSize: 11,
    color: colors.textSecondary,
    marginTop: 12,
  },
  detailsEmoji: { fontSize: 40, textAlign: 'center', marginTop: 4 },
  detailsTitle: {
    fontFamily: fontFamily.bold,
    fontSize: 22,
    textAlign: 'center',
    color: colors.textPrimary,
    marginTop: 7,
  },
  detailsMeta: {
    fontFamily: fontFamily.regular,
    fontSize: 12,
    textAlign: 'center',
    color: colors.textSecondary,
    marginTop: 5,
  },
  description: {
    fontFamily: fontFamily.regular,
    fontSize: 13,
    lineHeight: 20,
    color: colors.textPrimary,
    marginTop: 12,
  },
  memberCount: {
    fontFamily: fontFamily.semibold,
    fontSize: 13,
    color: colors.textPrimary,
    marginTop: 18,
    marginBottom: 7,
  },
  memberRow: {
    minHeight: 48,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 9,
    borderBottomWidth: 1,
    borderBottomColor: colors.divider,
  },
  memberAvatar: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: colors.accentMuted,
    alignItems: 'center',
    justifyContent: 'center',
  },
  memberAvatarText: { color: colors.accent, fontFamily: fontFamily.bold },
  memberName: { flex: 1, color: colors.textPrimary, fontFamily: fontFamily.medium, fontSize: 12 },
  memberRsvp: { fontSize: 10, color: colors.textSecondary },
  remove: { color: '#B33D45', fontFamily: fontFamily.medium, fontSize: 10, padding: 6 },
  rsvpRow: { flexDirection: 'row', gap: 6, justifyContent: 'space-between' },
  rsvpChip: {
    borderRadius: 17,
    backgroundColor: colors.surface,
    paddingHorizontal: 12,
    paddingVertical: 9,
  },
  rsvpSelected: { backgroundColor: colors.accentMuted },
  rsvpText: { fontFamily: fontFamily.medium, fontSize: 11, color: colors.textPrimary },
  messageList: { flex: 1 },
  bubble: {
    alignSelf: 'flex-start',
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: 12,
    maxWidth: '85%',
  },
  myBubble: { alignSelf: 'flex-end', backgroundColor: colors.accentMuted },
  bubbleText: {
    fontFamily: fontFamily.regular,
    fontSize: 13,
    color: colors.textPrimary,
    lineHeight: 19,
  },
  messageTime: { fontSize: 9, color: colors.textSecondary, textAlign: 'right', marginTop: 4 },
  pinText: { fontFamily: fontFamily.medium, fontSize: 10, color: colors.accent, marginTop: 4 },
  composer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 9,
    borderTopWidth: 1,
    borderTopColor: colors.divider,
    paddingTop: 10,
  },
  messageInput: {
    flex: 1,
    minHeight: 44,
    borderRadius: 23,
    backgroundColor: colors.surface,
    paddingHorizontal: 16,
    color: colors.textPrimary,
    fontFamily: fontFamily.regular,
  },
  send: {
    width: 42,
    height: 42,
    borderRadius: 22,
    backgroundColor: colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sendText: { fontSize: 23, color: '#FFF', lineHeight: 28 },
});
