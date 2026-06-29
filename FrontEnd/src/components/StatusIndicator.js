import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors, typography, borderRadius } from '../theme/theme';
import { timeAgo } from '../utils/helpers';

export default function StatusIndicator({ isOnline, lastUpdated }) {
  return (
    <View style={styles.container}>
      <View style={[styles.dot, { backgroundColor: isOnline ? colors.success : colors.danger }]} />
      <Text style={styles.text}>
        {isOnline ? 'Online' : 'Offline'} {lastUpdated ? `• ${timeAgo(lastUpdated)}` : ''}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surfaceLight,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: borderRadius.full,
    alignSelf: 'flex-start',
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 6,
  },
  text: {
    ...typography.caption,
    color: colors.textSecondary,
    fontWeight: '600',
  },
});
