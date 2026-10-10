import { Alert as NativeAlert, Platform, type AlertButton } from 'react-native';

// React Native's Alert has no web dialog implementation.
export const Alert = {
  alert(title: string, message?: string, buttons?: AlertButton[]) {
    if (Platform.OS !== 'web') return NativeAlert.alert(title, message, buttons);
    const text = [title, message].filter(Boolean).join('\n\n');
    if (buttons?.length) {
      const action = buttons.find((button) => button.style !== 'cancel');
      if (globalThis.confirm(text)) action?.onPress?.();
      else buttons.find((button) => button.style === 'cancel')?.onPress?.();
    } else globalThis.alert(text);
  },
};
