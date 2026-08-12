import React, { useState } from 'react';
import { View, Text, StyleSheet, Pressable, Switch, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { ArrowLeft, Bot, ChartBar, Warehouse, RadioReceiver, ChevronDown, ChevronUp } from 'lucide-react-native';
import { useThemeColors, spacing, borderRadius, typography, shadows } from '../src/theme/theme';
import useAppStore from '../src/store/useAppStore';

export default function CustomizationScreen() {
  const router = useRouter();
  const themeColors = useThemeColors();
  const farmerFeatures = useAppStore((state) => state.farmerFeatures);
  const toggleFarmerFeature = useAppStore((state) => state.toggleFarmerFeature);
  const toggleFarmerSubFeature = useAppStore((state) => state.toggleFarmerSubFeature);

  const [expandedSections, setExpandedSections] = useState({
    sensors: false,
    aiTools: false,
  });

  const toggleSection = (key) => {
    setExpandedSections((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  const features = [
    {
      key: 'sensors',
      title: 'Sensor Dashboard',
      description: 'Real-time telemetry, alerts, and environment monitoring.',
      Icon: RadioReceiver,
      subFeatures: [
        { key: 'temperature', label: 'Temperature' },
        { key: 'humidity', label: 'Humidity' },
        { key: 'ph', label: 'pH' },
        { key: 'ec', label: 'TDS / EC' },
        { key: 'waterLevel', label: 'Water Level' },
        { key: 'lightIntensity', label: 'Light Intensity' },
        { key: 'vpd', label: 'VPD' },
        { key: 'waterTemp', label: 'Water Temp' },
        { key: 'co2', label: 'CO2 Levels' },
      ],
    },
    {
      key: 'aiTools',
      title: 'AI Assistant',
      description: 'Crop disease detection and intelligent farming advice.',
      Icon: Bot,
      subFeatures: [
        { key: 'diseaseDetection', label: 'Disease Detection' },
        { key: 'yieldPrediction', label: 'Yield Prediction' },
      ],
    },
    {
      key: 'inventory',
      title: 'Inventory Management',
      description: 'Track your crops, seeds, and farming equipment.',
      Icon: Warehouse,
      subFeatures: null,
    },
    {
      key: 'analytics',
      title: 'Analytics & Reports',
      description: 'View growth trends, yield predictions, and financial stats.',
      Icon: ChartBar,
      subFeatures: null,
    },
  ];

  return (
    <View style={[styles.container, { backgroundColor: themeColors.background }]}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.backBtn}>
          <ArrowLeft size={24} color={themeColors.text} />
        </Pressable>
        <Text style={[styles.headerTitle, { color: themeColors.text }]}>App Features</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <Text style={[styles.description, { color: themeColors.textSecondary }]}>
          Customize your workspace. Turn off modules or specific tools you don't need to simplify your app.
        </Text>

        {features.map((feature) => {
          const isEnabled = farmerFeatures[feature.key].enabled;
          const isExpanded = expandedSections[feature.key];

          return (
            <View key={feature.key} style={styles.cardContainer}>
              <Pressable
                onPress={() => feature.subFeatures && toggleSection(feature.key)}
                style={({ pressed }) => [
                  styles.cardPressable,
                  pressed && feature.subFeatures && { opacity: 0.8 }
                ]}
                disabled={!feature.subFeatures}
              >
                <LinearGradient
                  colors={themeColors.cardGradients.default}
                  style={[
                    styles.card,
                    { borderColor: themeColors.border },
                    isExpanded && { borderBottomLeftRadius: 0, borderBottomRightRadius: 0, borderBottomWidth: 0 }
                  ]}
                >
                  <View style={styles.iconContainer}>
                    <feature.Icon size={28} color={themeColors.primary} />
                  </View>
                  <View style={styles.textContainer}>
                    <Text style={[styles.title, { color: themeColors.text }]}>{feature.title}</Text>
                    <Text style={[styles.desc, { color: themeColors.textSecondary }]}>{feature.description}</Text>
                  </View>
                  <View style={styles.cardRight}>
                    <Switch
                      value={isEnabled}
                      onValueChange={() => toggleFarmerFeature(feature.key)}
                      trackColor={{ false: themeColors.surfaceLight, true: themeColors.primary + '60' }}
                      thumbColor={isEnabled ? themeColors.primary : themeColors.textMuted}
                    />
                    {feature.subFeatures && (
                      <View style={styles.chevron}>
                        {isExpanded ? (
                          <ChevronUp size={20} color={themeColors.textMuted} />
                        ) : (
                          <ChevronDown size={20} color={themeColors.textMuted} />
                        )}
                      </View>
                    )}
                  </View>
                </LinearGradient>
              </Pressable>

              {/* Sub-features Dropdown */}
              {feature.subFeatures && isExpanded && (
                <View style={[styles.subFeaturesContainer, { backgroundColor: themeColors.surfaceLight, borderColor: themeColors.border }]}>
                  {feature.subFeatures.map((sub, index) => {
                    const isSubEnabled = farmerFeatures[feature.key][sub.key];
                    const isLast = index === feature.subFeatures.length - 1;
                    
                    return (
                      <View 
                        key={sub.key} 
                        style={[
                          styles.subFeatureRow, 
                          !isLast && { borderBottomWidth: 1, borderBottomColor: themeColors.border }
                        ]}
                      >
                        <Text style={[
                          styles.subFeatureText, 
                          { color: isEnabled ? themeColors.text : themeColors.textMuted }
                        ]}>
                          {sub.label}
                        </Text>
                        <Switch
                          value={isSubEnabled}
                          onValueChange={() => toggleFarmerSubFeature(feature.key, sub.key)}
                          trackColor={{ false: themeColors.surface, true: themeColors.primary + '40' }}
                          thumbColor={isSubEnabled ? themeColors.primary : themeColors.textMuted}
                          disabled={!isEnabled}
                        />
                      </View>
                    );
                  })}
                </View>
              )}
            </View>
          );
        })}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingTop: 60,
    paddingBottom: spacing.md,
  },
  backBtn: {
    padding: spacing.xs,
  },
  headerTitle: {
    ...typography.h2,
  },
  content: {
    padding: spacing.lg,
  },
  description: {
    ...typography.body,
    marginBottom: spacing.xl,
    lineHeight: 22,
  },
  cardContainer: {
    marginBottom: spacing.md,
    ...shadows.sm,
  },
  cardPressable: {
    borderRadius: borderRadius.lg,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.lg,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
  },
  iconContainer: {
    marginRight: spacing.md,
  },
  textContainer: {
    flex: 1,
    marginRight: spacing.sm,
  },
  title: {
    ...typography.body,
    fontWeight: '700',
    marginBottom: 4,
  },
  desc: {
    ...typography.caption,
    lineHeight: 16,
  },
  cardRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  chevron: {
    marginLeft: spacing.xs,
  },
  subFeaturesContainer: {
    borderWidth: 1,
    borderTopWidth: 0,
    borderBottomLeftRadius: borderRadius.lg,
    borderBottomRightRadius: borderRadius.lg,
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.xs,
  },
  subFeatureRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.md,
  },
  subFeatureText: {
    ...typography.bodySmall,
  },
});
