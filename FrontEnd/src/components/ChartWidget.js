import React, { useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  useWindowDimensions,
} from 'react-native';

import Svg, {
  Rect,
  Line,
  Text as SvgText,
} from 'react-native-svg';

import { useThemeColors, spacing, typography } from '../theme/theme';
import { wp, hp } from '../utils/responsive';

export default function ChartWidget({
  title,
  data = [],
  labels = [],
  color,
  unit = '',
}) {
  const themeColors = useThemeColors();
  const { width } = useWindowDimensions();
  
  const styles = useMemo(() => createStyles(themeColors), [themeColors]);

  const chartWidth = wp(85); 
  const chartHeight = hp(25); 

  const values = useMemo(
    () =>
      data
        .map(Number)
        .filter((v) => !isNaN(v)),
    [data]
  );

  const activeColor = color || themeColors.primary;

  if (values.length === 0) {
    return (
      <View style={styles.container}>
        {title && <Text style={styles.title}>{title}</Text>}
        <View style={styles.empty}>
          <Text style={styles.emptyText}>Waiting for sensor readings...</Text>
        </View>
      </View>
    );
  }

  let min = Math.min(...values);
  let max = Math.max(...values);
  
  if (min === max) {
    min = min > 0 ? min * 0.8 : 0;
    max = max > 0 ? max * 1.2 : 1;
  }

  const range = max - min || 1;
  const padding = 24;

  const points = values.map((value, index) => {
    const x = padding + (index + 0.5) * ((chartWidth - padding * 2) / values.length);
    const barHeight = ((value - min) / range) * (chartHeight - padding * 2);
    const finalBarHeight = Math.max(barHeight, 4);
    const y = chartHeight - padding - finalBarHeight;
    return { x, y, barHeight: finalBarHeight };
  });

  const barWidth = Math.max(((chartWidth - padding * 2) / values.length) * 0.6, 2);

  return (
    <View style={styles.container}>
      {title && <Text style={styles.title}>{title}</Text>}

      <Svg width={chartWidth} height={chartHeight}>
        {[0, 1, 2, 3, 4].map((i) => {
          const y = padding + ((chartHeight - padding * 2) / 4) * i;
          return (
            <Line
              key={i}
              x1={padding}
              x2={chartWidth - padding}
              y1={y}
              y2={y}
              stroke={themeColors.border}
              strokeWidth={1}
            />
          );
        })}

        {points.map((p, i) => (
          <Rect
            key={i}
            x={p.x - barWidth / 2}
            y={p.y}
            width={barWidth}
            height={p.barHeight}
            fill={activeColor}
            rx={4}
          />
        ))}

        <SvgText
          x={2}
          y={20}
          fill={themeColors.textSecondary}
          fontSize="11"
        >
          {max.toFixed(1)}
        </SvgText>

        <SvgText
          x={2}
          y={chartHeight - 10}
          fill={themeColors.textSecondary}
          fontSize="11"
        >
          {min.toFixed(1)}
        </SvgText>

        {labels.map((label, i) => {
          if (!label) return null;
          const x = padding + (i + 0.5) * ((chartWidth - padding * 2) / labels.length);
          return (
            <SvgText
              key={i}
              x={x}
              y={chartHeight}
              fontSize="9"
              fill={themeColors.textMuted}
              textAnchor="middle"
            >
              {label}
            </SvgText>
          );
        })}
      </Svg>

      <View style={styles.footer}>
        <Text style={styles.footerText}>
          Min: {min.toFixed(1)}{unit}
        </Text>
        <Text style={styles.footerText}>
          Max: {max.toFixed(1)}{unit}
        </Text>
        <Text style={styles.footerText}>
          Avg: {(values.reduce((a, b) => a + b, 0) / values.length).toFixed(1)}{unit}
        </Text>
      </View>
    </View>
  );
}

const createStyles = (themeColors) => StyleSheet.create({
  container: {
    backgroundColor: 'transparent',
    overflow: 'hidden',
  },
  title: {
    ...typography.h3,
    marginBottom: spacing.md,
    color: themeColors.text,
  },
  empty: {
    height: 180,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    ...typography.body,
    color: themeColors.textSecondary,
  },
  footer: {
    marginTop: spacing.md,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  footerText: {
    ...typography.bodySmall,
    color: themeColors.textSecondary,
    fontWeight: '600',
  },
});