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
    vpd: '#D946EF',
    waterTemp: '#0284C7',
    co2: '#0D9488',
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
    vpd: ['#D946EF', '#A21CAF'],
    waterTemp: ['#0284C7', '#0369A1'],
    co2: ['#0D9488', '#0F766E'],
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
    vpd: ['rgba(217, 70, 239, 0.15)', 'rgba(162, 28, 175, 0.05)'],
    waterTemp: ['rgba(2, 132, 199, 0.15)', 'rgba(3, 105, 161, 0.05)'],
    co2: ['rgba(13, 148, 136, 0.15)', 'rgba(15, 118, 110, 0.05)'],
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
  primary: '#10b981', // Emerald 500 (from landing page)
  primaryDark: '#047857',
  primaryLight: '#34d399',
  
  success: '#10b981', // success to match emerald
  warning: '#f59e0b',
  danger: '#ef4444',
  info: '#0ea5e9',
  
  // Backgrounds (light theme)
  globalBackground: ['#f8fafc', '#f1f5f9'], 
  background: '#f8fafc', // Slate 50
  
  // Elevated Surfaces
  surface: '#ffffff', // bright white cards
  surfaceLight: '#f1f5f9',
  surfaceMuted: '#f8fafc',
  
  // Text
  text: '#0f172a', // Slate 900
  textSecondary: '#475569',
  textMuted: '#64748b', // Slate 500
  
  border: '#e2e8f0', // Slate 200
  card: '#ffffff',
  overlay: 'rgba(15,23,42,0.4)', // Using a dark slate overlay
  tabBar: '#ffffff',
  tabBarBorder: '#e2e8f0',

  sensor: {
    temperature: '#f97316',
    humidity: '#0ea5e9',
    ph: '#a855f7',
    ec: '#3b82f6',
    waterLevel: '#10b981',
    lightIntensity: '#f59e0b',
    vpd: '#d946ef',
    waterTemp: '#0284c7',
    co2: '#0d9488',
  },
  
  gradients: {
    primary: ['#10b981', '#0ea5e9'],
    temperature: ['#f97316', '#ea580c'],
    humidity: ['#0ea5e9', '#0284c7'],
    ph: ['#a855f7', '#7e22ce'],
    ec: ['#3b82f6', '#1d4ed8'],
    waterLevel: ['#10b981', '#15803d'],
    lightIntensity: ['#f59e0b', '#b45309'],
    vpd: ['#d946ef', '#a21caf'],
    waterTemp: ['#0284c7', '#0369a1'],
    co2: ['#0d9488', '#0f766e'],
  },

  cardGradients: {
    default: ['#ffffff', '#ffffff'], 
    temperature: ['rgba(249, 115, 22, 0.1)', 'rgba(249, 115, 22, 0.02)'],
    humidity: ['rgba(14, 165, 233, 0.1)', 'rgba(14, 165, 233, 0.02)'],
    ph: ['rgba(168, 85, 247, 0.1)', 'rgba(168, 85, 247, 0.02)'],
    ec: ['rgba(59, 130, 246, 0.1)', 'rgba(59, 130, 246, 0.02)'],
    waterLevel: ['rgba(16, 185, 129, 0.1)', 'rgba(16, 185, 129, 0.02)'],
    lightIntensity: ['rgba(245, 158, 11, 0.1)', 'rgba(245, 158, 11, 0.02)'],
    vpd: ['rgba(217, 70, 239, 0.1)', 'rgba(217, 70, 239, 0.02)'],
    waterTemp: ['rgba(2, 132, 199, 0.1)', 'rgba(2, 132, 199, 0.02)'],
    co2: ['rgba(13, 148, 136, 0.1)', 'rgba(13, 148, 136, 0.02)'],
  },

  successLight: 'rgba(16, 185, 129, 0.15)',
  warningLight: 'rgba(245, 158, 11, 0.15)',
  dangerLight: 'rgba(239, 68, 68, 0.15)',
  
  successDark: '#047857',
  warningDark: '#b45309',
  dangerDark: '#b91c1c',
  dangerBorder: 'rgba(239, 68, 68, 0.4)',
};

// Fallback for static imports (should be phased out in favor of useThemeColors)
export const colors = lightColors;

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
      boxShadow: '0px 10px 30px rgba(0, 0, 0, 0.1)',
    },
    default: {
      shadowColor: '#000000',
      shadowOffset: { width: 0, height: 10 },
      shadowOpacity: 0.15,
      shadowRadius: 20,
      elevation: 8,
    },
  }),
  small: Platform.select({
    web: {
      boxShadow: '0px 4px 12px rgba(0, 0, 0, 0.08)',
    },
    default: {
      shadowColor: '#000000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.1,
      shadowRadius: 10,
      elevation: 4,
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
