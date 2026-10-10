import { router } from 'expo-router';
import PreferenceScreen from '@/screens/travel/PreferenceScreen';

export default function OnboardingStepOneRoute() {
  return <PreferenceScreen step={1} onContinue={() => router.push('/(onboarding)/step-2')} />;
}
