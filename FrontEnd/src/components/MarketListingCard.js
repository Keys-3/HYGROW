import React from 'react';
import { View, Text, StyleSheet, Pressable, Image } from 'react-native';
import { useThemeColors, spacing, borderRadius, typography, shadows } from '../theme/theme';
import { getDefaultImage } from '../utils/helpers';

export default function MarketListingCard({ listing, onPress }) {
  const themeColors = useThemeColors();
  const styles = createStyles(themeColors);
  
  const imageUrl = listing.imageUrl || listing.image_url || getDefaultImage(listing.category, listing.title);

  return (
    <Pressable
      style={({ pressed }) => [styles.card, pressed && styles.pressed]}
      onPress={onPress}
    >
      <Image source={{ uri: imageUrl }} style={styles.image} />
      <View style={styles.content}>
        <Text style={styles.title} numberOfLines={1}>{listing.title}</Text>
        <Text style={styles.price}>{listing.currency}{listing.price} <Text style={styles.unit}>{listing.unit}</Text></Text>
        <View style={styles.sellerRow}>
          <Text style={styles.sellerName} numberOfLines={1}>👨‍🌾 Farmer: {listing.seller?.name}</Text>
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

const createStyles = (theme) => StyleSheet.create({
  card: {
    backgroundColor: theme.surface,
    borderRadius: borderRadius.lg,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: theme.border,
    marginBottom: spacing.md,
    ...shadows.small,
  },
  pressed: {
    opacity: 0.8,
    transform: [{ scale: 0.98 }],
  },
  image: {
    height: 140,
    width: '100%',
    resizeMode: 'cover',
  },
  content: {
    padding: spacing.md,
  },
  title: {
    ...typography.body,
    fontWeight: '600',
    marginBottom: 4,
    color: theme.text,
  },
  price: {
    ...typography.h3,
    color: theme.primary,
    marginBottom: spacing.sm,
  },
  unit: {
    ...typography.bodySmall,
    color: theme.textSecondary,
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
    color: theme.text,
  },
  rating: {
    ...typography.caption,
    color: theme.warning,
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
    color: theme.textSecondary,
  },
  stockBadge: {
    backgroundColor: theme.surfaceLight,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: borderRadius.sm,
  },
  stockText: {
    ...typography.caption,
    color: theme.success,
  },
});
