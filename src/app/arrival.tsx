import { useLocalSearchParams } from 'expo-router';
import ArrivalScreen from '@/screens/travel/ArrivalScreen';

export default function ArrivalRoute() {
  const { step } = useLocalSearchParams<{ step?: string }>();
  return <ArrivalScreen step={step} />;
}
