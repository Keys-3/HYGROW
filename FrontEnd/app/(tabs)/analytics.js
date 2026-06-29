import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable } from 'react-native';
import { colors, spacing, borderRadius, typography } from '../../src/theme/theme';
import useSensorData from '../../src/hooks/useSensorData';
import ChartWidget from '../../src/components/ChartWidget';
import { SENSOR_CONFIG, SENSOR_KEYS } from '../../src/utils/constants';
import { formatTime, formatDate } from '../../src/utils/helpers';

const TABS = ['24h', '7d'];

export default function AnalyticsScreen() {
  const { history, weekly } = useSensorData();
  const [timeRange, setTimeRange] = useState('24h');

  // Select dataset based on time range
  const dataset = timeRange === '24h' ? history : weekly;
  
  // Format labels (show 6 labels max)
  const formatLabel = (timestamp, i, total) => {
    if (total <= 6 || i % Math.floor(total / 6) === 0) {
      return timeRange === '24h' ? formatTime(timestamp) : formatDate(timestamp);
    }
    return '';
  };

  const getChartData = (sensorKey) => {
    if (!dataset || dataset.length === 0) return { data: [], labels: [] };
    
    // Use last 24 points for better rendering
    const points = dataset.slice(-24);
    return {
      data: points.map(r => r[sensorKey]),
      labels: points.map((r, i) => formatLabel(r.timestamp, i, points.length)),
    };
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <Text style={styles.title}>📊 Analytics</Text>
        <Text style={styles.subtitle}>Historical farm performance</Text>
      </View>

      <View style={styles.tabsContainer}>
        {TABS.map((tab) => (
          <Pressable
            key={tab}
            style={[styles.tab, timeRange === tab && styles.tabActive]}
            onPress={() => setTimeRange(tab)}
          >
            <Text style={[styles.tabText, timeRange === tab && styles.tabTextActive]}>
              {tab === '24h' ? 'Last 24 Hours' : 'Last 7 Days'}
            </Text>
          </Pressable>
        ))}
      </View>

      {SENSOR_KEYS.map((key) => {
        const config = SENSOR_CONFIG[key];
        const { data, labels } = getChartData(key);
        
        return (
          <View key={key} style={styles.chartWrapper}>
            <ChartWidget
              title={`${config.label} History`}
              data={data}
              labels={labels}
              color={config.color}
              yAxisSuffix={config.unit ? ` ${config.unit}` : ''}
              height={200}
              showDots={false}
            />
          </View>
        );
      })}
      
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
  title: {
    ...typography.h1,
  },
  subtitle: {
    ...typography.body,
    color: colors.textSecondary,
    marginTop: 4,
  },
  tabsContainer: {
    flexDirection: 'row',
    backgroundColor: colors.surface,
    borderRadius: borderRadius.md,
    padding: 4,
    marginBottom: spacing.xl,
    borderWidth: 1,
    borderColor: colors.border,
  },
  tab: {
    flex: 1,
    paddingVertical: spacing.sm,
    alignItems: 'center',
    borderRadius: borderRadius.sm,
  },
  tabActive: {
    backgroundColor: colors.surfaceLight,
  },
  tabText: {
    ...typography.bodySmall,
    color: colors.textSecondary,
    fontWeight: '600',
  },
  tabTextActive: {
    color: colors.text,
  },
  chartWrapper: {
    marginBottom: spacing.md,
  },
});
