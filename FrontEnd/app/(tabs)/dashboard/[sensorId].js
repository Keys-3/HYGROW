import React, { useMemo } from 'react';
import {
  ScrollView,
  View,
  Text,
  Pressable,
  StyleSheet,
} from 'react-native';

import { useLocalSearchParams, useRouter } from 'expo-router';

import ChartWidget from '../../../src/components/ChartWidget';
import useSensorData from '../../../src/hooks/useSensorData';

import {
  colors,
  spacing,
  borderRadius,
  typography,
  boxShadow,
} from '../../../src/theme/theme';

import {
  SENSOR_CONFIG,
  SENSOR_THRESHOLDS,
} from '../../../src/utils/constants';

export default function SensorDetailScreen() {
  const router = useRouter();
  const { sensorId } = useLocalSearchParams();

  const { current, history } = useSensorData();

  const config = SENSOR_CONFIG[sensorId];

  if (!config) {
    return (
      <View style={styles.center}>
        <Text>Sensor not found.</Text>
      </View>
    );
  }

  const threshold = SENSOR_THRESHOLDS?.[sensorId];

  const values = history
    .map((item) => Number(item?.[sensorId]))
    .filter((v) => !isNaN(v));

  const labels = history.map((item, index) =>
    index % 4 === 0 ? item.time : ''
  );

  const currentValue =
    current?.[sensorId] ?? 0;

  const stats = useMemo(() => {
    if (!values.length) {
      return {
        min: 0,
        max: 0,
        avg: 0,
      };
    }

    const min = Math.min(...values);
    const max = Math.max(...values);

    const avg =
      values.reduce((a, b) => a + b, 0) /
      values.length;

    return {
      min,
      max,
      avg,
    };
  }, [history]);

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      <Pressable
        style={styles.backButton}
        onPress={() => router.back()}
      >
        <Text style={styles.backText}>
          ← Back
        </Text>
      </Pressable>

      <View style={styles.header}>
        <Text style={styles.title}>
          {config.label}
        </Text>

        <Text style={styles.subtitle}>
          Live Sensor Analysis
        </Text>
      </View>

      <View style={styles.currentCard}>
        <Text style={styles.currentLabel}>
          Current Reading
        </Text>

        <Text
          style={[
            styles.currentValue,
            {
              color: config.color,
            },
          ]}
        >
          {currentValue.toFixed(1)}
        </Text>

        <Text style={styles.unit}>
          {config.unit}
        </Text>
      </View>

      <ChartWidget
        title={`${config.label} Trend`}
        data={values}
        labels={labels}
        color={config.color}
        unit={config.unit}
        height={240}
      />

      <Text style={styles.sectionTitle}>
        Statistics
      </Text>

      <View style={styles.statsRow}>
        <View style={styles.statCard}>
          <Text style={styles.statTitle}>
            Minimum
          </Text>

          <Text style={styles.statValue}>
            {stats.min.toFixed(1)}
            {config.unit}
          </Text>
        </View>

        <View style={styles.statCard}>
          <Text style={styles.statTitle}>
            Average
          </Text>

          <Text style={styles.statValue}>
            {stats.avg.toFixed(1)}
            {config.unit}
          </Text>
        </View>

        <View style={styles.statCard}>
          <Text style={styles.statTitle}>
            Maximum
          </Text>

          <Text style={styles.statValue}>
            {stats.max.toFixed(1)}
            {config.unit}
          </Text>
        </View>
      </View>

      {threshold && (
        <>
          <Text style={styles.sectionTitle}>
            Recommended Range
          </Text>

          <View style={styles.rangeCard}>
            <View style={styles.rangeRow}>
              <Text style={styles.rangeLabel}>
                Minimum
              </Text>

              <Text style={styles.rangeValue}>
                {threshold.min} {config.unit}
              </Text>
            </View>

            <View style={styles.rangeRow}>
              <Text style={styles.rangeLabel}>
                Maximum
              </Text>

              <Text style={styles.rangeValue}>
                {threshold.max} {config.unit}
              </Text>
            </View>
          </View>
        </>
      )}

      <View style={{ height: 40 }} />
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
    marginBottom: spacing.lg,
  },

  backButton: {
    marginBottom: spacing.md,
    alignSelf: 'flex-start',
  },

  backText: {
    ...typography.body,
    color: colors.primary,
    fontWeight: '600',
  },

  headerTitle: {
    ...typography.h1,
    marginBottom: 6,
  },

  headerDesc: {
    ...typography.bodySmall,
    color: colors.textSecondary,
  },

  valueCard: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    padding: spacing.xl,
    marginBottom: spacing.xl,
    borderWidth: 1,
    overflow: 'hidden',
    alignItems: 'center',
    ...shadows.card,
  },

  valueAccent: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    height: 5,
  },

  valueLabel: {
    ...typography.label,
    marginBottom: spacing.sm,
  },

  currentValue: {
    fontSize: 48,
    fontWeight: '700',
  },

  currentUnit: {
    fontSize: 18,
    fontWeight: '500',
  },

  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: spacing.md,
  },

  statusDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: 8,
  },

  statusText: {
    fontWeight: '700',
    fontSize: 15,
  },

  rangeText: {
    ...typography.caption,
    marginTop: spacing.sm,
    color: colors.textSecondary,
  },

  sectionTitle: {
    ...typography.h3,
    marginBottom: spacing.md,
  },

  chartContainer: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    marginBottom: spacing.xl,
    ...shadows.card,
  },

  emptyChartCard: {
    padding: spacing.xl,
    alignItems: 'center',
  },

  emptyChartText: {
    ...typography.body,
    color: colors.textSecondary,
  },

  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.xl,
  },

  statCard: {
    flex: 1,
    backgroundColor: colors.surface,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    alignItems: 'center',
    marginHorizontal: 4,
    ...shadows.small,
  },

  statLabel: {
    ...typography.caption,
    marginBottom: 6,
    color: colors.textSecondary,
  },

  statValue: {
    fontSize: 18,
    fontWeight: '700',
  },

  thresholdCard: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: colors.border,
  },

  thresholdRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.sm,
  },

  thresholdLabel: {
    ...typography.body,
  },

  thresholdValue: {
    fontWeight: '700',
  },
});