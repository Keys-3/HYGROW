import React from 'react';
import { View, Text, StyleSheet, FlatList, Pressable, RefreshControl, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import useOrders from '../../../src/hooks/useOrders';
import useAppStore from '../../../src/store/useAppStore';
import { useThemeColors, spacing, borderRadius, typography, shadows } from '../../../src/theme/theme';
import { formatDate, formatTime } from '../../../src/utils/helpers';

const getStatusConfig = (colors) => ({
  pending: { color: colors.warning, label: 'Pending', icon: 'Pending' },
  confirmed: { color: colors.info, label: 'Confirmed', icon: 'Confirmed' },
  processing: { color: colors.primary, label: 'Processing', icon: 'Processing' },
  shipped: { color: colors.info, label: 'Shipped', icon: 'Shipped' },
  delivered: { color: colors.success, label: 'Delivered', icon: 'Delivered' },
  cancelled: { color: colors.danger, label: 'Cancelled', icon: 'Cancelled' },
});

function OrderCard({ order, onPress }) {
  const themeColors = useThemeColors();
  const styles = createStyles(themeColors);
  const statusConfig = getStatusConfig(themeColors)[order.status] || getStatusConfig(themeColors).pending;
  const itemCount = order.items?.length || 0;
  const totalItems = order.items?.reduce((sum, item) => sum + item.quantity, 0) || 0;

  return (
    <Pressable style={({ pressed }) => [styles.card, pressed && styles.cardPressed]} onPress={onPress}>
      <View style={styles.cardHeader}>
        <View style={styles.orderInfo}>
          <Text style={styles.orderId}>Order #{order.id.slice(0, 8).toUpperCase()}</Text>
          <Text style={styles.orderDate}>{formatDate(order.created_at)} at {formatTime(order.created_at)}</Text>
        </View>
        <View style={[styles.statusBadge, { backgroundColor: statusConfig.color + '20' }]}>
          <Text style={[styles.statusText, { color: statusConfig.color }]}>{statusConfig.label}</Text>
        </View>
      </View>

      <View style={styles.divider} />

      <View style={styles.cardBody}>
        <View style={styles.itemsRow}>
          <Text style={styles.itemsLabel}>{itemCount} item{itemCount !== 1 ? 's' : ''}</Text>
          <Text style={styles.itemsCount}>({totalItems} total)</Text>
        </View>

        {order.items?.slice(0, 2).map((item, i) => (
          <View key={i} style={styles.itemRow}>
            <Text style={styles.itemName} numberOfLines={1}>{item.product_name}</Text>
            <Text style={styles.itemQty}>x{item.quantity}</Text>
          </View>
        ))}

        {itemCount > 2 && (
          <Text style={styles.moreItems}>+{itemCount - 2} more item{itemCount - 2 !== 1 ? 's' : ''}</Text>
        )}
      </View>

      <View style={styles.cardFooter}>
        <Text style={styles.totalLabel}>Total</Text>
        <Text style={styles.totalAmount}>₹{order.total_amount.toFixed(2)}</Text>
      </View>
    </Pressable>
  );
}

export default function OrdersScreen() {
  const router = useRouter();
  const themeColors = useThemeColors();
  const styles = createStyles(themeColors);
  const { orders, loading, error, fetchOrders } = useOrders();
  const user = useAppStore((state) => state.user);

  const navigateToDetail = (orderId) => {
    router.push(`/(tabs)/orders/${orderId}`);
  };

  if (!user) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyEmoji}>🔒</Text>
        <Text style={styles.emptyTitle}>Sign in to view orders</Text>
        <Text style={styles.emptySubtitle}>Your order history will appear here</Text>
      </View>
    );
  }

  if (loading && orders.length === 0) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={themeColors.primary} />
        <Text style={styles.loadingText}>Loading orders...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>My Orders</Text>
        <Text style={styles.subtitle}>{orders.length} order{orders.length !== 1 ? 's' : ''}</Text>
      </View>

      {error ? (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
          <Pressable style={styles.retryBtn} onPress={fetchOrders}>
            <Text style={styles.retryBtnText}>Retry</Text>
          </Pressable>
        </View>
      ) : null}

      <FlatList
        data={orders}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <OrderCard order={item} onPress={() => navigateToDetail(item.id)} />
        )}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={loading}
            onRefresh={fetchOrders}
            tintColor={themeColors.primary}
            colors={[themeColors.primary]}
          />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyEmoji}>📦</Text>
            <Text style={styles.emptyTitle}>No orders yet</Text>
            <Text style={styles.emptySubtitle}>Your orders will appear here once you make a purchase</Text>
            <Pressable style={styles.shopBtn} onPress={() => router.push('/(tabs)/market')}>
              <Text style={styles.shopBtnText}>Browse Market</Text>
            </Pressable>
          </View>
        }
      />
    </View>
  );
}

const createStyles = (colors) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    padding: spacing.lg,
    paddingTop: 60,
    paddingBottom: spacing.sm,
  },
  title: {
    ...typography.h1,
    color: colors.text,
  },
  subtitle: {
    ...typography.body,
    color: colors.textSecondary,
    marginTop: 4,
  },
  listContent: {
    padding: spacing.lg,
    paddingBottom: 40,
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    marginBottom: spacing.md,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: colors.border,
    ...shadows.card,
  },
  cardPressed: {
    opacity: 0.8,
    transform: [{ scale: 0.98 }],
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    padding: spacing.lg,
    paddingBottom: spacing.md,
  },
  orderInfo: {
    flex: 1,
  },
  orderId: {
    ...typography.h3,
    marginBottom: 4,
    color: colors.text,
  },
  orderDate: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: borderRadius.full,
  },
  statusText: {
    ...typography.caption,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  divider: {
    height: 1,
    backgroundColor: colors.border,
    marginHorizontal: spacing.lg,
  },
  cardBody: {
    padding: spacing.lg,
    paddingTop: spacing.md,
  },
  itemsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  itemsLabel: {
    ...typography.bodySmall,
    fontWeight: '600',
    color: colors.text,
  },
  itemsCount: {
    ...typography.caption,
    color: colors.textSecondary,
    marginLeft: 4,
  },
  itemRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 4,
  },
  itemName: {
    ...typography.bodySmall,
    flex: 1,
    marginRight: 8,
    color: colors.text,
  },
  itemQty: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  moreItems: {
    ...typography.caption,
    color: colors.primary,
    marginTop: spacing.xs,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: colors.surfaceLight,
    padding: spacing.lg,
  },
  totalLabel: {
    ...typography.body,
    fontWeight: '600',
    color: colors.text,
  },
  totalAmount: {
    ...typography.h3,
    color: colors.primary,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.xl,
  },
  loadingText: {
    ...typography.body,
    color: colors.textSecondary,
    marginTop: spacing.md,
  },
  errorContainer: {
    padding: spacing.lg,
    alignItems: 'center',
  },
  errorText: {
    ...typography.body,
    color: colors.danger,
    textAlign: 'center',
    marginBottom: spacing.md,
  },
  retryBtn: {
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.md,
  },
  retryBtnText: {
    ...typography.body,
    fontWeight: '600',
    color: colors.background,
  },
  emptyContainer: {
    alignItems: 'center',
    padding: spacing.xxl,
  },
  emptyEmoji: {
    fontSize: 64,
    marginBottom: spacing.lg,
  },
  emptyTitle: {
    ...typography.h2,
    marginBottom: spacing.sm,
    color: colors.text,
  },
  emptySubtitle: {
    ...typography.body,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: spacing.lg,
  },
  shopBtn: {
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.md,
  },
  shopBtnText: {
    ...typography.body,
    fontWeight: '600',
    color: colors.background,
  },
});
