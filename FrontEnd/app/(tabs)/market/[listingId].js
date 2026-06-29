import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable, Alert, ActivityIndicator, Modal, TextInput, KeyboardAvoidingView, Platform } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { doc, onSnapshot } from 'firebase/firestore';
import { db } from '../../../firebase';
import { colors, spacing, borderRadius, typography } from '../../../src/theme/theme';
import { formatDate } from '../../../src/utils/helpers';
import useOrders from '../../../src/hooks/useOrders';
import useAppStore from '../../../src/store/useAppStore';

export default function ListingDetailScreen() {
  const { listingId } = useLocalSearchParams();
  const router = useRouter();
  const [listing, setListing] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const user = useAppStore((state) => state.user);
  const { createOrder } = useOrders();

  const [isBuyModalVisible, setIsBuyModalVisible] = useState(false);
  const [buyQuantity, setBuyQuantity] = useState(1);
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('');
  const [stateVal, setStateVal] = useState('');
  const [pincode, setPincode] = useState('');
  const [placingOrder, setPlacingOrder] = useState(false);

  useEffect(() => {
    if (user) {
      setAddress(user.address || '');
      setCity(user.city || '');
      setStateVal(user.state || '');
      setPincode(user.pincode || '');
    }
  }, [user, isBuyModalVisible]);

  // Subscribe to listing changes in real-time
  useEffect(() => {
    if (!listingId) return;

    setLoading(true);

    const listingRef = doc(db, 'market_listings', listingId);

    const unsubscribe = onSnapshot(
      listingRef,
      (listingDoc) => {
        if (!listingDoc.exists()) {
          setError('Listing not found');
          setLoading(false);
          return;
        }

        const listingData = listingDoc.data();

        setListing({
          id: listingDoc.id,
          title: listingData.title,
          description: listingData.description,
          price: listingData.price,
          currency: listingData.currency || '₹',
          unit: listingData.unit,
          category: listingData.category,
          stock: listingData.stock,
          createdAt: listingData.created_at?.toDate?.()?.toISOString?.() || new Date().toISOString(),
          seller: {
            name: listingData.farmer_name || 'Unknown Farm',
            rating: listingData.farmer_rating || 4.5,
            location: listingData.farmer_location || 'Unknown',
          },
          farmer_id: listingData.farmer_id,
        });
        setLoading(false);
      },
      (err) => {
        console.error('Error listening to listing:', err);
        setError(err.message);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [listingId]);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={styles.loadingText}>Loading listing...</Text>
      </View>
    );
  }

  if (error || !listing) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorEmoji}>😕</Text>
        <Text style={styles.errorText}>{error || 'Listing not found'}</Text>
        <Pressable style={styles.errorBackBtn} onPress={() => router.back()}>
          <Text style={styles.errorBackBtnText}>Go Back</Text>
        </Pressable>
      </View>
    );
  }

  const handleContact = () => {
    Alert.alert('Contact Seller', `Message sent to ${listing.seller.name}!`);
  };

  const handlePlaceOrder = async () => {
    if (!address.trim()) {
      Alert.alert('Error', 'Please enter a shipping address');
      return;
    }
    if (!city.trim()) {
      Alert.alert('Error', 'Please enter a city');
      return;
    }
    if (!stateVal.trim()) {
      Alert.alert('Error', 'Please enter a state');
      return;
    }
    if (!pincode.trim()) {
      Alert.alert('Error', 'Please enter a pincode');
      return;
    }

    try {
      setPlacingOrder(true);

      const orderData = {
        items: [{
          seller_id: listing.farmer_id || '',
          product_name: listing.title,
          product_description: listing.description || '',
          quantity: buyQuantity,
          unit: listing.unit,
          price_per_unit: listing.price,
          listing_id: listing.id, // Important: pass listing_id for stock management
        }],
        shipping_address: address.trim(),
        shipping_city: city.trim(),
        shipping_state: stateVal.trim(),
        shipping_pincode: pincode.trim(),
        notes: "Placed via Marketplace Buy Now",
      };

      // Create order (stock is updated inside createOrder)
      const newOrder = await createOrder(orderData);

      Alert.alert('Success', 'Your order has been placed successfully!', [
        {
          text: 'View Order',
          onPress: () => {
            setIsBuyModalVisible(false);
            router.push(`/(tabs)/orders/${newOrder.id}`);
          }
        },
        {
          text: 'OK',
          onPress: () => {
            setIsBuyModalVisible(false);
          }
        }
      ]);
    } catch (err) {
      console.error('Order creation failed:', err);
      Alert.alert('Error', err.message || 'Failed to place order. Please try again.');
    } finally {
      setPlacingOrder(false);
    }
  };

  const firstLetter = listing.title ? listing.title.charAt(0).toUpperCase() : '?';

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Pressable onPress={() => router.back()} style={styles.backBtn}>
        <Text style={styles.backText}>← Back</Text>
      </Pressable>

      <View style={styles.imagePlaceholder}>
        <Text style={styles.imageText}>{firstLetter}</Text>
      </View>

      <View style={styles.header}>
        <View style={styles.badge}>
          <Text style={styles.badgeText}>{listing.category}</Text>
        </View>
        <Text style={styles.title}>{listing.title}</Text>
        <Text style={styles.price}>
          {listing.currency}
          {listing.price} <Text style={styles.unit}>{listing.unit}</Text>
        </Text>
      </View>

      <View style={styles.sellerCard}>
        <View style={styles.sellerHeader}>
          <View style={styles.avatarPlaceholder}>
            <Text style={styles.avatarText}>
              {listing.seller.name.charAt(0)}
            </Text>
          </View>
          <View style={styles.sellerInfo}>
            <Text style={styles.sellerName}>{listing.seller.name}</Text>
            <Text style={styles.sellerLocation}>
              📍 {listing.seller.location}
            </Text>
          </View>
          <View style={styles.ratingBadge}>
            <Text style={styles.ratingText}>⭐ {listing.seller.rating}</Text>
          </View>
        </View>
      </View>

      <View style={styles.detailsSection}>
        <Text style={styles.sectionTitle}>Description</Text>
        <Text style={styles.description}>
          {listing.description || 'No description available.'}
        </Text>

        <View style={styles.metaRow}>
          <Text style={styles.metaLabel}>Available Stock:</Text>
          <Text style={styles.metaValue}>
            {listing.stock} {listing.unit.replace('per ', '')}s
          </Text>
        </View>
        <View style={styles.metaRow}>
          <Text style={styles.metaLabel}>Listed On:</Text>
          <Text style={styles.metaValue}>
            {formatDate(listing.createdAt)}
          </Text>
        </View>
      </View>

      {/* Button Row / Actions */}
      {user?.role === 'customer' ? (
        <View style={styles.buttonRow}>
          <Pressable
            style={({ pressed }) => [
              styles.contactBtnHalf,
              pressed && styles.pressed,
            ]}
            onPress={handleContact}
          >
            <Text style={styles.contactBtnText}>Contact Seller</Text>
          </Pressable>

          <Pressable
            style={({ pressed }) => [
              listing.stock > 0 ? styles.buyBtn : styles.disabledBtn,
              pressed && styles.pressed,
            ]}
            onPress={() => listing.stock > 0 && setIsBuyModalVisible(true)}
            disabled={listing.stock <= 0}
          >
            <Text style={styles.buyBtnText}>
              {listing.stock > 0 ? 'Buy Now' : 'Out of Stock'}
            </Text>
          </Pressable>
        </View>
      ) : (
        <Pressable
          style={({ pressed }) => [
            styles.contactBtn,
            pressed && styles.pressed,
          ]}
          onPress={handleContact}
        >
          <Text style={styles.contactBtnText}>Contact Seller</Text>
        </Pressable>
      )}

      {/* Checkout Modal */}
      <Modal
        visible={isBuyModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setIsBuyModalVisible(false)}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.modalOverlay}
        >
          <ScrollView 
            style={styles.modalContainer}
            contentContainerStyle={styles.modalContent}
            keyboardShouldPersistTaps="handled"
          >
            <Text style={styles.modalTitle}>Checkout produce</Text>
            
            <View style={styles.modalItemDetails}>
              <Text style={styles.modalItemTitle}>{listing.title}</Text>
              <Text style={styles.modalItemSub}>Price: {listing.currency}{listing.price} {listing.unit}</Text>
              <Text style={styles.modalItemSub}>Available Stock: {listing.stock} {listing.unit.replace('per ', '')}s</Text>
            </View>

            {/* Quantity Selector */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Select Quantity</Text>
              <View style={styles.qtyContainer}>
                <Pressable 
                  style={styles.qtyBtn} 
                  onPress={() => setBuyQuantity(q => Math.max(1, q - 1))}
                >
                  <Text style={styles.qtyBtnText}>-</Text>
                </Pressable>
                <Text style={styles.qtyValue}>{buyQuantity}</Text>
                <Pressable 
                  style={styles.qtyBtn} 
                  onPress={() => setBuyQuantity(q => Math.min(listing.stock, q + 1))}
                >
                  <Text style={styles.qtyBtnText}>+</Text>
                </Pressable>
              </View>
            </View>

            {/* Shipping details */}
            <Text style={styles.modalSectionTitle}>Shipping Information</Text>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Address *</Text>
              <TextInput
                style={styles.textInput}
                placeholder="Street address, apartment, sector..."
                placeholderTextColor={colors.textMuted}
                value={address}
                onChangeText={setAddress}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>City *</Text>
              <TextInput
                style={styles.textInput}
                placeholder="e.g. New Delhi"
                placeholderTextColor={colors.textMuted}
                value={city}
                onChangeText={setCity}
              />
            </View>

            <View style={styles.row}>
              <View style={[styles.inputGroup, { flex: 1, marginRight: spacing.sm }]}>
                <Text style={styles.inputLabel}>State *</Text>
                <TextInput
                  style={styles.textInput}
                  placeholder="e.g. Delhi"
                  placeholderTextColor={colors.textMuted}
                  value={stateVal}
                  onChangeText={setStateVal}
                />
              </View>
              <View style={[styles.inputGroup, { flex: 1 }]}>
                <Text style={styles.inputLabel}>Pincode *</Text>
                <TextInput
                  style={styles.textInput}
                  placeholder="e.g. 110001"
                  placeholderTextColor={colors.textMuted}
                  value={pincode}
                  onChangeText={setPincode}
                  keyboardType="number-pad"
                />
              </View>
            </View>

            {/* Order Summary */}
            <View style={styles.summaryContainer}>
              <Text style={styles.summaryTitle}>Order Summary</Text>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Items total:</Text>
                <Text style={styles.summaryValue}>{listing.currency}{(listing.price * buyQuantity).toFixed(2)}</Text>
              </View>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Delivery charges:</Text>
                <Text style={[styles.summaryValue, { color: colors.success }]}>FREE</Text>
              </View>
              <View style={styles.divider} />
              <View style={styles.summaryRow}>
                <Text style={styles.summaryTotalLabel}>Order Total:</Text>
                <Text style={styles.summaryTotalValue}>{listing.currency}{(listing.price * buyQuantity).toFixed(2)}</Text>
              </View>
            </View>

            {/* Action Buttons */}
            <View style={styles.modalActions}>
              <Pressable 
                style={({ pressed }) => [styles.modalCancelBtn, pressed && styles.pressed]}
                onPress={() => setIsBuyModalVisible(false)}
                disabled={placingOrder}
              >
                <Text style={styles.modalCancelBtnText}>Cancel</Text>
              </Pressable>

              <Pressable 
                style={({ pressed }) => [styles.modalConfirmBtn, pressed && styles.pressed]}
                onPress={handlePlaceOrder}
                disabled={placingOrder}
              >
                {placingOrder ? (
                  <ActivityIndicator color={colors.background} size="small" />
                ) : (
                  <Text style={styles.modalConfirmBtnText}>Place Order</Text>
                )}
              </Pressable>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </Modal>

      <View style={{ height: 40 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    backgroundColor: colors.background,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    ...typography.body,
    color: colors.textSecondary,
    marginTop: spacing.md,
  },
  errorContainer: {
    flex: 1,
    backgroundColor: colors.background,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.xl,
  },
  errorEmoji: {
    fontSize: 64,
    marginBottom: spacing.md,
  },
  errorText: {
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
    fontWeight: '600',
    color: colors.background,
  },
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    padding: spacing.lg,
    paddingTop: 60,
  },
  backBtn: {
    marginBottom: spacing.md,
  },
  backText: {
    color: colors.primary,
    ...typography.body,
    fontWeight: '600',
  },
  imagePlaceholder: {
    height: 250,
    backgroundColor: colors.surfaceLight,
    borderRadius: borderRadius.lg,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  imageText: {
    fontSize: 80,
    fontWeight: 'bold',
    color: colors.primary + '40',
  },
  header: {
    marginBottom: spacing.lg,
  },
  badge: {
    backgroundColor: colors.surfaceLight,
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: borderRadius.full,
    alignSelf: 'flex-start',
    marginBottom: spacing.sm,
  },
  badgeText: {
    ...typography.caption,
    color: colors.primary,
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  title: {
    ...typography.h1,
    marginBottom: spacing.xs,
  },
  price: {
    ...typography.h2,
    color: colors.primary,
  },
  unit: {
    ...typography.body,
    color: colors.textSecondary,
  },
  sellerCard: {
    backgroundColor: colors.surface,
    padding: spacing.md,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: spacing.lg,
  },
  sellerHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatarPlaceholder: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.primary + '20',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.md,
  },
  avatarText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.primary,
  },
  sellerInfo: {
    flex: 1,
  },
  sellerName: {
    ...typography.body,
    fontWeight: '600',
    marginBottom: 2,
  },
  sellerLocation: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  ratingBadge: {
    backgroundColor: colors.surfaceLight,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: borderRadius.sm,
  },
  ratingText: {
    ...typography.caption,
    fontWeight: '600',
  },
  detailsSection: {
    marginBottom: spacing.xl,
  },
  sectionTitle: {
    ...typography.h3,
    marginBottom: spacing.sm,
  },
  description: {
    ...typography.body,
    color: colors.textSecondary,
    lineHeight: 24,
    marginBottom: spacing.lg,
  },
  metaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  metaLabel: {
    ...typography.body,
    color: colors.textSecondary,
  },
  metaValue: {
    ...typography.body,
    fontWeight: '600',
  },
  contactBtn: {
    backgroundColor: colors.primary,
    padding: spacing.md,
    borderRadius: borderRadius.md,
    alignItems: 'center',
  },
  pressed: {
    opacity: 0.8,
  },
  contactBtnText: {
    ...typography.body,
    fontWeight: '700',
    color: colors.background,
  },
  buttonRow: {
    flexDirection: 'row',
    gap: spacing.md,
    marginTop: spacing.md,
  },
  contactBtnHalf: {
    flex: 1,
    backgroundColor: colors.surfaceLight,
    padding: spacing.md,
    borderRadius: borderRadius.md,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
  },
  buyBtn: {
    flex: 1,
    backgroundColor: colors.primary,
    padding: spacing.md,
    borderRadius: borderRadius.md,
    alignItems: 'center',
  },
  buyBtnText: {
    ...typography.body,
    fontWeight: '700',
    color: colors.background,
  },
  disabledBtn: {
    flex: 1,
    backgroundColor: colors.surfaceLight,
    padding: spacing.md,
    borderRadius: borderRadius.md,
    alignItems: 'center',
    opacity: 0.5,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: colors.overlay,
    justifyContent: 'flex-end',
  },
  modalContainer: {
    backgroundColor: colors.background,
    borderTopLeftRadius: borderRadius.xl,
    borderTopRightRadius: borderRadius.xl,
    maxHeight: '90%',
  },
  modalContent: {
    padding: spacing.lg,
    paddingBottom: 50,
  },
  modalTitle: {
    ...typography.h2,
    marginBottom: spacing.md,
  },
  modalItemDetails: {
    backgroundColor: colors.surface,
    padding: spacing.md,
    borderRadius: borderRadius.md,
    marginBottom: spacing.lg,
    borderWidth: 1,
    borderColor: colors.border,
  },
  modalItemTitle: {
    ...typography.h3,
    marginBottom: 4,
  },
  modalItemSub: {
    ...typography.bodySmall,
    color: colors.textSecondary,
    marginTop: 2,
  },
  modalSectionTitle: {
    ...typography.h3,
    marginTop: spacing.md,
    marginBottom: spacing.sm,
  },
  qtyContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: spacing.xs,
  },
  qtyBtn: {
    backgroundColor: colors.surfaceLight,
    width: 40,
    height: 40,
    borderRadius: borderRadius.sm,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
  },
  qtyBtnText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.text,
  },
  qtyValue: {
    ...typography.h3,
    marginHorizontal: spacing.lg,
  },
  inputGroup: {
    marginBottom: spacing.md,
  },
  inputLabel: {
    ...typography.label,
    marginBottom: spacing.xs,
  },
  textInput: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    color: colors.text,
    fontSize: 16,
  },
  row: {
    flexDirection: 'row',
  },
  summaryContainer: {
    backgroundColor: colors.surface,
    padding: spacing.md,
    borderRadius: borderRadius.md,
    marginTop: spacing.md,
    marginBottom: spacing.lg,
    borderWidth: 1,
    borderColor: colors.border,
  },
  summaryTitle: {
    ...typography.body,
    fontWeight: '700',
    marginBottom: spacing.sm,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: 4,
  },
  summaryLabel: {
    ...typography.bodySmall,
    color: colors.textSecondary,
  },
  summaryValue: {
    ...typography.bodySmall,
    fontWeight: '600',
  },
  summaryTotalLabel: {
    ...typography.body,
    fontWeight: '700',
  },
  summaryTotalValue: {
    ...typography.h3,
    color: colors.primary,
  },
  modalActions: {
    flexDirection: 'row',
    gap: spacing.md,
    marginTop: spacing.md,
  },
  modalCancelBtn: {
    flex: 1,
    backgroundColor: colors.surfaceLight,
    padding: spacing.md,
    borderRadius: borderRadius.md,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
  },
  modalCancelBtnText: {
    ...typography.body,
    fontWeight: '600',
    color: colors.text,
  },
  modalConfirmBtn: {
    flex: 1,
    backgroundColor: colors.primary,
    padding: spacing.md,
    borderRadius: borderRadius.md,
    alignItems: 'center',
  },
  modalConfirmBtnText: {
    ...typography.body,
    fontWeight: '700',
    color: colors.background,
  },
});
