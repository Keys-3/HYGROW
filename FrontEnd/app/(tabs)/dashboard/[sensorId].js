/**
 * Farm Help — Sensor Detail Screen
 *
 * Shows detailed chart and statistics for a single sensor.
 * Dynamic route: /dashboard/[sensorId]
 */

import { useLocalSearchParams, useRouter } from 'expo-router';
import { useMemo } from 'react';
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from 'react-native';
import { LineChart } from 'react-native-chart-kit';

import useSensorData from '../../../src/hooks/useSensorData';
import { borderRadius, colors, shadows, spacing, typography } from '../../../src/theme/theme';
import { SENSOR_CONFIG, SENSOR_THRESHOLDS } from '../../../src/utils/constants';
import {
  calcStats,
  formatSensorValue,
  formatTime,
  getSensorStatus,
  getStatusColor,
  getStatusLabel,
} from '../../../src/utils/helpers';

export default function SensorDetailScreen() {
  const { sensorId } = useLocalSearchParams();
  const router = useRouter();
  const { current, history } = useSensorData();
  const { width } = useWindowDimensions();

  const chartWidth = width - spacing.lg * 2;

  // Guard for array params from expo-router
  const resolvedSensorId = Array.isArray(sensorId) ? sensorId[0] : sensorId;

  const config = resolvedSensorId ? SENSOR_CONFIG[resolvedSensorId] : null;
  const threshold = resolvedSensorId ? SENSOR_THRESHOLDS[resolvedSensorId] : null;
  const currentValue = resolvedSensorId ? current?.[resolvedSensorId] : undefined;
  const status = resolvedSensorId ? getSensorStatus(resolvedSensorId, currentValue) : 'unknown';
  const statusColor = getStatusColor(status);

  // Prepare chart data
  const chartData = useMemo(() => {
    if (!resolvedSensorId || !config || !history || history.length === 0) return null;

    const values = history.map((r) => r?.[resolvedSensorId] ?? 0);

    // Support both history.time and history.timestamp
    const labels = history.map((r, i) => {
      if (i % 6 !== 0) return '';
      if (r?.timestamp) return formatTime(r.timestamp);
      if (r?.time) return r.time;
      return '';
    });

    return {
      labels,
      datasets: [
        {
          data: values,
          color: () => config.color || colors.primary,
          strokeWidth: 2,
        },
      ],
    };
  }, [history, resolvedSensorId, config]);

  // Calculate statistics
  const stats = useMemo(() => {
    if (!resolvedSensorId || !history || history.length === 0) {
      return { min: 0, max: 0, avg: 0 };
    }

    const values = history
      .map((r) => r?.[resolvedSensorId])
      .filter((v) => v != null && !Number.isNaN(v));

    return calcStats(values);
  }, [history, resolvedSensorId]);

  if (!resolvedSensorId || !config || !threshold) {
    return (
      <View style={styles.container}>
        <View style={styles.content}>
          <Pressable onPress={() => router.back()} style={styles.backButton}>
            <Text style={styles.backText}>← Back</Text>
          </Pressable>
          <Text style={styles.errorText}>Sensor not found</Text>
        </View>
      </View>
    );
  }

  const emoji =
    resolvedSensorId === 'temperature' ? '🌡️' :
    resolvedSensorId === 'humidity' ? '💧' :
    resolvedSensorId === 'ph' ? '🧪' :
    resolvedSensorId === 'ec' ? '⚡' :
    resolvedSensorId === 'lightIntensity' ? '☀️' :
    '🪣';

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      {/* Header */}
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.backButton}>
          <Text style={styles.backText}>← Back</Text>
        </Pressable>
        <Text style={styles.headerTitle}>
          {emoji} {config.label}
        </Text>
        {!!config.description && (
          <Text style={styles.headerDesc}>{config.description}</Text>
        )}
      </View>

      {/* Current Value Card */}
      <View style={[styles.valueCard, { borderColor: `${config.color}40` }]}>
        <View style={[styles.valueAccent, { backgroundColor: config.color }]} />
        <Text style={styles.valueLabel}>Current Reading</Text>
        <Text style={[styles.currentValue, { color: config.color }]}>
          {formatSensorValue(resolvedSensorId, currentValue)}
          <Text style={styles.currentUnit}> {config.unit}</Text>
        </Text>

        <View style={styles.statusRow}>
          <View style={[styles.statusDot, { backgroundColor: statusColor }]} />
          <Text style={[styles.statusText, { color: statusColor }]}>
            {getStatusLabel(status)}
          </Text>
        </View>

        <Text style={styles.rangeText}>
          Optimal: {threshold.min}
          {config.unit ? ` ${config.unit}` : ''} – {threshold.max}
          {config.unit ? ` ${config.unit}` : ''}
        </Text>
      </View>

      {/* Chart */}
      <Text style={styles.sectionTitle}>📈 24-Hour History</Text>
      {chartData ? (
        <View style={styles.chartContainer}>
          <LineChart
            data={chartData}
            width={chartWidth}
            height={220}
            chartConfig={{
              backgroundColor: colors.surface,
              backgroundGradientFrom: colors.surface,
              backgroundGradientTo: colors.background,
              decimalCount: 1,
              color: () => config.color,
              labelColor: () => colors.textMuted,
              propsForDots: {
                r: '3',
                strokeWidth: '1',
                stroke: config.color,
              },
              propsForBackgroundLines: {
                stroke: colors.border,
                strokeDasharray: '5,5',
              },
              style: {
                borderRadius: borderRadius.lg,
              },
            }}
            bezier
            style={styles.chart}
            withInnerLines
            withOuterLines={false}
            withVerticalLines={false}
            yAxisSuffix={config.unit ? ` ${config.unit}` : ''}
            fromZero={false}
          />
        </View>
      ) : (
        <View style={styles.emptyChartCard}>
          <Text style={styles.emptyChartText}>No history available yet</Text>
        </View>
      )}

      {/* Statistics */}
      <Text style={styles.sectionTitle}>📋 Statistics</Text>
      <View style={styles.statsGrid}>
        <View style={styles.statCard}>
          <Text style={styles.statLabel}>Minimum</Text>
          <Text style={[styles.statValue, { color: colors.info }]}>
            {formatSensorValue(resolvedSensorId, stats.min)}
            <Text style={styles.statUnit}> {config.unit}</Text>
          </Text>
        </View>

        <View style={styles.statCard}>
          <Text style={styles.statLabel}>Maximum</Text>
          <Text style={[styles.statValue, { color: colors.danger }]}>
            {formatSensorValue(resolvedSensorId, stats.max)}
            <Text style={styles.statUnit}> {config.unit}</Text>
          </Text>
        </View>

        <View style={styles.statCard}>
          <Text style={styles.statLabel}>Average</Text>
          <Text style={[styles.statValue, { color: colors.primary }]}>
            {formatSensorValue(resolvedSensorId, stats.avg)}
            <Text style={styles.statUnit}> {config.unit}</Text>
          </Text>
        </View>
      </View>

      {/* Threshold Info */}
      <Text style={styles.sectionTitle}>🎯 Thresholds</Text>
      <View style={styles.thresholdCard}>
        <View style={styles.thresholdRow}>
          <Text style={styles.thresholdLabel}>Optimal Range</Text>
          <Text style={[styles.thresholdValue, { color: colors.success }]}>
            {threshold.min} – {threshold.max} {config.unit}
          </Text>
        </View>

        <View style={styles.thresholdRow}>
          <Text style={styles.thresholdLabel}>Warning Range</Text>
          <Text style={[styles.thresholdValue, { color: colors.warning }]}>
            {'<'}{threshold.min} or {'>'}{threshold.max} {config.unit}
          </Text>
        </View>

        <View style={styles.thresholdRow}>
          <Text style={styles.thresholdLabel}>Critical Range</Text>
          <Text style={[styles.thresholdValue, { color: colors.danger }]}>
            {'<'}{threshold.criticalMin} or {'>'}{threshold.criticalMax} {config.unit}
          </Text>
        </View>
      </View>

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
  errorText: {
    ...typography.body,
    textAlign: 'center',
    marginTop: 100,
  },

  // Header
  header: {
    marginBottom: spacing.lg,
  },
  backButton: {
    marginBottom: spacing.md,
  },
  backText: {
    ...typography.body,
    color: colors.primary,
    fontWeight: '600',
  },
  headerTitle: {
    ...typography.h1,
  },
  headerDesc: {
    ...typography.bodySmall,
    marginTop: 4,
  },

  // Value Card
  valueCard: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    padding: spacing.xl,
    marginBottom: spacing.lg,
    borderWidth: 1,
    overflow: 'hidden',
    alignItems: 'center',
    ...shadows.card,
  },
  valueAccent: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 4,
  },
  valueLabel: {
    ...typography.label,
    marginBottom: spacing.sm,
  },
  currentValue: {
    fontSize: 52,
    fontWeight: '700',
  },
  currentUnit: {
    fontSize: 20,
    fontWeight: '400',
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: spacing.sm,
  },
  statusDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  statusText: {
    fontSize: 14,
    fontWeight: '600',
  },
  rangeText: {
    ...typography.caption,
    marginTop: spacing.sm,
  },

  // Chart
  sectionTitle: {
    ...typography.h3,
    marginBottom: spacing.md,
  },
  chartContainer: {
    marginBottom: spacing.lg,
    borderRadius: borderRadius.lg,
    overflow: 'hidden',
  },
  chart: {
    borderRadius: borderRadius.lg,
  },
  emptyChartCard: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    alignItems: 'center',
    marginBottom: spacing.lg,
    ...shadows.small,
  },
  emptyChartText: {
    ...typography.bodySmall,
    color: colors.textMuted,
  },

  // Stats
  statsGrid: {
    flexDirection: 'row',
    gap: spacing.md,
    marginBottom: spacing.lg,
  },
  statCard: {
    flex: 1,
    backgroundColor: colors.surface,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    alignItems: 'center',
    ...shadows.small,
  },
  statLabel: {
    ...typography.caption,
    marginBottom: 4,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  statValue: {
    fontSize: 18,
    fontWeight: '700',
  },
  statUnit: {
    fontSize: 11,
    fontWeight: '400',
  },

  // Thresholds
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
    fontSize: 14,
  },
  thresholdValue: {
    fontSize: 14,
    fontWeight: '600',
  },
});