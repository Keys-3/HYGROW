/**
 * Farm Help — Dashboard Stack Layout
 */

import { Stack } from 'expo-router';
import { useThemeColors } from '../../../src/theme/theme';

export default function DashboardLayout() {
  const themeColors = useThemeColors();
  
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: themeColors.background },
        animation: 'slide_from_right',
      }}
    />
  );
}
