import React from 'react';
import { View, Text, StyleSheet, Pressable, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { colors, spacing, borderRadius, typography, shadows } from '../../../src/theme/theme';

export default function AIToolsScreen() {
  const router = useRouter();

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <Text style={styles.title}>🤖 AI Tools</Text>
        <Text style={styles.subtitle}>Powered by Hugging Face Models</Text>
      </View>

      <Pressable 
        style={({ pressed }) => [styles.card, styles.diseaseCard, pressed && styles.pressed]}
        onPress={() => router.push('/(tabs)/ai/disease')}
      >
        <View style={styles.cardHeader}>
          <Text style={styles.emoji}>🍃</Text>
          <Text style={styles.cardTitle}>Disease Detection</Text>
        </View>
        <Text style={styles.cardDesc}>
          Upload a photo of a plant leaf to automatically detect diseases and get treatment recommendations.
        </Text>
      </Pressable>

      <Pressable 
        style={({ pressed }) => [styles.card, styles.yieldCard, pressed && styles.pressed]}
        onPress={() => router.push('/(tabs)/ai/yield')}
      >
        <View style={styles.cardHeader}>
          <Text style={styles.emoji}>📈</Text>
          <Text style={styles.cardTitle}>Yield Prediction</Text>
        </View>
        <Text style={styles.cardDesc}>
          Estimate your crop yield based on current sensor readings and plant growth stage.
        </Text>
      </Pressable>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    padding: spacing.lg,
    paddingTop: 60,
  },
  header: {
    marginBottom: spacing.xl,
  },
  title: {
    ...typography.h1,
  },
  subtitle: {
    ...typography.body,
    color: colors.textSecondary,
    marginTop: 4,
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    padding: spacing.xl,
    marginBottom: spacing.lg,
    borderWidth: 1,
    ...shadows.card,
  },
  diseaseCard: {
    borderColor: colors.success + '50',
  },
  yieldCard: {
    borderColor: colors.info + '50',
  },
  pressed: {
    opacity: 0.8,
    transform: [{ scale: 0.98 }],
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  emoji: {
    fontSize: 32,
    marginRight: spacing.sm,
  },
  cardTitle: {
    ...typography.h2,
  },
  cardDesc: {
    ...typography.body,
    color: colors.textSecondary,
    lineHeight: 22,
  },
});
