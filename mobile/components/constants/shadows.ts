import { Platform, type ViewStyle } from 'react-native';
import { Colors } from '@/constants/colors';

function createShadow(
  webBoxShadow: string,
  nativeShadow: ViewStyle
): ViewStyle {
  if (Platform.OS === 'web') {
    return { boxShadow: webBoxShadow } as ViewStyle;
  }

  return nativeShadow;
}

export const Shadows = {
  card: createShadow('0px 2px 8px rgba(0, 0, 0, 0.08)', {
    shadowColor: Colors.neutral.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  }),
  soft: createShadow('0px 1px 4px rgba(0, 0, 0, 0.05)', {
    shadowColor: Colors.neutral.black,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  }),
};
