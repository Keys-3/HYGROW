import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { colors, spacing, borderRadius, typography, shadows } from '../theme/theme';

export default function MarketListingCard({ listing, onPress }) {
  const firstLetter = listing.title ? listing.title.charAt(0).toUpperCase() : '?';

  return (
    <Pressable
      style={({ pressed }) => [styles.card, pressed && styles.pressed]}
      onPress={onPress}
    >
      <View style={styles.imagePlaceholder}>
        <Text style={styles.imageText}>{firstLetter}</Text>
      </View>
      <View style={styles.content}>
        <Text style={styles.title} numberOfLines={1}>{listing.title}</Text>
        <Text style={styles.price}>{listing.currency}{listing.price} <Text style={styles.unit}>{listing.unit}</Text></Text>
        <View style={styles.sellerRow}>
          <Text style={styles.sellerName} numberOfLines={1}>👤 {listing.seller?.name}</Text>
          <Text style={styles.rating}>⭐ {listing.seller?.rating}</Text>
        </View>
        <View style={styles.footerRow}>
          <Text style={styles.location}>📍 {listing.seller?.location}</Text>
          <View style={styles.stockBadge}>
            <Text style={styles.stockText}>Stock: {listing.stock}</Text>
          </View>
        </View>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: spacing.md,
    ...shadows.small,
  },
  pressed: {
    opacity: 0.8,
    transform: [{ scale: 0.98 }],
  },
  imagePlaceholder: {
    height: 120,
    backgroundColor: colors.surfaceLight,
    justifyContent: 'center',
    alignItems: 'center',
  },
  imageText: {
    fontSize: 48,
    fontWeight: 'bold',
    color: colors.primary + '40',
  },
  content: {
    padding: spacing.md,
  },
  title: {
    ...typography.body,
    fontWeight: '600',
    marginBottom: 4,
  },
  price: {
    ...typography.h3,
    color: colors.primary,
    marginBottom: spacing.sm,
  },
  unit: {
    ...typography.bodySmall,
    color: colors.textSecondary,
  },
  sellerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  sellerName: {
    ...typography.bodySmall,
    flex: 1,
  },
  rating: {
    ...typography.caption,
    color: colors.warning,
    fontWeight: '600',
  },
  footerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: spacing.sm,
  },
  location: {
    ...typography.caption,
  },
  stockBadge: {
    backgroundColor: colors.surfaceLight,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: borderRadius.sm,
  },
  stockText: {
    ...typography.caption,
    color: colors.success,
  },
});
