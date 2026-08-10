import React, { useMemo } from 'react';
import { View, Text, StyleSheet, Pressable, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { useThemeColors, spacing, borderRadius, typography, shadows } from '../../../src/theme/theme';
import { GradientText } from '../../../src/components/GradientText';

export default function AIToolsScreen() {
  const router = useRouter();
  const themeColors = useThemeColors();
  const styles = useMemo(() => createStyles(themeColors), [themeColors]);

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <GradientText colors={themeColors.gradients.primary} style={styles.title}>
          🤖 AI Tools
        </GradientText>
        <Text style={styles.subtitle}>Powered by Hugging Face Models</Text>
      </View>

      <Pressable 
        style={({ pressed }) => [styles.cardWrap, pressed && styles.pressed]}
        onPress={() => router.push('/(tabs)/ai/disease')}
      >
        <LinearGradient
          colors={themeColors.cardGradients.default}
          style={[styles.card, { borderColor: themeColors.success + '60' }]}
        >
          <View style={styles.cardHeader}>
            <Text style={styles.emoji}>🍃</Text>
            <GradientText colors={['#10B981', '#34D399']} style={styles.cardTitle}>
              Disease Detection
            </GradientText>
          </View>
          <Text style={styles.cardDesc}>
            Upload a photo of a plant leaf to automatically detect diseases and get treatment recommendations.
          </Text>
        </LinearGradient>
      </Pressable>

      <Pressable 
        style={({ pressed }) => [styles.cardWrap, pressed && styles.pressed]}
        onPress={() => router.push('/(tabs)/ai/yield')}
      >
        <LinearGradient
          colors={themeColors.cardGradients.default}
          style={[styles.card, { borderColor: themeColors.info + '60' }]}
        >
          <View style={styles.cardHeader}>
            <Text style={styles.emoji}>📈</Text>
            <GradientText colors={['#A855F7', '#D946EF']} style={styles.cardTitle}>
              Yield Prediction
            </GradientText>
          </View>
          <Text style={styles.cardDesc}>
            Estimate your crop yield based on current sensor readings and plant growth stage.
          </Text>
        </LinearGradient>
      </Pressable>
    </ScrollView>
  );
}

const createStyles = (theme: any) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.background,
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
    color: theme.text,
  },
  subtitle: {
    ...typography.body,
    color: theme.textSecondary,
    marginTop: 4,
  },
  cardWrap: {
    marginBottom: spacing.lg,
    ...shadows.card,
  },
  card: {
    borderRadius: borderRadius.lg,
    padding: spacing.xl,
    borderWidth: 1,
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
    color: theme.text,
  },
  cardDesc: {
    ...typography.body,
    color: theme.textSecondary,
    lineHeight: 22,
  },
});
