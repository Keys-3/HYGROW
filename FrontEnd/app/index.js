/**
 * HyGrow — Entry Point (index)
 *
 * Role-based redirect:
 * - Customer → Market tab
 * - Farmer/Admin → Dashboard tab
 * - Not authenticated → Login
 */

import { useEffect } from 'react';
import { useRouter } from 'expo-router';
import { View, ActivityIndicator, StyleSheet, Text } from 'react-native';
import useAuth from '../src/hooks/useAuth';
import { colors } from '../src/theme/theme';

export default function Index() {
  const router = useRouter();
  const { user, isAuthenticated, authInitialized, loading } = useAuth();

  useEffect(() => {
    if (!authInitialized) return;

    if (isAuthenticated && user) {
      if (user.role === 'customer') {
        router.replace('/(tabs)/market');
      } else {
        router.replace('/(tabs)/dashboard');
      }
    } else {
      router.replace('/(auth)/login');
    }
  }, [authInitialized, isAuthenticated, user, router]);

  return (
    <View style={styles.container}>
      <ActivityIndicator size="large" color={colors.primary} />
      <Text style={styles.loadingText}>
        {loading ? 'Loading HyGrow...' : 'Checking session...'}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    color: colors.textSecondary,
    fontSize: 14,
  },
});
