import React, { useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  useWindowDimensions,
} from 'react-native';

import Svg, {
  Path,
  Circle,
  Line,
  Text as SvgText,
} from 'react-native-svg';

import {
  colors,
  spacing,
  borderRadius,
  typography,
} from '../theme/theme';

export default function ChartWidget({
  title,
  data = [],
  labels = [],
  color = colors.primary,
  unit = '',
  height = 220,
}) {
  const { width } = useWindowDimensions();

  const chartWidth = width - 70;
  const chartHeight = height - 40;

  const values = useMemo(
    () =>
      data
        .map(Number)
        .filter((v) => !isNaN(v)),
    [data]
  );

  if (values.length < 2) {
    return (
      <View style={styles.card}>
        {title && (
          <Text style={styles.title}>
            {title}
          </Text>
        )}

        <View style={styles.empty}>
          <Text style={styles.emptyText}>
            Waiting for sensor readings...
          </Text>
        </View>
      </View>
    );
  }

  const min = Math.min(...values);
  const max = Math.max(...values);
  const range = max - min || 1;

  const padding = 24;

  const points = values.map((value, index) => {
    const x =
      padding +
      (index * (chartWidth - padding * 2)) /
        (values.length - 1);

    const y =
      chartHeight -
      padding -
      ((value - min) / range) *
        (chartHeight - padding * 2);

    return { x, y };
  });

  const path = points
    .map((p, i) =>
      `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`
    )
    .join(' ');

  return (
    <View style={styles.card}>
      {title && (
        <Text style={styles.title}>
          {title}
        </Text>
      )}

      <Svg
        width={chartWidth}
        height={chartHeight}
      >
        {[0, 1, 2, 3, 4].map((i) => {
          const y =
            padding +
            ((chartHeight - padding * 2) / 4) * i;

          return (
            <Line
              key={i}
              x1={padding}
              x2={chartWidth - padding}
              y1={y}
              y2={y}
              stroke="#ECECEC"
              strokeWidth={1}
            />
          );
        })}

        <Path
          d={path}
          fill="none"
          stroke={color}
          strokeWidth={3}
        />

        {points.map((p, i) => (
          <Circle
            key={i}
            cx={p.x}
            cy={p.y}
            r={3}
            fill={color}
          />
        ))}

        <SvgText
          x={2}
          y={20}
          fill="#888"
          fontSize="11"
        >
          {max.toFixed(1)}
        </SvgText>

        <SvgText
          x={2}
          y={chartHeight - 10}
          fill="#888"
          fontSize="11"
        >
          {min.toFixed(1)}
        </SvgText>

        {labels.map((label, i) => {
          if (!label) return null;

          const x =
            padding +
            (i *
              (chartWidth - padding * 2)) /
              (labels.length - 1);

          return (
            <SvgText
              key={i}
              x={x}
              y={chartHeight}
              fontSize="9"
              fill="#777"
              textAnchor="middle"
            >
              {label}
            </SvgText>
          );
        })}
      </Svg>

      <View style={styles.footer}>
        <Text style={styles.footerText}>
          Min: {min.toFixed(1)}
          {unit}
        </Text>

        <Text style={styles.footerText}>
          Max: {max.toFixed(1)}
          {unit}
        </Text>

        <Text style={styles.footerText}>
          Avg:{' '}
          {(
            values.reduce(
              (a, b) => a + b,
              0
            ) / values.length
          ).toFixed(1)}
          {unit}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
  },

  title: {
    ...typography.h3,
    marginBottom: spacing.md,
  },

  empty: {
    height: 180,
    justifyContent: 'center',
    alignItems: 'center',
  },

  emptyText: {
    ...typography.body,
    color: colors.textSecondary,
  },

  footer: {
    marginTop: spacing.md,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },

  footerText: {
    ...typography.bodySmall,
    color: colors.textSecondary,
  },
});