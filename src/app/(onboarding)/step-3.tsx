import { router } from 'expo-router';
import PreferenceScreen from '@/screens/travel/PreferenceScreen';
export default function StepThree() {
  return <PreferenceScreen step={3} onContinue={() => router.replace('/(main)/city')} />;
}
