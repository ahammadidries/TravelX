import { Linking } from 'react-native';
export async function openLink(url: string) {
  if (!/^https:\/\//.test(url)) throw new Error('Unsupported link');
  await Linking.openURL(url);
}
export function mapsUrl(query: string) { return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`; }
