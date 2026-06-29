import React, { useState } from 'react';
import { View, Text, TextInput, Pressable, StyleSheet, ScrollView, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { colors, spacing, borderRadius, typography, shadows } from '../../../src/theme/theme';
import { predictYield } from '../../../src/services/yieldPrediction';
import useSensorData from '../../../src/hooks/useSensorData';
import { predictGrowth } from "../../../src/services/growthPrediction";

const STAGES = ['Seedling', 'Vegetative', 'Flowering', 'Harvest'];

export default function YieldScreen() {
  const router = useRouter();
  const { current } = useSensorData();
  
  const [crop, setCrop] = useState('Butterhead Lettuce');
  const [stage, setStage] = useState('Vegetative');
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState(null);

const handlePredict = async () => {

    try {

        setLoading(true);
        setResults(null);
        console.log("Sending request...");
        console.log("Current:", current);
        const payload = {
        temperature: current.temperature,
        humidity: current.humidity,
        ph: current.ph,
        tds: Math.round(current.ec * 1),
      };

      console.log(payload);

      const response = await predictGrowth({
        temperature: current.temperature,
        humidity: current.humidity,
        ph: current.ph,
        tds: Math.round(current.ec),
      });

        setResults(response.prediction);

    } catch (e) {

        console.log(e);

    } finally {

        setLoading(false);

    }

};

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Pressable onPress={() => router.back()} style={styles.backBtn}>
        <Text style={styles.backText}>← Back</Text>
      </Pressable>

      <Text style={styles.title}>Yield Prediction</Text>
      <Text style={styles.subtitle}>Estimate crop yield based on current conditions</Text>

      <View style={styles.formCard}>
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Crop Type</Text>
          <TextInput
            style={styles.input}
            value={crop}
            onChangeText={setCrop}
            placeholder="e.g. Butterhead Lettuce"
            placeholderTextColor={colors.textMuted}
          />
        </View>

        <View style={styles.currentConditions}>
  <Text style={styles.label}>Current Conditions Included:</Text>

  <Text style={styles.conditionText}>
    Temp: {current?.temperature ?? "--"}°C
  </Text>

  <Text style={styles.conditionText}>
    Humidity: {current?.humidity ?? "--"}%
  </Text>

  <Text style={styles.conditionText}>
    pH: {current?.ph ?? "--"}
  </Text>

  <Text style={styles.conditionText}>
    EC: {current?.ec ?? "--"} mS/cm
  </Text>

  <Text style={styles.conditionText}>
    Light: {current?.light ?? "--"} lux
  </Text>
</View>
        <Pressable 
          style={({ pressed }) => [styles.predictBtn, pressed && styles.pressed, loading && styles.disabledBtn]}
          onPress={handlePredict}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color={colors.background} />
          ) : (
            <Text style={styles.predictBtnText}>Predict Yield</Text>
          )}
        </Pressable>
      </View>

      {results && !loading && (
        <View style={styles.resultsArea}>
    <Text style={styles.resultsTitle}>AI Growth Prediction</Text>

    <View style={styles.primaryResultCard}>
      <Text style={styles.timeValue}>
        {results.harvestTime}
      </Text>

      <Text style={styles.stageText}>
        {results.growthStatus}
      </Text>
    </View>

    <Text style={styles.factorsTitle}>
      Recommendations
    </Text>

    {results.recommendations.map((item, index) => (
      <Text key={index} style={styles.conditionText}>
        • {item}
      </Text>
    ))}
  </View>
      )}
      
      <View style={{ height: 40 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  content: { padding: spacing.lg, paddingTop: 60 },
  backBtn: { marginBottom: spacing.md },
  backText: { color: colors.primary, ...typography.body, fontWeight: '600' },
  title: { ...typography.h1 },
  subtitle: { ...typography.body, color: colors.textSecondary, marginBottom: spacing.lg },
  
  formCard: {
    backgroundColor: colors.surface,
    padding: spacing.lg,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    ...shadows.card,
    marginBottom: spacing.xl,
  },
  inputGroup: { marginBottom: spacing.lg },
  label: { ...typography.label, marginBottom: spacing.sm },
  input: {
    backgroundColor: colors.surfaceLight,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    color: colors.text,
    fontSize: 16,
  },
  stageGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  stageBtn: {
    backgroundColor: colors.surfaceLight,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  stageBtnActive: {
    backgroundColor: colors.info + '20',
    borderColor: colors.info,
  },
  stageText: { color: colors.textSecondary, ...typography.bodySmall },
  stageTextActive: { color: colors.info, fontWeight: '600' },
  currentConditions: {
    backgroundColor: colors.surfaceLight,
    padding: spacing.md,
    borderRadius: borderRadius.md,
    marginBottom: spacing.lg,
  },
  conditionText: { color: colors.textSecondary, ...typography.bodySmall },
  predictBtn: {
    backgroundColor: colors.info,
    padding: spacing.md,
    borderRadius: borderRadius.md,
    alignItems: 'center',
  },
  pressed: { opacity: 0.8 },
  disabledBtn: { opacity: 0.5 },
  predictBtnText: { color: colors.background, ...typography.body, fontWeight: '700' },

  resultsArea: {
    backgroundColor: colors.surface,
    padding: spacing.lg,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: colors.info + '50',
    ...shadows.card,
  },
  resultsTitle: { ...typography.h3, marginBottom: spacing.md },
  primaryResultCard: {
    flexDirection: 'row',
    backgroundColor: colors.surfaceLight,
    padding: spacing.lg,
    borderRadius: borderRadius.md,
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  yieldBox: { flex: 1, alignItems: 'center' },
  yieldValue: { fontSize: 42, fontWeight: '700', color: colors.info },
  yieldUnit: { ...typography.body, color: colors.textSecondary },
  verticalDivider: { width: 1, height: '80%', backgroundColor: colors.border, marginHorizontal: spacing.md },
  timeBox: { flex: 1, alignItems: 'center' },
  timeLabel: { ...typography.caption, color: colors.textSecondary, marginBottom: 4 },
  timeValue: { ...typography.h3, color: colors.text },
  
  scoreRow: { flexDirection: 'row', alignItems: 'center', marginBottom: spacing.lg },
  scoreLabel: { ...typography.bodySmall, marginRight: spacing.sm },
  scoreBarBg: { flex: 1, height: 8, backgroundColor: colors.surfaceLight, borderRadius: 4, marginRight: spacing.sm, overflow: 'hidden' },
  scoreBarFill: { height: '100%', backgroundColor: colors.success, borderRadius: 4 },
  scoreValue: { ...typography.body, fontWeight: '600' },

  factorsTitle: { ...typography.body, fontWeight: '600', marginBottom: spacing.sm },
  factorsList: { gap: spacing.sm },
  factorItem: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 4 },
  factorLeft: { flexDirection: 'row', gap: spacing.md, alignItems: 'center' },
  factorName: { ...typography.body, color: colors.textSecondary, width: 100 },
  factorStatus: { ...typography.caption, textTransform: 'uppercase' },
  factorImpact: { ...typography.body, fontWeight: '600' },
});
