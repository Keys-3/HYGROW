import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable, ActivityIndicator, Alert } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import useOrders from '../../../src/hooks/useOrders';
import useAppStore from '../../../src/store/useAppStore';
import { colors, spacing, borderRadius, typography, shadows } from '../../../src/theme/theme';
import { formatDate, formatTime } from '../../../src/utils/helpers';

type OrderStatus = 'pending' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled';

const STATUS_CONFIG: Record<OrderStatus, { color: string; label: string; description: string }> = {
  pending: { color: colors.warning, label: 'Pending', description: 'Order placed, awaiting confirmation' },
  confirmed: { color: colors.info, label: 'Confirmed', description: 'Order confirmed by seller' },
  processing: { color: colors.primary, label: 'Processing', description: 'Order is being prepared' },
  shipped: { color: colors.info, label: 'Shipped', description: 'Order is on the way' },
  delivered: { color: colors.success, label: 'Delivered', description: 'Order delivered successfully' },
  cancelled: { color: colors.danger, label: 'Cancelled', description: 'Order has been cancelled' },
};

const STATUS_FLOW: OrderStatus[] = ['pending', 'confirmed', 'processing', 'shipped', 'delivered'];

export default function OrderDetailScreen() {
  const { orderId } = useLocalSearchParams();
  const router = useRouter();
  const { orders, loading: ordersLoading, cancelOrder, updateOrderStatus } = useOrders();
  const user = useAppStore((state) => state.user);
  const [updating, setUpdating] = useState(false);

  const order = orders.find(o => o.id === orderId);

  if (ordersLoading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color={colors.primary} style={{ marginTop: 100 }} />
      </View>
    );
  }

  if (!order) {
    return (
      <View style={styles.container}>
        <View style={styles.errorContainer}>
          <Text style={styles.errorEmoji}>😕</Text>
          <Text style={styles.errorTitle}>Order not found</Text>
          <Text style={styles.errorSubtitle}>This order may have been removed or does not exist</Text>
          <Pressable style={styles.errorBackBtn} onPress={() => router.back()}>
            <Text style={styles.errorBackBtnText}>Go Back</Text>
          </Pressable>
        </View>
      </View>
    );
  }

  const statusConfig = STATUS_CONFIG[order.status] || STATUS_CONFIG.pending;
  const currentStepIndex = STATUS_FLOW.indexOf(order.status);
  const isCustomer = user?.role === 'customer';
  const isSeller = order.items?.some(item => item.seller_id === user?.id);
  const isAdmin = user?.role === 'admin';
  const canCancel = isCustomer && order.status === 'pending';
  const canUpdateStatus = (isSeller || isAdmin) && order.status !== 'delivered' && order.status !== 'cancelled';

  const handleCancel = () => {
    Alert.alert(
      'Cancel Order',
      'Are you sure you want to cancel this order? This action cannot be undone.',
      [
        { text: 'No, Keep Order', style: 'cancel' },
        {
          text: 'Yes, Cancel',
          style: 'destructive',
          onPress: async () => {
            try {
              setUpdating(true);
              await cancelOrder(order.id);
              Alert.alert('Success', 'Order has been cancelled');
            } catch (err: any) {
              Alert.alert('Error', err.message);
            } finally {
              setUpdating(false);
            }
          },
        },
      ]
    );
  };

  const handleUpdateStatus = () => {
    const nextStatus = STATUS_FLOW[currentStepIndex + 1];
    if (!nextStatus) return;

    Alert.alert(
      'Update Status',
      `Mark order as ${STATUS_CONFIG[nextStatus]?.label}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Update',
          onPress: async () => {
            try {
              setUpdating(true);
              await updateOrderStatus(order.id, nextStatus);
              Alert.alert('Success', `Order marked as ${STATUS_CONFIG[nextStatus]?.label}`);
            } catch (err: any) {
              Alert.alert('Error', err.message);
            } finally {
              setUpdating(false);
            }
          },
        },
      ]
    );
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Pressable onPress={() => router.back()} style={styles.backBtn}>
        <Text style={styles.backText}>Back</Text>
      </Pressable>

      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Order #{order.id.slice(0, 8).toUpperCase()}</Text>
        <Text style={styles.date}>{formatDate(order.created_at)} at {formatTime(order.created_at)}</Text>
      </View>

      {/* Status Progress */}
      <View style={styles.progressCard}>
        <Text style={styles.sectionTitle}>Order Status</Text>
        <View style={styles.statusRow}>
          <View style={[styles.currentStatusBadge, { backgroundColor: statusConfig.color + '20' }]}>
            <Text style={[styles.currentStatusText, { color: statusConfig.color }]}>{statusConfig.label}</Text>
          </View>
          <Text style={styles.statusDescription}>{statusConfig.description}</Text>
        </View>

        {/* Progress Steps */}
        <View style={styles.progressSteps}>
          {STATUS_FLOW.map((status, index) => {
            const config = STATUS_CONFIG[status];
            const isCompleted = index <= currentStepIndex;
            const isCurrent = index === currentStepIndex;

            return (
              <View key={status} style={styles.stepContainer}>
                <View style={[styles.stepDot, isCompleted && { backgroundColor: config.color }]}>
                  {isCompleted ? (
                    <Text style={styles.stepCheck}>✓</Text>
                  ) : (
                    <View style={styles.stepDotEmpty} />
                  )}
                </View>
                <Text style={[styles.stepLabel, isCurrent && styles.stepLabelActive]}>{config.label}</Text>
              </View>
            );
          })}
        </View>
      </View>

      {/* Items */}
      <View style={styles.itemsCard}>
        <Text style={styles.sectionTitle}>Items ({order.items?.length || 0})</Text>
        {order.items?.map((item, i) => (
          <View key={i} style={styles.itemRow}>
            <View style={styles.itemInfo}>
              <Text style={styles.itemName}>{item.product_name}</Text>
              <Text style={styles.itemQty}>Quantity: {item.quantity} {item.unit.replace('per ', '')}</Text>
            </View>
            <Text style={styles.itemPrice}>₹{item.total_price.toFixed(2)}</Text>
          </View>
        ))}
        <View style={styles.divider} />
        <View style={styles.totalRow}>
          <Text style={styles.totalLabel}>Total</Text>
          <Text style={styles.totalAmount}>₹{order.total_amount.toFixed(2)}</Text>
        </View>
      </View>

      {/* Shipping Address */}
      {order.shipping_address && (
        <View style={styles.addressCard}>
          <Text style={styles.sectionTitle}>Shipping Address</Text>
          <Text style={styles.addressText}>{order.shipping_address}</Text>
          {order.shipping_city && (
            <Text style={styles.addressText}>{order.shipping_city}, {order.shipping_state} - {order.shipping_pincode}</Text>
          )}
        </View>
      )}

      {/* Tracking History */}
      {order.tracking && order.tracking.length > 0 && (
        <View style={styles.trackingCard}>
          <Text style={styles.sectionTitle}>Tracking History</Text>
          {order.tracking.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()).map((track, i) => {
            const trackConfig = STATUS_CONFIG[track.status as OrderStatus] || STATUS_CONFIG.pending;
            return (
              <View key={i} style={styles.trackItem}>
                <View style={[styles.trackDot, { backgroundColor: trackConfig.color }]} />
                <View style={styles.trackContent}>
                  <Text style={styles.trackStatus}>{trackConfig.label}</Text>
                  {track.notes && <Text style={styles.trackNotes}>{track.notes}</Text>}
                  <Text style={styles.trackTime}>{formatDate(track.created_at)} {formatTime(track.created_at)}</Text>
                </View>
              </View>
            );
          })}
        </View>
      )}

      {/* Actions */}
      {canCancel && (
        <Pressable style={[styles.actionBtn, styles.cancelBtn]} onPress={handleCancel} disabled={updating}>
          {updating ? <ActivityIndicator color={colors.danger} /> : (
            <Text style={styles.cancelBtnText}>Cancel Order</Text>
          )}
        </Pressable>
      )}

      {canUpdateStatus && (
        <Pressable style={[styles.actionBtn, styles.updateBtn]} onPress={handleUpdateStatus} disabled={updating}>
          {updating ? <ActivityIndicator color={colors.background} /> : (
            <Text style={styles.updateBtnText}>Update Status</Text>
          )}
        </Pressable>
      )}

      <View style={{ height: 40 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    padding: spacing.lg,
    paddingTop: 60,
    paddingBottom: 40,
  },
  backBtn: {
    marginBottom: spacing.md,
  },
  backText: {
    ...typography.body,
    color: colors.primary,
    fontWeight: '600',
  },
  header: {
    marginBottom: spacing.lg,
  },
  title: {
    ...typography.h1,
  },
  date: {
    ...typography.body,
    color: colors.textSecondary,
    marginTop: 4,
  },
  sectionTitle: {
    ...typography.h3,
    marginBottom: spacing.md,
  },
  progressCard: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    marginBottom: spacing.lg,
  },
  currentStatusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: borderRadius.full,
  },
  currentStatusText: {
    ...typography.caption,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  statusDescription: {
    ...typography.bodySmall,
    color: colors.textSecondary,
    flex: 1,
  },
  progressSteps: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  stepContainer: {
    alignItems: 'center',
    flex: 1,
  },
  stepDot: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.surfaceLight,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 4,
  },
  stepCheck: {
    color: colors.background,
    fontWeight: '700',
    fontSize: 14,
  },
  stepDotEmpty: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.surfaceLight,
  },
  stepLabel: {
    ...typography.caption,
    textAlign: 'center',
  },
  stepLabelActive: {
    color: colors.primary,
    fontWeight: '600',
  },
  itemsCard: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  itemRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing.sm,
  },
  itemInfo: {
    flex: 1,
    marginRight: spacing.md,
  },
  itemName: {
    ...typography.body,
    fontWeight: '500',
    marginBottom: 2,
  },
  itemQty: {
    ...typography.caption,
  },
  itemPrice: {
    ...typography.body,
    fontWeight: '600',
  },
  divider: {
    height: 1,
    backgroundColor: colors.border,
    marginVertical: spacing.md,
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  totalLabel: {
    ...typography.body,
    fontWeight: '600',
  },
  totalAmount: {
    ...typography.h2,
    color: colors.primary,
  },
  addressCard: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  addressText: {
    ...typography.body,
    color: colors.textSecondary,
    marginBottom: 2,
  },
  trackingCard: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  trackItem: {
    flexDirection: 'row',
    marginBottom: spacing.md,
  },
  trackDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: spacing.md,
    marginTop: 3,
  },
  trackContent: {
    flex: 1,
  },
  trackStatus: {
    ...typography.body,
    fontWeight: '600',
    marginBottom: 2,
  },
  trackNotes: {
    ...typography.bodySmall,
    color: colors.textSecondary,
    marginBottom: 2,
  },
  trackTime: {
    ...typography.caption,
  },
  actionBtn: {
    padding: spacing.md,
    borderRadius: borderRadius.md,
    alignItems: 'center',
    marginTop: spacing.md,
  },
  cancelBtn: {
    backgroundColor: colors.danger + '20',
    borderWidth: 1,
    borderColor: colors.danger + '40',
  },
  cancelBtnText: {
    ...typography.body,
    color: colors.danger,
    fontWeight: '600',
  },
  updateBtn: {
    backgroundColor: colors.primary,
  },
  updateBtnText: {
    ...typography.body,
    color: colors.background,
    fontWeight: '600',
  },
  errorContainer: {
    alignItems: 'center',
    padding: spacing.xxl,
  },
  errorEmoji: {
    fontSize: 64,
    marginBottom: spacing.md,
  },
  errorTitle: {
    ...typography.h2,
    marginBottom: spacing.sm,
  },
  errorSubtitle: {
    ...typography.body,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: spacing.lg,
  },
  errorBackBtn: {
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.md,
  },
  errorBackBtnText: {
    ...typography.body,
    color: colors.background,
    fontWeight: '600',
  },
});
