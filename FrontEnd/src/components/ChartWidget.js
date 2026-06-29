import React from 'react';
import { View, Text, StyleSheet, ActivityIndicator, useWindowDimensions } from 'react-native';
import { LineChart } from 'react-native-chart-kit';
import { colors, spacing, borderRadius, typography } from '../theme/theme';

export default function ChartWidget({ data, labels, title, color = colors.primary, height = 220, showDots = true, yAxisSuffix = '' }) {
  const { width } = useWindowDimensions();

  // Calculate actual chart width accounting for all padding:
  // Parent ScrollView has padding.lg (24px each side)
  // Container has padding.md (16px each side)
  const chartWidth = width - spacing.lg * 2 - spacing.md * 2;

  if (!data || data.length === 0) {
    return (
      <View style={[styles.container, { height, justifyContent: 'center', alignItems: 'center' }]}>
         <ActivityIndicator color={color} />
         <Text style={styles.loadingText}>Loading chart data...</Text>
      </View>
    );
  }

  const chartData = {
    labels: labels || data.map(() => ''),
    datasets: [
      {
        data: data,
        color: () => color,
        strokeWidth: 2,
      },
    ],
  };

  return (
    <View style={styles.container}>
      {title && <Text style={styles.title}>{title}</Text>}
      <LineChart
        data={chartData}
        width={chartWidth}
        height={height}
        chartConfig={{
          backgroundColor: colors.surface,
          backgroundGradientFrom: colors.surface,
          backgroundGradientTo: colors.surface,
          decimalCount: 1,
          color: () => color,
          labelColor: () => colors.textSecondary,
          propsForDots: showDots ? {
            r: '3',
            strokeWidth: '1',
            stroke: color,
          } : { r: '0' },
          propsForBackgroundLines: {
            stroke: colors.border,
            strokeDasharray: '4,4',
          },
        }}
        bezier
        style={styles.chart}
        withInnerLines={true}
        withOuterLines={false}
        withVerticalLines={false}
        yAxisSuffix={yAxisSuffix}
        fromZero={false}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: spacing.md,
  },
  title: {
    ...typography.h3,
    marginBottom: spacing.md,
  },
  chart: {
    borderRadius: borderRadius.md,
    marginVertical: 8,
  },
  loadingText: {
    ...typography.bodySmall,
    marginTop: spacing.sm,
  }
});
