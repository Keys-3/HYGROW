import React, { useState, useMemo, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Pressable,
  RefreshControl,
  ActivityIndicator,
  ScrollView,
  Modal,
  TextInput,
} from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import useInventory from '../../../src/hooks/useInventory';
import { deleteDoc, doc } from 'firebase/firestore';
import { db } from '../../../firebase';
import useAdminUsers from '../../../src/hooks/useAdminUsers';
import useAppStore from '../../../src/store/useAppStore';
import { useThemeColors, spacing, borderRadius, typography, shadows } from '../../../src/theme/theme';
import { formatDate } from '../../../src/utils/helpers';
import { GradientText } from '../../../src/components/GradientText';

function InventoryCard({ item, onPress, themeColors, styles }) {
  const statusColor = item.is_listed ? themeColors.success : themeColors.textMuted;
  const statusText = item.is_listed ? 'Listed' : 'Not Listed';

  return (
    <Pressable
      style={({ pressed }) => [styles.cardWrap, pressed && styles.cardPressed]}
      onPress={onPress}
    >
      <LinearGradient
        colors={themeColors.cardGradients.default}
        style={[styles.card, { borderColor: statusColor + '40' }]}
      >
        <View style={styles.cardHeader}>
          <View style={styles.cardTitleRow}>
            <Text style={styles.cardTitle} numberOfLines={1}>{item.name}</Text>
            <View style={[styles.statusBadge, { backgroundColor: statusColor + '20' }]}>
              <Text style={[styles.statusText, { color: statusColor }]}>{statusText}</Text>
            </View>
          </View>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
            <Text style={styles.cardCategory}>{item.category}</Text>
            {item.farmer_name && (
              <Text style={styles.cardCategory}>Farmer: {item.farmer_name}</Text>
            )}
          </View>
        </View>

        <View style={styles.cardBody}>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Quantity:</Text>
            <Text style={[styles.infoValue, { color: themeColors.text }]}>{item.quantity} {item.unit}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Price:</Text>
            <Text style={[styles.infoValue, { color: themeColors.primary }]}>₹{item.price_per_unit} per {item.unit}</Text>
          </View>
        </View>

        <View style={styles.cardFooter}>
          <Text style={styles.cardDate}>Added {formatDate(item.created_at)}</Text>
          <Text style={styles.cardEdit}>Edit →</Text>
        </View>
      </LinearGradient>
    </Pressable>
  );
}

export default function InventoryScreen() {
  const router = useRouter();
  const { inventory, loading, error, fetchInventory } = useInventory();
  const { users: adminUsers } = useAdminUsers();
  const user = useAppStore((state) => state.user);
  const adminSelectedFarmerId = useAppStore((state) => state.adminSelectedFarmerId);
  const [refreshing, setRefreshing] = useState(false);
  const [search, setSearch] = useState('');
  const themeColors = useThemeColors();
  const styles = useMemo(() => createStyles(themeColors), [themeColors]);

  useEffect(() => {
    if (user?.role === 'farmer' || user?.role === 'admin') {
      const unsubscribe = fetchInventory();
      return () => {
        if (typeof unsubscribe === 'function') unsubscribe();
      };
    }
  }, [fetchInventory, user]);

  // Dynamic cleanup for orphaned inventory (farmer no longer exists)
  useEffect(() => {
    if (user?.role === 'admin' && inventory.length > 0 && adminUsers.length > 0) {
      const validIds = adminUsers.map(u => u.id);
      const orphanedInventory = inventory.filter(i => !validIds.includes(i.farmer_id));
      
      orphanedInventory.forEach(async (item) => {
        try {
          console.log('Cleaning up orphaned inventory:', item.id);
          await deleteDoc(doc(db, 'inventory', item.id));
        } catch (e) {
          console.error('Failed to delete orphaned inventory:', e);
        }
      });
    }
  }, [inventory, user, adminUsers]);

  const navigateToEdit = (itemId = null) => {
    if (itemId) {
      router.push(`/(tabs)/inventory/edit?inventoryId=${itemId}`);
    } else {
      router.push('/(tabs)/inventory/edit');
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 500);
  };

  const filteredInventory = useMemo(() => {
    let items = inventory;
    
    // Search filter
    if (search) {
      const searchTerm = search.toLowerCase();
      items = items.filter(i => 
        (i.title || '').toLowerCase().includes(searchTerm) ||
        (i.category || '').toLowerCase().includes(searchTerm)
      );
    }

    if (user?.role === 'admin' && adminSelectedFarmerId) {
      items = items.filter(i => i.farmer_id === adminSelectedFarmerId);
    }
    // Attach farmer names for admin view
    if (user?.role === 'admin') {
      return items.map(item => {
        const farmer = adminUsers.find(u => u.id === item.farmer_id);
        return { ...item, farmer_name: farmer?.farm_name || farmer?.name || 'Unknown Farmer' };
      });
    }
    return items;
  }, [inventory, user, adminSelectedFarmerId, adminUsers, search]);

  const totalItems = filteredInventory.length;
  const listedItems = filteredInventory.filter((i) => i.is_listed).length;
  const totalStock = filteredInventory.reduce((sum, i) => sum + i.quantity, 0);

  const farmersList = useMemo(() => {
    return adminUsers.filter(u => u.role === 'farmer' || u.role === 'admin');
  }, [adminUsers]);

  if (!user || (user.role !== 'farmer' && user.role !== 'admin')) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyEmoji}>🔒</Text>
        <Text style={styles.emptyTitle}>Access Restricted</Text>
        <Text style={styles.emptySubtitle}>
          Inventory management is available for farmers and admins only
        </Text>
      </View>
    );
  }



  return (
    <View style={styles.container}>
      <FlatList
        ListHeaderComponent={(
          <>
            <View style={styles.header}>
              <GradientText colors={themeColors.gradients.primary} style={styles.title}>
                📦 Inventory
              </GradientText>
              <Text style={styles.subtitle}>Manage your farm products</Text>
            </View>

            {/* Search Bar */}
            <View style={styles.searchContainer}>
              <Text style={styles.searchIcon}>🔍</Text>
              <TextInput
                style={styles.searchInput}
                placeholder="Search inventory..."
                placeholderTextColor={themeColors.textMuted}
                value={search}
                onChangeText={setSearch}
              />
            </View>

            {/* Stats Cards */}
            <View style={styles.statsRow}>
              <LinearGradient colors={themeColors.cardGradients.default} style={styles.statCard}>
                <Text style={[styles.statValue, { color: themeColors.text }]}>{totalItems}</Text>
                <Text style={styles.statLabel}>Total Items</Text>
              </LinearGradient>
              <LinearGradient colors={themeColors.cardGradients.default} style={styles.statCard}>
                <GradientText colors={themeColors.gradients.primary} style={styles.statValue}>
                  {listedItems}
                </GradientText>
                <Text style={styles.statLabel}>Listed</Text>
              </LinearGradient>
              <LinearGradient colors={themeColors.cardGradients.default} style={styles.statCard}>
                <GradientText colors={themeColors.gradients.ph} style={styles.statValue}>
                  {totalStock.toFixed(0)}
                </GradientText>
                <Text style={styles.statLabel}>Total Stock</Text>
              </LinearGradient>
            </View>

            {/* Add Button */}
            <Pressable
              style={({ pressed }) => [styles.addBtnWrap, pressed && styles.addBtnPressed]}
              onPress={() => navigateToEdit()}
            >
              <LinearGradient
                colors={themeColors.gradients.primary}
                style={styles.addBtn}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
              >
                <Text style={styles.addBtnText}>+ Add New Item</Text>
              </LinearGradient>
            </Pressable>

            {error ? (
              <View style={styles.errorBanner}>
                <Text style={styles.errorText}>{error}</Text>
              </View>
            ) : null}

            {loading && filteredInventory.length === 0 ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color={themeColors.primary} />
                <Text style={styles.loadingText}>Loading inventory...</Text>
              </View>
            ) : null}
          </>
        )}
        data={loading && filteredInventory.length === 0 ? [] : filteredInventory}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <InventoryCard 
              item={item} 
              onPress={() => navigateToEdit(item.id)}
              themeColors={themeColors}
              styles={styles}
            />
          )}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor={themeColors.primary}
              colors={[themeColors.primary]}
            />
          }
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyEmoji}>📦</Text>
              <Text style={styles.emptyTitle}>No items yet</Text>
              <Text style={styles.emptySubtitle}>
                Add your first product to start managing your inventory
              </Text>
              <Pressable
                style={({ pressed }) => [styles.emptyBtnWrap, pressed && styles.cardPressed]}
                onPress={() => navigateToEdit()}
              >
                <LinearGradient
                  colors={themeColors.gradients.primary}
                  style={styles.emptyBtn}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                >
                  <Text style={styles.emptyBtnText}>Add First Item</Text>
                </LinearGradient>
              </Pressable>
            </View>
          }
        />
    </View>
  );
}

const createStyles = (theme) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.background,
  },
  header: {
    padding: spacing.lg,
    paddingTop: 60,
    paddingBottom: spacing.sm,
  },
  title: {
    ...typography.h1,
    color: theme.text,
  },
  subtitle: {
    ...typography.body,
    color: theme.textSecondary,
    marginTop: 4,
  },
  statsRow: {
    flexDirection: 'row',
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.md,
    gap: spacing.sm,
  },
  statCard: {
    flex: 1,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: theme.border,
    ...shadows.small,
  },
  statValue: {
    fontSize: 28,
    fontWeight: '700',
  },
  statLabel: {
    ...typography.caption,
    marginTop: 4,
    color: theme.textSecondary,
  },
  addBtnWrap: {
    marginHorizontal: spacing.lg,
    marginBottom: spacing.md,
    borderRadius: borderRadius.md,
    ...shadows.small,
  },
  addBtn: {
    padding: spacing.md,
    borderRadius: borderRadius.md,
    alignItems: 'center',
  },
  addBtnPressed: {
    opacity: 0.8,
    transform: [{ scale: 0.98 }],
  },
  addBtnText: {
    ...typography.body,
    fontWeight: '700',
    color: '#FFFFFF', 
  },
  errorBanner: {
    backgroundColor: theme.danger + '20',
    marginHorizontal: spacing.lg,
    padding: spacing.md,
    borderRadius: borderRadius.md,
    marginBottom: spacing.md,
  },
  errorText: {
    ...typography.body,
    color: theme.danger,
    textAlign: 'center',
  },
  listContent: {
    padding: spacing.lg,
    paddingBottom: 40,
  },
  loadingContainer: {
    alignItems: 'center',
    padding: spacing.xl,
  },
  loadingText: {
    ...typography.body,
    color: theme.textSecondary,
    marginTop: spacing.md,
  },
  cardWrap: {
    marginBottom: spacing.md,
    borderRadius: borderRadius.lg,
    ...shadows.card,
  },
  card: {
    borderRadius: borderRadius.lg,
    overflow: 'hidden',
    borderWidth: 1,
  },
  cardPressed: {
    opacity: 0.8,
    transform: [{ scale: 0.98 }],
  },
  cardHeader: {
    padding: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: theme.border,
  },
  cardTitleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  cardTitle: {
    ...typography.h3,
    flex: 1,
    marginRight: spacing.sm,
    color: theme.text,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: borderRadius.full,
  },
  statusText: {
    fontSize: 10,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  cardCategory: {
    ...typography.caption,
    color: theme.textMuted,
  },
  cardBody: {
    padding: spacing.md,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.xs,
  },
  infoLabel: {
    ...typography.bodySmall,
    color: theme.textSecondary,
  },
  infoValue: {
    ...typography.bodySmall,
    fontWeight: '600',
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: spacing.md,
    paddingTop: spacing.sm,
    backgroundColor: 'rgba(0,0,0,0.2)',
  },
  cardDate: {
    ...typography.caption,
    color: theme.textMuted,
  },
  cardEdit: {
    ...typography.bodySmall,
    color: theme.primary,
    fontWeight: '600',
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
    color: theme.text,
  },
  emptySubtitle: {
    ...typography.body,
    color: theme.textSecondary,
    textAlign: 'center',
    marginBottom: spacing.lg,
  },
  emptyBtnWrap: {
    borderRadius: borderRadius.md,
    ...shadows.small,
  },
  emptyBtn: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.md,
  },
  emptyBtnText: {
    ...typography.body,
    fontWeight: '600',
    color: '#FFFFFF', 
  },
  filterContainer: {
    marginHorizontal: spacing.lg,
    marginBottom: spacing.md,
  },
  dropdownBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: theme.surfaceLight,
    borderWidth: 1,
    borderColor: theme.border,
    borderRadius: borderRadius.md,
    padding: spacing.md,
  },
  dropdownBtnText: {
    ...typography.body,
    color: theme.text,
  },
  dropdownIcon: {
    color: theme.textSecondary,
    fontSize: 12,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.surfaceLight,
    marginHorizontal: spacing.lg,
    marginBottom: spacing.lg,
    paddingHorizontal: spacing.md,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: theme.border,
  },
  searchIcon: {
    fontSize: 16,
    marginRight: spacing.sm,
  },
  searchInput: {
    flex: 1,
    paddingVertical: spacing.md,
    ...typography.body,
    color: theme.text,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: theme.background,
    borderTopLeftRadius: borderRadius.xl,
    borderTopRightRadius: borderRadius.xl,
    padding: spacing.lg,
    maxHeight: '70%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  modalTitle: {
    ...typography.h3,
    color: theme.text,
  },
  modalCloseText: {
    ...typography.body,
    color: theme.primary,
    fontWeight: '600',
  },
  modalScroll: {
    marginBottom: spacing.md,
  },
  modalItem: {
    padding: spacing.md,
    borderRadius: borderRadius.md,
    marginBottom: spacing.xs,
  },
  modalItemActive: {
    backgroundColor: theme.primary + '15',
  },
  modalItemText: {
    ...typography.body,
    color: theme.text,
  },
  modalItemTextActive: {
    color: theme.primary,
    fontWeight: '700',
  },
});
