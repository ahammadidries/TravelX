import { useState } from 'react';
import { router } from 'expo-router';
import { Modal, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { ActionButton, CityPill, Note } from '@/components/TravelUI';
import { useTravel } from '@/state/travelContext';
import { colors } from '@/theme/colors';
import { fontFamily } from '@/theme/typography';

type Panel = 'join' | 'create' | 'chat' | null;
export default function TogetherScreen() {
  const { city } = useTravel();
  const [panel, setPanel] = useState<Panel>(null);
  const [activity, setActivity] = useState('Coffee & a stroll');
  const [participants, setParticipants] = useState(2);
  const label = city.key === 'tokyo' ? 'Tokyo' : 'Kozhikode';

  return (
    <View style={styles.screen}>
      <View style={styles.map}>
        <View style={styles.water} />
        <View style={styles.roadOne} />
        <View style={styles.roadTwo} />
        <View style={styles.roadThree} />
        <View style={styles.greenOne} />
        <View style={styles.greenTwo} />
        <Text style={[styles.mapName, { left: '34%', top: '27%' }]}>
          {city.key === 'tokyo' ? 'Shibuya' : 'Koyilandy'}
        </Text>
        <Text
          style={[
            styles.mapName,
            { left: '50%', top: '55%', fontFamily: fontFamily.bold, color: '#25262F' },
          ]}
        >
          {label}
        </Text>
        <Text style={[styles.mapName, { right: '12%', top: '73%' }]}>
          {city.key === 'tokyo' ? 'Asakusa' : 'Beach'}
        </Text>
        <Pressable
          style={[styles.pin, { left: '35%', top: '36%' }]}
          onPress={() => setPanel('join')}
        >
          <Text style={styles.pinEmoji}>☕</Text>
        </Pressable>
        <Pressable
          style={[styles.pin, { left: '66%', top: '61%' }]}
          onPress={() => setPanel('join')}
        >
          <Text style={styles.pinEmoji}>🚶</Text>
        </Pressable>
        <View style={styles.mapHeader}>
          <View>
            <Text style={styles.mapTitle}>Together</Text>
            <CityPill onPress={() => router.push('/')} />
          </View>
          <Pressable style={styles.filter} onPress={() => setPanel('join')}>
            <Text>☷</Text>
          </Pressable>
        </View>
        <Note>Illustrative map preview</Note>
      </View>
      <View style={styles.controls}>
        <Pressable onPress={() => setPanel('join')} style={styles.listButton}>
          <Text style={styles.listText}>☷ See activity</Text>
        </Pressable>
        <Pressable onPress={() => setPanel('create')} style={styles.addButton}>
          <Text style={styles.addText}>＋</Text>
        </Pressable>
      </View>
      <View style={styles.card}>
        <View style={styles.cardTop}>
          <Text style={styles.eventEmoji}>☕</Text>
          <Pressable onPress={() => setPanel('join')}>
            <Text style={styles.more}>···</Text>
          </Pressable>
        </View>
        <Text style={styles.eventTitle}>{activity}</Text>
        <Text style={styles.eventMeta}>A small local meetup · {participants} going</Text>
        <View style={styles.people}>
          <View style={[styles.avatar, { backgroundColor: '#E5E3FF' }]}>
            <Text style={styles.avatarText}>S</Text>
          </View>
          <View style={[styles.avatar, { backgroundColor: '#DDF1FF' }]}>
            <Text style={styles.avatarText}>M</Text>
          </View>
        </View>
        <View style={styles.actions}>
          <Pressable style={styles.join} onPress={() => setPanel('join')}>
            <Text style={styles.joinText}>Join activity</Text>
          </Pressable>
          <Pressable style={styles.chat} onPress={() => setPanel('chat')}>
            <Text style={styles.chatText}>Chat</Text>
          </Pressable>
        </View>
      </View>
      <Modal
        transparent
        animationType="slide"
        visible={panel !== null}
        onRequestClose={() => setPanel(null)}
      >
        <View style={styles.backdrop}>
          <Pressable style={styles.dismissArea} onPress={() => setPanel(null)} />
          <View style={styles.sheet}>
            <View style={styles.sheetHandle} />
            <View style={styles.sheetHeader}>
              <Text style={styles.sheetTitle}>
                {panel === 'create'
                  ? 'New activity'
                  : panel === 'chat'
                    ? activity
                    : 'Activity details'}
              </Text>
              <Pressable onPress={() => setPanel(null)}>
                <Text style={styles.close}>×</Text>
              </Pressable>
            </View>
            {panel === 'create' ? (
              <>
                <Text style={styles.createEmoji}>🎉</Text>
                <Text style={styles.helper}>A simple way to meet up in {label}</Text>
                <Text style={styles.fieldLabel}>WANT TO</Text>
                <TextInput
                  value={activity}
                  onChangeText={setActivity}
                  placeholder="grab a coffee..."
                  placeholderTextColor="#9999A5"
                  style={styles.input}
                />
                <ActionButton
                  label="Create activity"
                  onPress={() => {
                    setParticipants(1);
                    setPanel(null);
                  }}
                />
              </>
            ) : panel === 'chat' ? (
              <>
                <View style={styles.chatMessage}>
                  <Text style={styles.messageText}>
                    You joined “{activity}”. Say hello to the group 👋
                  </Text>
                </View>
                <TextInput
                  placeholder="Message..."
                  placeholderTextColor="#9999A5"
                  style={styles.input}
                />
                <ActionButton label="Send message" onPress={() => setPanel(null)} />
              </>
            ) : (
              <>
                <Text style={styles.createEmoji}>☕</Text>
                <Text style={styles.activityName}>{activity}</Text>
                <Text style={styles.helper}>{participants} people going · Sample activity</Text>
                <View style={styles.people}>
                  <View style={[styles.avatar, { backgroundColor: '#E5E3FF' }]}>
                    <Text style={styles.avatarText}>S</Text>
                  </View>
                  <View style={[styles.avatar, { backgroundColor: '#DDF1FF' }]}>
                    <Text style={styles.avatarText}>M</Text>
                  </View>
                </View>
                <ActionButton
                  label={participants > 2 ? 'You’re in ✓' : 'I’m in'}
                  onPress={() => setParticipants((current) => current + 1)}
                />
                <ActionButton label="Open group chat" secondary onPress={() => setPanel('chat')} />
              </>
            )}
            <Text style={styles.safety}>
              Meet in a public place. Share only what you’re comfortable sharing.
            </Text>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#FFF' },
  map: { height: '55%', backgroundColor: '#E8F1E5', overflow: 'hidden' },
  water: {
    position: 'absolute',
    left: -180,
    top: -90,
    width: 340,
    height: 800,
    borderRadius: 220,
    backgroundColor: '#A9DFF1',
  },
  roadOne: {
    position: 'absolute',
    width: '120%',
    height: 14,
    top: '40%',
    left: '-5%',
    backgroundColor: '#FAF8EF',
    borderColor: '#D9D5C8',
    borderWidth: 1,
    transform: [{ rotate: '-30deg' }],
  },
  roadTwo: {
    position: 'absolute',
    width: '130%',
    height: 11,
    top: '60%',
    left: '-10%',
    backgroundColor: '#FAF8EF',
    borderColor: '#D9D5C8',
    borderWidth: 1,
    transform: [{ rotate: '42deg' }],
  },
  roadThree: {
    position: 'absolute',
    width: 12,
    height: '100%',
    left: '55%',
    top: '20%',
    backgroundColor: '#FAF8EF',
    borderColor: '#D9D5C8',
    borderWidth: 1,
    transform: [{ rotate: '18deg' }],
  },
  greenOne: {
    position: 'absolute',
    width: 92,
    height: 80,
    top: '23%',
    right: '8%',
    borderRadius: 48,
    backgroundColor: '#D1E7CE',
  },
  greenTwo: {
    position: 'absolute',
    width: 104,
    height: 84,
    bottom: '5%',
    left: '42%',
    borderRadius: 55,
    backgroundColor: '#D1E7CE',
  },
  mapName: { position: 'absolute', color: '#58636A', fontSize: 11, fontFamily: fontFamily.medium },
  pin: {
    position: 'absolute',
    width: 48,
    height: 48,
    borderRadius: 26,
    backgroundColor: '#FFF',
    elevation: 3,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pinEmoji: { fontSize: 23 },
  mapHeader: {
    position: 'absolute',
    top: 14,
    left: 18,
    right: 18,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  mapTitle: {
    backgroundColor: '#FFF',
    alignSelf: 'flex-start',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 24,
    fontFamily: fontFamily.bold,
    fontSize: 18,
    marginBottom: 8,
    overflow: 'hidden',
  },
  filter: {
    width: 44,
    height: 44,
    borderRadius: 24,
    backgroundColor: '#FFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  controls: {
    position: 'absolute',
    left: 22,
    right: 22,
    top: '46%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  listButton: {
    backgroundColor: '#FFF',
    borderRadius: 24,
    paddingVertical: 12,
    paddingHorizontal: 18,
    elevation: 2,
  },
  listText: { fontFamily: fontFamily.medium, color: '#24242A' },
  addButton: {
    width: 54,
    height: 54,
    borderRadius: 30,
    backgroundColor: colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
  },
  addText: { color: '#FFF', fontSize: 30, lineHeight: 34 },
  card: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 12,
    paddingBottom: 10,
    backgroundColor: '#FFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    marginTop: -20,
  },
  cardTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  eventEmoji: {
    backgroundColor: '#F5F5F7',
    overflow: 'hidden',
    borderRadius: 24,
    padding: 12,
    fontSize: 25,
  },
  more: { color: colors.textSecondary, fontSize: 25 },
  eventTitle: {
    color: colors.textPrimary,
    fontFamily: fontFamily.semibold,
    fontSize: 20,
    marginTop: 10,
  },
  eventMeta: {
    color: colors.textSecondary,
    fontFamily: fontFamily.regular,
    fontSize: 12,
    marginTop: 4,
  },
  people: { flexDirection: 'row', gap: 8, marginTop: 12 },
  avatar: {
    width: 34,
    height: 34,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: { color: colors.accent, fontFamily: fontFamily.bold },
  actions: { flexDirection: 'row', gap: 10, marginTop: 'auto' },
  join: {
    flex: 1.5,
    height: 48,
    borderRadius: 25,
    backgroundColor: colors.accent,
    justifyContent: 'center',
    alignItems: 'center',
  },
  joinText: { color: '#FFF', fontFamily: fontFamily.semibold },
  chat: {
    flex: 1,
    height: 48,
    borderRadius: 25,
    backgroundColor: colors.surface,
    justifyContent: 'center',
    alignItems: 'center',
  },
  chatText: { color: colors.textPrimary, fontFamily: fontFamily.semibold },
  backdrop: { flex: 1, justifyContent: 'flex-end', backgroundColor: '#0005' },
  dismissArea: { flex: 1 },
  sheet: {
    minHeight: 390,
    backgroundColor: '#FFF',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingHorizontal: 24,
    paddingTop: 10,
    paddingBottom: 28,
  },
  sheetHandle: {
    width: 38,
    height: 4,
    borderRadius: 4,
    alignSelf: 'center',
    backgroundColor: '#D1D1D6',
    marginBottom: 14,
  },
  sheetHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sheetTitle: { fontSize: 18, color: colors.textPrimary, fontFamily: fontFamily.semibold },
  close: { fontSize: 28, color: colors.textSecondary },
  createEmoji: {
    alignSelf: 'center',
    fontSize: 46,
    padding: 14,
    borderRadius: 38,
    backgroundColor: colors.surface,
    marginTop: 8,
  },
  helper: {
    textAlign: 'center',
    color: colors.textSecondary,
    fontFamily: fontFamily.regular,
    fontSize: 13,
    marginVertical: 12,
  },
  fieldLabel: {
    color: colors.textSecondary,
    fontFamily: fontFamily.semibold,
    fontSize: 11,
    marginTop: 8,
    marginBottom: 8,
  },
  input: {
    backgroundColor: colors.surface,
    minHeight: 54,
    borderRadius: 16,
    paddingHorizontal: 16,
    color: colors.textPrimary,
    fontFamily: fontFamily.regular,
    marginBottom: 10,
  },
  activityName: {
    textAlign: 'center',
    fontFamily: fontFamily.semibold,
    fontSize: 21,
    color: colors.textPrimary,
    marginTop: 8,
  },
  chatMessage: {
    alignSelf: 'flex-start',
    backgroundColor: colors.surface,
    padding: 14,
    borderRadius: 17,
    marginVertical: 18,
    maxWidth: '90%',
  },
  messageText: { color: colors.textPrimary, fontFamily: fontFamily.regular, fontSize: 14 },
  safety: {
    textAlign: 'center',
    color: colors.textSecondary,
    fontFamily: fontFamily.regular,
    fontSize: 10,
    marginTop: 12,
  },
});
