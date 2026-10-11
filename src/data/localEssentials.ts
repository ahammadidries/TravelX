import type { CityKey } from './cities';

export type Phrase = { local: string; meaning: string; pronunciation: string };

export const usefulPhrases: Record<CityKey, Phrase[]> = {
  tokyo: [
    { local: 'すみません', pronunciation: 'sumimasen', meaning: 'Excuse me / sorry' },
    { local: 'ありがとうございます', pronunciation: 'arigatō gozaimasu', meaning: 'Thank you' },
    { local: 'お願いします', pronunciation: 'onegaishimasu', meaning: 'Please' },
    {
      local: '駅はどこですか？',
      pronunciation: 'eki wa doko desu ka?',
      meaning: 'Where is the station?',
    },
    {
      local: 'お会計お願いします',
      pronunciation: 'o-kaikei onegaishimasu',
      meaning: 'The bill, please',
    },
  ],
  kozhikode: [
    { local: 'നമസ്കാരം', pronunciation: 'namaskāram', meaning: 'Hello / greetings' },
    { local: 'നന്ദി', pronunciation: 'nanni', meaning: 'Thank you' },
    { local: 'ദയവായി', pronunciation: 'dayavāyi', meaning: 'Please' },
    { local: 'ഇത് എത്രയാണ്?', pronunciation: 'ith ethrayāṇ?', meaning: 'How much is this?' },
    {
      local: 'സ്റ്റേഷൻ എവിടെയാണ്?',
      pronunciation: 'stēṣan evideyāṇ?',
      meaning: 'Where is the station?',
    },
  ],
};

export const localPracticalInfo: Record<CityKey, { toilets: string; plugs: string }> = {
  tokyo: {
    toilets:
      'Look in major rail and subway stations, department stores, museums and public facilities. Leave the space as you found it and follow the posted signs.',
    plugs:
      'Japan commonly uses Type A plugs at 100 V. Many modern chargers support 100–240 V; check your device label before plugging in.',
  },
  kozhikode: {
    toilets:
      'Start with major stations, shopping centres, hotels and staffed visitor facilities. Ask before using a restaurant or shop toilet.',
    plugs:
      'India commonly uses Type C, D and M sockets at 230 V. Check your charger label and carry an adapter that fits your device.',
  },
};
