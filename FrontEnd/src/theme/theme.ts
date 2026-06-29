/**
 * Farm Help — Design System / Theme
 *
 * Dark farm-inspired palette with sensor-specific accent colors.
 * Used throughout the the app for consistent styling.
 */

import { Platform, TextStyle } from 'react-native';

export const colors = {
  // Core palette
  primary: '#22C55E',        // Vibrant green — growth, farm
  primaryDark: '#16A34A',
  primaryLight: '#4ADE80',

  // Backgrounds
  background: '#0F172A',     // Deep dark blue
  surface: '#1E293B',        // Card / elevated surface
  surfaceLight: '#334155',   // Lighter surface (inputs, hover)

  // Text
  text: '#F8FAFC',           // Primary text (white-ish)
  textSecondary: '#94A3B8',  // Secondary text (muted)
  textMuted: '#64748B',      // Disabled / hint text

  // Status
  success: '#22C55E',
  warning: '#F59E0B',
  danger: '#EF4444',
  info: '#3B82F6',

  // Sensor-specific accent colors
  sensor: {
    temperature: '#F97316',  // Orange
    humidity: '#06B6D4',     // Cyan
    ph: '#A855F7',           // Purple
    ec: '#3B82F6',           // Blue
    waterLevel: '#22C55E',   // Green
  },

  // Gradients
  gradients: {
    primary: ['#22C55E', '#16A34A'],
    dashboard: ['#0F172A', '#1E293B'],
    card: ['#1E293B', '#0F172A'],
    temperature: ['#F97316', '#EA580C'],
    humidity: ['#06B6D4', '#0891B2'],
    ph: ['#A855F7', '#9333EA'],
    ec: ['#3B82F6', '#2563EB'],
    waterLevel: ['#22C55E', '#16A34A'],
  },

  // Misc
  border: '#334155',
  overlay: 'rgba(0, 0, 0, 0.5)',
  tabBar: '#0F172A',
  tabBarBorder: '#1E293B',
};

export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
};

export const borderRadius = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  full: 9999,
};

export const typography: Record<string, TextStyle> = {
  // Font sizes
  h1: { fontSize: 28, fontWeight: '700', color: colors.text },
  h2: { fontSize: 22, fontWeight: '600', color: colors.text },
  h3: { fontSize: 18, fontWeight: '600', color: colors.text },
  body: { fontSize: 15, fontWeight: '400', color: colors.text },
  bodySmall: { fontSize: 13, fontWeight: '400', color: colors.textSecondary },
  caption: { fontSize: 11, fontWeight: '400', color: colors.textMuted },
  label: { fontSize: 12, fontWeight: '600', color: colors.textSecondary, textTransform: 'uppercase', letterSpacing: 1 },
  value: { fontSize: 32, fontWeight: '700', color: colors.text },
  unit: { fontSize: 14, fontWeight: '400', color: colors.textSecondary },
};

export const shadows = {
  card: Platform.select({
    web: {
      boxShadow: '0px 4px 8px rgba(0, 0, 0, 0.3)',
    },
    default: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.3,
      shadowRadius: 8,
      elevation: 8,
    },
  }),
  small: Platform.select({
    web: {
      boxShadow: '0px 2px 4px rgba(0, 0, 0, 0.2)',
    },
    default: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.2,
      shadowRadius: 4,
      elevation: 4,
    },
  }),
};

const theme = { colors, spacing, borderRadius, typography, shadows };
export default theme;
