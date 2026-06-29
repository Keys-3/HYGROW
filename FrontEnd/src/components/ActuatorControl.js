import React from 'react';
import { View, Text, StyleSheet, Switch } from 'react-native';
import { colors, spacing, borderRadius, typography } from '../theme/theme';

export default function ActuatorControl({ isOn, autoMode, onToggle, onAutoModeToggle }) {
  return (
    <View style={styles.card}>
      <View style={styles.row}>
        <View style={styles.info}>
          <Text style={styles.label}>💧 Water Pump</Text>
          <Text style={[styles.status, { color: isOn ? colors.success : colors.textMuted }]}>
            {isOn ? 'Running' : 'Stopped'}
          </Text>
        </View>
        <Switch
          value={isOn}
          onValueChange={onToggle}
          trackColor={{ false: colors.surfaceLight, true: colors.primary + '60' }}
          thumbColor={isOn ? colors.primary : colors.textMuted}
          disabled={autoMode}
        />
      </View>
      
      <View style={styles.divider} />
      
      <View style={styles.row}>
        <View style={styles.info}>
          <Text style={styles.label}>🤖 Auto Mode</Text>
          <Text style={styles.rule}>IF water level {'<'} 20% → Pump ON</Text>
        </View>
        <Switch
          value={autoMode}
          onValueChange={onAutoModeToggle}
          trackColor={{ false: colors.surfaceLight, true: colors.info + '60' }}
          thumbColor={autoMode ? colors.info : colors.textMuted}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.sm,
  },
  info: {
    flex: 1,
  },
  label: {
    ...typography.body,
    fontWeight: '600',
  },
  status: {
    ...typography.bodySmall,
    marginTop: 2,
    fontWeight: '500',
  },
  rule: {
    ...typography.caption,
    marginTop: 4,
  },
  divider: {
    height: 1,
    backgroundColor: colors.border,
    marginVertical: spacing.sm,
  },
});
