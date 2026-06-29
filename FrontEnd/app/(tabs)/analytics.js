import React, { useMemo, useState } from 'react';
import {
  ScrollView,
  StyleSheet,
  Text,
  View,
  Pressable,
} from 'react-native';

import ChartWidget from '../../src/components/ChartWidget';
import useSensorData from '../../src/hooks/useSensorData';

import {
  colors,
  spacing,
  borderRadius,
  typography,
} from '../../src/theme/theme';

import {
  SENSOR_KEYS,
  SENSOR_CONFIG,
} from '../../src/utils/constants';

const TABS = [
  { key: '24h', label: 'Last 24 Hours' },
  { key: '7d', label: 'Last 7 Days' },
];

export default function AnalyticsScreen() {
  const { history, weekly } = useSensorData();

  const [selectedTab, setSelectedTab] = useState('24h');

  const dataset = useMemo(() => {
    if (selectedTab === '24h') return history;
    return weekly;
  }, [selectedTab, history, weekly]);

  const createChartData = (sensorKey) => {
    if (!dataset || dataset.length === 0) {
      return {
        values: [],
        labels: [],
      };
    }

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
        <Text style={styles.title}>
          📊 Analytics
        </Text>

        <Text style={styles.subtitle}>
          Historical sensor trends
        </Text>
      </View>

      <View style={styles.tabContainer}>
        {TABS.map((tab) => (
          <Pressable
            key={tab.key}
            style={[
              styles.tab,
              selectedTab === tab.key &&
                styles.activeTab,
            ]}
            onPress={() =>
              setSelectedTab(tab.key)
            }
          >
            <Text
              style={[
                styles.tabText,
                selectedTab === tab.key &&
                  styles.activeTabText,
              ]}
            >
              {tab.label}
            </Text>
          </Pressable>
        ))}
      </View>

      {dataset.length === 0 ? (
        <View style={styles.emptyCard}>
          <Text style={styles.emptyTitle}>
            No Sensor History
          </Text>

          <Text style={styles.emptySubtitle}>
            Waiting for sensor readings...
          </Text>
        </View>
      ) : (
        SENSOR_KEYS.map((sensor) => {
          const config = SENSOR_CONFIG[sensor];

          const chart =
            createChartData(sensor);

          return (
            <View
              key={sensor}
              style={styles.chartCard}
            >
              <ChartWidget
                title={config.label}
                data={chart.values}
                labels={chart.labels}
                color={config.color}
                unit={config.unit}
              />
            </View>
          );
        })
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
  emptyContainer: {
    backgroundColor: colors.surface,
    padding: 30,
    borderRadius: borderRadius.lg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyText: {
    ...typography.body,
    color: colors.textSecondary,
  },
});