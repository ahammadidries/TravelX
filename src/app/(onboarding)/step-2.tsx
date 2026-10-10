import { router } from 'expo-router';
import PreferenceScreen from '@/screens/travel/PreferenceScreen';
export default function StepTwo() {
  return <PreferenceScreen step={2} onContinue={() => router.push('/(onboarding)/step-3')} />;
}
