/**
 * Farm Help — Dashboard Screen
 */

import { useMemo } from 'react';
import {
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import useSensorData from '../../../src/hooks/useSensorData';
import useAppStore from '../../../src/store/useAppStore';
import {
  borderRadius,
  colors,
  shadows,
  spacing,
  typography,
} from '../../../src/theme/theme';
import {
  SENSOR_CONFIG,
  SENSOR_KEYS,
  SENSOR_THRESHOLDS,
} from '../../../src/utils/constants';
import {
  formatSensorValue,
  getSensorStatus,
} from '../../../src/utils/helpers';

export default function DashboardScreen() {
  const { current, loading, error, refresh } = useSensorData();
  const lastUpdated = useAppStore((state) => state.lastUpdated);
  const isDeviceOnline = useAppStore((state) => state.isDeviceOnline);

  const sensorCards = useMemo(() => {
    if (!current) return [];

    return SENSOR_KEYS.map((key) => {
      const config = SENSOR_CONFIG[key];
      const value = current[key];
      const status = getSensorStatus(key, value);

      return {
        key,
        label: config.label,
        value: formatSensorValue(key, value),
        rawValue: value,
        unit: config.unit,
        icon: config.icon,
        color: config.color,
        status,
      };
    });
  }, [current]);

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      refreshControl={
        <RefreshControl refreshing={loading} onRefresh={refresh} />
      }
      showsVerticalScrollIndicator={false}
    >
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerTextWrap}>
          <Text style={styles.title}>Farm Dashboard</Text>
          <Text style={styles.subtitle}>
            Real-time hydroponics sensor monitoring
          </Text>
        </View>

        <View
          style={[
            styles.statusBadge,
            isDeviceOnline ? styles.onlineBadge : styles.offlineBadge,
          ]}
        >
          <View
            style={[
              styles.statusDot,
              isDeviceOnline ? styles.onlineDot : styles.offlineDot,
            ]}
          />
          <Text
            style={[
              styles.statusText,
              isDeviceOnline ? styles.onlineText : styles.offlineText,
            ]}
          >
            {isDeviceOnline ? 'Online' : 'Offline'}
          </Text>
        </View>
      </View>

      {/* Device Overview */}
      <View style={styles.infoCard}>
        <Text style={styles.infoTitle}>Device Overview</Text>

        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Last app update</Text>
          <Text style={styles.infoValue}>
            {lastUpdated
              ? new Date(lastUpdated).toLocaleString()
              : 'Not available'}
          </Text>
        </View>

        <View style={styles.infoDivider} />

        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Last sensor reading</Text>
          <Text style={styles.infoValue}>
            {current?.lastSensorTimestamp
              ? new Date(current.lastSensorTimestamp).toLocaleString()
              : 'Not available'}
          </Text>
        </View>

        <View style={styles.infoDivider} />

        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Device ID</Text>
          <Text style={styles.infoValue}>
            {current?.deviceId || 'Unknown device'}
          </Text>
        </View>
      </View>

      {/* Error */}
      {error ? (
        <View style={styles.errorCard}>
          <Text style={styles.errorTitle}>Sensor Error</Text>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      ) : null}

      {/* Loading */}
      {!current && loading ? (
        <View style={styles.placeholderCard}>
          <Text style={styles.placeholderTitle}>Loading sensor data...</Text>
          <Text style={styles.placeholderText}>
            Waiting for the latest reading from Firestore.
          </Text>
        </View>
      ) : null}

      {/* Empty */}
      {!current && !loading && !error ? (
        <View style={styles.placeholderCard}>
          <Text style={styles.placeholderTitle}>No sensor data yet</Text>
          <Text style={styles.placeholderText}>
            Sensor readings will appear here once your ESP32 writes to Firestore.
          </Text>
        </View>
      ) : null}

      {/* Sensor cards */}
      {current ? (
        <>
          <Text style={styles.sectionTitle}>Live Sensor Readings</Text>

          <View style={styles.cardsGrid}>
            {sensorCards.map((sensor) => {
              const threshold = SENSOR_THRESHOLDS[sensor.key];
              const statusStyle = getStatusStyles(sensor.status);

              return (
                <View key={sensor.key} style={styles.sensorCard}>
                  <View
                    style={[
                      styles.sensorAccent,
                      { backgroundColor: sensor.color },
                    ]}
                  />

                  <View style={styles.cardTop}>
                    <View style={styles.iconWrap}>
                      <Text style={styles.sensorIcon}>{sensor.icon}</Text>
                    </View>

                    <View
                      style={[
                        styles.sensorStatusPill,
                        { backgroundColor: statusStyle.bg },
                      ]}
                    >
                      <Text
                        style={[
                          styles.sensorStatusText,
                          { color: statusStyle.text },
                        ]}
                      >
                        {statusStyle.label}
                      </Text>
                    </View>
                  </View>

                  <Text style={styles.sensorLabel}>{sensor.label}</Text>

                  <Text style={[styles.sensorValue, { color: sensor.color }]}>
                    {sensor.value}
                    {sensor.unit ? (
                      <Text style={styles.sensorUnit}> {sensor.unit}</Text>
                    ) : null}
                  </Text>

                  <Text style={styles.sensorRange}>
                    Ideal: {threshold.min}–{threshold.max} {threshold.unit}
                  </Text>
                </View>
              );
            })}
          </View>

          {/* System Controls */}
          <View style={styles.controlsCard}>
            <Text style={styles.controlsTitle}>System Controls</Text>

            <View style={styles.controlRow}>
              <Text style={styles.controlLabel}>Pump Status</Text>
              <View
                style={[
                  styles.controlBadge,
                  current.pumpStatus
                    ? styles.controlBadgeOn
                    : styles.controlBadgeOff,
                ]}
              >
                <Text
                  style={[
                    styles.controlBadgeText,
                    current.pumpStatus
                      ? styles.controlBadgeTextOn
                      : styles.controlBadgeTextOff,
                  ]}
                >
                  {current.pumpStatus ? 'ON' : 'OFF'}
                </Text>
              </View>
            </View>

            <View style={styles.controlRow}>
              <Text style={styles.controlLabel}>Auto Mode</Text>
              <View
                style={[
                  styles.controlBadge,
                  current.autoMode
                    ? styles.controlBadgeOn
                    : styles.controlBadgeOff,
                ]}
              >
                <Text
                  style={[
                    styles.controlBadgeText,
                    current.autoMode
                      ? styles.controlBadgeTextOn
                      : styles.controlBadgeTextOff,
                  ]}
                >
                  {current.autoMode ? 'Enabled' : 'Disabled'}
                </Text>
              </View>
            </View>
          </View>
        </>
      ) : null}
    </ScrollView>
  );
}

/* ---------------------- local helpers ---------------------- */

function getStatusStyles(status) {
  switch (status) {
    case 'critical':
      return {
        label: 'Critical',
        bg: colors.dangerLight || '#FEE2E2',
        text: colors.danger || '#DC2626',
      };

    case 'warning':
      return {
        label: 'Warning',
        bg: colors.warningLight || '#FEF3C7',
        text: colors.warning || '#D97706',
      };

    case 'normal':
      return {
        label: 'Normal',
        bg: colors.successLight || '#DCFCE7',
        text: colors.success || '#16A34A',
      };

    default:
      return {
        label: 'Unknown',
        bg: colors.surfaceMuted || '#E5E7EB',
        text: colors.textMuted || '#6B7280',
      };
  }
}

/* ---------------------- styles ---------------------- */

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background || '#F4F7FB',
  },
  content: {
    padding: spacing.lg || 16,
    paddingBottom: spacing.xl || 32,
  },

  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing.lg || 16,
    gap: spacing.md || 12,
  },
  headerTextWrap: {
    flex: 1,
  },
  title: {
    fontSize: typography?.fontSize?.['3xl'] || 28,
    fontWeight: typography?.fontWeight?.bold || '800',
    color: colors.text || '#0F172A',
  },
  subtitle: {
    marginTop: spacing.xs || 4,
    fontSize: typography?.fontSize?.sm || 14,
    color: colors.textMuted || '#64748B',
  },

  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: borderRadius.full || 999,
    paddingHorizontal: spacing.md || 12,
    paddingVertical: spacing.sm || 8,
  },
  onlineBadge: {
    backgroundColor: colors.successLight || '#DCFCE7',
  },
  offlineBadge: {
    backgroundColor: colors.dangerLight || '#FEE2E2',
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 999,
    marginRight: spacing.sm || 8,
  },
  onlineDot: {
    backgroundColor: colors.success || '#16A34A',
  },
  offlineDot: {
    backgroundColor: colors.danger || '#DC2626',
  },
  statusText: {
    fontSize: typography?.fontSize?.xs || 12,
    fontWeight: typography?.fontWeight?.bold || '700',
  },
  onlineText: {
    color: colors.successDark || colors.success || '#166534',
  },
  offlineText: {
    color: colors.dangerDark || colors.danger || '#991B1B',
  },

  sectionTitle: {
    marginTop: spacing.sm || 8,
    marginBottom: spacing.md || 12,
    fontSize: typography?.fontSize?.lg || 18,
    fontWeight: typography?.fontWeight?.bold || '800',
    color: colors.text || '#0F172A',
  },

  infoCard: {
    backgroundColor: colors.card || colors.surface || '#FFFFFF',
    borderRadius: borderRadius.xl || 20,
    padding: spacing.lg || 16,
    marginBottom: spacing.lg || 16,
    ...(shadows?.md || {
      shadowColor: '#000',
      shadowOpacity: 0.06,
      shadowRadius: 10,
      shadowOffset: { width: 0, height: 4 },
      elevation: 3,
    }),
  },
  infoTitle: {
    fontSize: typography?.fontSize?.md || 16,
    fontWeight: typography?.fontWeight?.bold || '800',
    color: colors.text || '#111827',
    marginBottom: spacing.md || 12,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: spacing.md || 12,
    paddingVertical: 2,
  },
  infoLabel: {
    flex: 1,
    fontSize: typography?.fontSize?.sm || 14,
    color: colors.textMuted || '#64748B',
  },
  infoValue: {
    flex: 1.3,
    fontSize: typography?.fontSize?.sm || 14,
    fontWeight: typography?.fontWeight?.semibold || '600',
    color: colors.text || '#1E293B',
    textAlign: 'right',
  },
  infoDivider: {
    height: 1,
    backgroundColor: colors.border || '#E5E7EB',
    marginVertical: spacing.sm || 8,
  },

  errorCard: {
    backgroundColor: colors.dangerLight || '#FEF2F2',
    borderWidth: 1,
    borderColor: colors.dangerBorder || '#FECACA',
    borderRadius: borderRadius.xl || 18,
    padding: spacing.lg || 16,
    marginBottom: spacing.lg || 16,
  },
  errorTitle: {
    fontSize: typography?.fontSize?.md || 16,
    fontWeight: typography?.fontWeight?.bold || '800',
    color: colors.danger || '#B91C1C',
    marginBottom: spacing.xs || 4,
  },
  errorText: {
    fontSize: typography?.fontSize?.sm || 14,
    color: colors.danger || '#B91C1C',
    lineHeight: 20,
  },

  placeholderCard: {
    backgroundColor: colors.card || colors.surface || '#FFFFFF',
    borderRadius: borderRadius.xl || 18,
    padding: spacing.xl || 22,
    marginBottom: spacing.lg || 16,
    alignItems: 'center',
    ...(shadows?.sm || {
      shadowColor: '#000',
      shadowOpacity: 0.04,
      shadowRadius: 8,
      shadowOffset: { width: 0, height: 3 },
      elevation: 2,
    }),
  },
  placeholderTitle: {
    fontSize: typography?.fontSize?.md || 16,
    fontWeight: typography?.fontWeight?.bold || '800',
    color: colors.text || '#111827',
    marginBottom: spacing.sm || 8,
  },
  placeholderText: {
    fontSize: typography?.fontSize?.sm || 14,
    color: colors.textMuted || '#64748B',
    textAlign: 'center',
    lineHeight: 20,
  },

  cardsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  sensorCard: {
    width: '48%',
    backgroundColor: colors.card || colors.surface || '#FFFFFF',
    borderRadius: borderRadius.xl || 20,
    padding: spacing.lg || 16,
    marginBottom: spacing.md || 12,
    overflow: 'hidden',
    ...(shadows?.md || {
      shadowColor: '#000',
      shadowOpacity: 0.05,
      shadowRadius: 10,
      shadowOffset: { width: 0, height: 4 },
      elevation: 3,
    }),
  },
  sensorAccent: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 4,
  },
  cardTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  iconWrap: {
    width: 42,
    height: 42,
    borderRadius: borderRadius.lg || 14,
    backgroundColor: colors.surfaceMuted || '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  sensorIcon: {
    fontSize: 22,
  },
  sensorStatusPill: {
    paddingHorizontal: spacing.sm || 8,
    paddingVertical: 5,
    borderRadius: borderRadius.full || 999,
  },
  sensorStatusText: {
    fontSize: typography?.fontSize?.xs || 12,
    fontWeight: typography?.fontWeight?.bold || '800',
  },
  sensorLabel: {
    marginTop: spacing.md || 12,
    fontSize: typography?.fontSize?.sm || 14,
    color: colors.textMuted || '#64748B',
    fontWeight: typography?.fontWeight?.medium || '600',
  },
  sensorValue: {
    marginTop: spacing.sm || 8,
    fontSize: typography?.fontSize?.['2xl'] || 28,
    fontWeight: typography?.fontWeight?.bold || '800',
    color: colors.text || '#111827',
  },
  sensorUnit: {
    fontSize: typography?.fontSize?.sm || 14,
    fontWeight: typography?.fontWeight?.medium || '600',
    color: colors.textMuted || '#64748B',
  },
  sensorRange: {
    marginTop: spacing.sm || 8,
    fontSize: typography?.fontSize?.xs || 12,
    color: colors.textMuted || '#94A3B8',
    lineHeight: 16,
  },

  controlsCard: {
    backgroundColor: colors.card || colors.surface || '#FFFFFF',
    borderRadius: borderRadius.xl || 20,
    padding: spacing.lg || 16,
    marginTop: spacing.xs || 4,
    ...(shadows?.md || {
      shadowColor: '#000',
      shadowOpacity: 0.05,
      shadowRadius: 10,
      shadowOffset: { width: 0, height: 4 },
      elevation: 3,
    }),
  },
  controlsTitle: {
    fontSize: typography?.fontSize?.md || 16,
    fontWeight: typography?.fontWeight?.bold || '800',
    color: colors.text || '#111827',
    marginBottom: spacing.md || 12,
  },
  controlRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.sm || 8,
  },
  controlLabel: {
    fontSize: typography?.fontSize?.sm || 14,
    color: colors.text || '#334155',
    fontWeight: typography?.fontWeight?.medium || '600',
  },
  controlBadge: {
    paddingHorizontal: spacing.md || 12,
    paddingVertical: spacing.xs || 6,
    borderRadius: borderRadius.full || 999,
  },
  controlBadgeOn: {
    backgroundColor: colors.successLight || '#DCFCE7',
  },
  controlBadgeOff: {
    backgroundColor: colors.surfaceMuted || '#E5E7EB',
  },
  controlBadgeText: {
    fontSize: typography?.fontSize?.xs || 12,
    fontWeight: typography?.fontWeight?.bold || '800',
  },
  controlBadgeTextOn: {
    color: colors.successDark || colors.success || '#166534',
  },
  controlBadgeTextOff: {
    color: colors.textMuted || '#4B5563',
  },
});