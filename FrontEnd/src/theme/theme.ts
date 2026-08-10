/**
 * Farm Help — Design System / Theme
 *
 * Deep Premium Gradient Theme
 * Dark backgrounds, stark white text, glowing neon accents.
 */

import { Platform, TextStyle } from 'react-native';
import useAppStore from '../store/useAppStore';

export const darkColors = {
  // Primary gradient (emerald to blue)
  primary: '#10B981', // emerald
  primaryDark: '#059669',
  primaryLight: '#6EE7B7',
  
  success: '#22C55E',
  warning: '#F59E0B',
  danger: '#EF4444',
  info: '#3B82F6',
  
  // Backgrounds (dark theme)
  globalBackground: ['#0F172A', '#0F172A'], 
  background: '#0F172A', // deep dark blue
  
  // Elevated Surfaces
  surface: '#1E293B', // card surface
  surfaceLight: '#334155', // lighter surface
  surfaceMuted: '#0F172A',
  
  // Text (light for contrast)
  text: '#F8FAFC', // white
  textSecondary: '#94A3B8', // muted gray
  textMuted: '#64748B', // disabled
  
  border: '#334155',
  card: '#1E293B',
  overlay: 'rgba(0,0,0,0.5)',
  tabBar: '#0F172A',
  tabBarBorder: '#1E293B',

  // Sensor accent colors
  sensor: {
    temperature: '#F97316',
    humidity: '#06B6D4',
    ph: '#A855F7',
    ec: '#3B82F6',
    waterLevel: '#22C55E',
    lightIntensity: '#F59E0B',
  },
  
  // Gradients (adjusted for green/blue theme)
  gradients: {
    primary: ['#10B981', '#3B82F6'],
    temperature: ['#F97316', '#EA580C'],
    humidity: ['#06B6D4', '#0284C7'],
    ph: ['#A855F7', '#7E22CE'],
    ec: ['#3B82F6', '#1D4ED8'],
    waterLevel: ['#22C55E', '#15803D'],
    lightIntensity: ['#F59E0B', '#B45309'],
  },

  // Deep Gradient Card Backgrounds
  cardGradients: {
    default: ['#1E293B', '#1E293B'], // solid slate cards
    temperature: ['rgba(249, 115, 22, 0.15)', 'rgba(234, 88, 12, 0.05)'],
    humidity: ['rgba(6, 182, 212, 0.15)', 'rgba(2, 132, 199, 0.05)'],
    ph: ['rgba(168, 85, 247, 0.15)', 'rgba(126, 34, 206, 0.05)'],
    ec: ['rgba(59, 130, 246, 0.15)', 'rgba(29, 78, 216, 0.05)'],
    waterLevel: ['rgba(34, 197, 94, 0.15)', 'rgba(21, 128, 61, 0.05)'],
    lightIntensity: ['rgba(245, 158, 11, 0.15)', 'rgba(180, 83, 9, 0.05)'],
  },

  successLight: 'rgba(34, 197, 94, 0.15)',
  warningLight: 'rgba(245, 158, 11, 0.15)',
  dangerLight: 'rgba(239, 68, 68, 0.15)',
  
  successDark: '#22C55E',
  warningDark: '#F59E0B',
  dangerDark: '#EF4444',
  dangerBorder: 'rgba(239, 68, 68, 0.4)',
};

export const lightColors = {
  primary: '#059669', // deeper emerald for light mode contrast
  primaryDark: '#047857',
  primaryLight: '#34D399',
  
  success: '#16A34A',
  warning: '#D97706',
  danger: '#DC2626',
  info: '#2563EB',
  
  // Backgrounds (light theme)
  globalBackground: ['#F8FAFC', '#F1F5F9'], 
  background: '#F8FAFC', // very light slate
  
  // Elevated Surfaces
  surface: '#FFFFFF', // bright white cards
  surfaceLight: '#F1F5F9',
  surfaceMuted: '#FFFFFF',
  
  // Text
  text: '#0F172A', // almost black
  textSecondary: '#475569',
  textMuted: '#94A3B8',
  
  border: '#E2E8F0',
  card: '#FFFFFF',
  overlay: 'rgba(0,0,0,0.3)',
  tabBar: '#FFFFFF',
  tabBarBorder: '#E2E8F0',

  sensor: {
    temperature: '#EA580C',
    humidity: '#0284C7',
    ph: '#9333EA',
    ec: '#2563EB',
    waterLevel: '#16A34A',
    lightIntensity: '#D97706',
  },
  
  gradients: {
    primary: ['#059669', '#2563EB'],
    temperature: ['#EA580C', '#C2410C'],
    humidity: ['#0284C7', '#0369A1'],
    ph: ['#9333EA', '#7E22CE'],
    ec: ['#2563EB', '#1D4ED8'],
    waterLevel: ['#16A34A', '#15803D'],
    lightIntensity: ['#D97706', '#B45309'],
  },

  cardGradients: {
    default: ['#FFFFFF', '#FFFFFF'], 
    temperature: ['rgba(234, 88, 12, 0.1)', 'rgba(234, 88, 12, 0.02)'],
    humidity: ['rgba(2, 132, 199, 0.1)', 'rgba(2, 132, 199, 0.02)'],
    ph: ['rgba(147, 51, 234, 0.1)', 'rgba(147, 51, 234, 0.02)'],
    ec: ['rgba(37, 99, 235, 0.1)', 'rgba(37, 99, 235, 0.02)'],
    waterLevel: ['rgba(22, 163, 74, 0.1)', 'rgba(22, 163, 74, 0.02)'],
    lightIntensity: ['rgba(217, 119, 6, 0.1)', 'rgba(217, 119, 6, 0.02)'],
  },

  successLight: 'rgba(22, 163, 74, 0.15)',
  warningLight: 'rgba(217, 119, 6, 0.15)',
  dangerLight: 'rgba(220, 38, 38, 0.15)',
  
  successDark: '#15803D',
  warningDark: '#B45309',
  dangerDark: '#B91C1C',
  dangerBorder: 'rgba(220, 38, 38, 0.4)',
};

// Fallback for static imports (should be phased out in favor of useThemeColors)
export const colors = darkColors;

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
  xxl: 32,
  full: 9999,
};

export const typography: Record<string, TextStyle> = {
  h1: { fontSize: 32, fontWeight: '800', letterSpacing: -0.5 },
  h2: { fontSize: 24, fontWeight: '700', letterSpacing: -0.5 },
  h3: { fontSize: 18, fontWeight: '700' },
  body: { fontSize: 16, fontWeight: '400' },
  bodySmall: { fontSize: 14, fontWeight: '400' },
  caption: { fontSize: 12, fontWeight: '400' },
  label: { fontSize: 12, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 1.5 },
  value: { fontSize: 36, fontWeight: '800', letterSpacing: -1 },
  unit: { fontSize: 16, fontWeight: '500' },
};

export const shadows = {
  card: Platform.select({
    web: {
      boxShadow: '0px 10px 30px -10px rgba(0, 0, 0, 0.2)',
    },
    default: {
      shadowColor: '#000000',
      shadowOffset: { width: 0, height: 10 },
      shadowOpacity: 0.15,
      shadowRadius: 20,
      elevation: 5,
    },
  }),
  small: Platform.select({
    web: {
      boxShadow: '0px 4px 12px rgba(0, 0, 0, 0.1)',
    },
    default: {
      shadowColor: '#000000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.1,
      shadowRadius: 10,
      elevation: 3,
    },
  }),
};

/**
 * Returns the unified deep premium colors based on the current active theme mode.
 */
export function useThemeColors() {
  const isDarkMode = useAppStore((state) => state.isDarkMode);
  return isDarkMode ? darkColors : lightColors;
}

const theme = { colors, darkColors, lightColors, spacing, borderRadius, typography, shadows };
export default theme;
