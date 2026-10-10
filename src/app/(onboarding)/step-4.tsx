import { router } from 'expo-router';
import PreferenceScreen from '@/screens/travel/PreferenceScreen';
export default function StepFour() {
  return <PreferenceScreen step={4} onContinue={() => router.replace('/(main)/city')} />;
}
