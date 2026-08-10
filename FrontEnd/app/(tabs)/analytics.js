import React, { useMemo, useState } from 'react';
import {
  ScrollView,
  StyleSheet,
  Text,
  View,
  Pressable,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

import ChartWidget from '../../src/components/ChartWidget';
import useSensorData from '../../src/hooks/useSensorData';

import { useThemeColors, spacing, borderRadius, typography, shadows } from '../../src/theme/theme';
import { GradientText } from '../../src/components/GradientText';

import {
  SENSOR_KEYS,
  SENSOR_CONFIG,
} from '../../src/utils/constants';

const TABS = [
  { key: '24h', label: 'Last 24 Hours' },
  { key: '7d', label: 'Last 7 Days' },
];

const generateMockData = (count, timeFormat) => {
  return Array.from({ length: count }).map((_, i) => ({
    time: timeFormat === 'time' ? `${i.toString().padStart(2, '0')}:00` : undefined,
    date: timeFormat === 'date' ? `Day ${i + 1}` : undefined,
    temperature: (25 + Math.random() * 10).toFixed(1),
    humidity: (40 + Math.random() * 20).toFixed(1),
    ph: (5.5 + Math.random() * 1.0).toFixed(2),
    ec: (1.2 + Math.random() * 0.8).toFixed(1),
    waterLevel: (50 + Math.random() * 40).toFixed(1),
    lightIntensity: (800 + Math.random() * 400).toFixed(0),
  }));
};

const MOCK_24H = generateMockData(24, 'time');
const MOCK_7D = generateMockData(7, 'date');

export default function AnalyticsScreen() {
  const { history, weekly } = useSensorData();
  const themeColors = useThemeColors();
  const styles = useMemo(() => createStyles(themeColors), [themeColors]);

  const [selectedTab, setSelectedTab] = useState('24h');

  const dataset = useMemo(() => {
    let data = selectedTab === '24h' ? history : weekly;
    // Always fall back to mock data if empty so the screen is never blank
    if (!data || data.length === 0) {
      data = selectedTab === '24h' ? MOCK_24H : MOCK_7D;
    }
    return data;
  }, [selectedTab, history, weekly]);

  const createChartData = (sensorKey) => {
    const records =
      selectedTab === '24h'
        ? dataset.slice(-20)
        : dataset;

    return {
      values: records
        .map((item) => Number(item?.[sensorKey]))
        .filter((v) => !isNaN(v)),

      labels: records.map((item, index) => {
        if (selectedTab === '24h') {
          return index % 4 === 0
            ? item.time || ''
            : '';
        }

        return index % 2 === 0
          ? item.date || ''
          : '';
      }),
    };
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.header}>
        <Text style={[styles.title, { color: themeColors.primary }]}>
          📊 Analytics
        </Text>
        <Text style={styles.subtitle}>
          Historical sensor trends
        </Text>
      </View>

      <LinearGradient colors={themeColors.cardGradients.default} style={styles.tabsContainer}>
        {TABS.map((tab) => (
          <Pressable
            key={tab.key}
            style={[
              styles.tab,
              selectedTab === tab.key && { backgroundColor: themeColors.primary + '40' },
            ]}
            onPress={() => setSelectedTab(tab.key)}
          >
            <Text
              style={[
                styles.tabText,
                selectedTab === tab.key && { color: themeColors.primary, fontWeight: '700' },
              ]}
            >
              {tab.label}
            </Text>
          </Pressable>
        ))}
      </LinearGradient>

      {SENSOR_KEYS.map((sensor, index) => {
          const config = SENSOR_CONFIG[sensor];
          const chart = createChartData(sensor);
          const gradient = themeColors.gradients[sensor] || themeColors.gradients.primary;

          return (
            <LinearGradient
              key={sensor}
              colors={themeColors.cardGradients.default}
              style={[styles.chartWrapper, { borderColor: config.color + '40' }]}
            >
              <ChartWidget
                title={config.label}
                data={chart.values}
                labels={chart.labels}
                color={config.color}
                unit={config.unit}
              />
            </LinearGradient>
          );
        })}

      <View style={{ height: 40 }} />
    </ScrollView>
  );
}

const createStyles = (theme) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.background,
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
    color: theme.textSecondary,
    marginTop: 4,
  },
  tabsContainer: {
    flexDirection: 'row',
    borderRadius: borderRadius.lg,
    padding: 4,
    marginBottom: spacing.xl,
    borderWidth: 1,
    borderColor: theme.border,
    ...shadows.small,
  },
  tab: {
    flex: 1,
    paddingVertical: spacing.sm,
    alignItems: 'center',
    borderRadius: borderRadius.md,
  },
  tabText: {
    ...typography.bodySmall,
    color: theme.textSecondary,
    fontWeight: '600',
  },
  chartWrapper: {
    marginBottom: spacing.lg,
    borderRadius: borderRadius.xl,
    padding: spacing.md,
    borderWidth: 1,
    ...shadows.card,
  },
  emptyContainer: {
    padding: 30,
    borderRadius: borderRadius.lg,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: theme.border,
  },
  emptyText: {
    ...typography.body,
    color: theme.textSecondary,
  },
});