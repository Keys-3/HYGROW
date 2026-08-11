import { useState, useEffect, useCallback, useRef } from 'react';
import {
  collection,
  query,
  where,
  orderBy,
  getDocs,
  getDoc,
  addDoc,
  updateDoc,
  doc,
  serverTimestamp,
  onSnapshot,
  Timestamp,
  Unsubscribe,
  deleteDoc
} from 'firebase/firestore';
import { db } from '../../firebase';
import useAppStore from '../store/useAppStore';

export interface OrderItem {
  id: string;
  order_id: string;
  seller_id: string;
  product_name: string;
  product_description?: string;
  quantity: number;
  unit: string;
  price_per_unit: number;
  total_price: number;
  listing_id?: string;
  created_at: string;
}

export interface OrderTracking {
  id: string;
  order_id: string;
  status: string;
  location?: string;
  notes?: string;
  updated_by?: string;
  created_at: string;
}

export interface Order {
  id: string;
  customer_id: string;
  seller_id?: string;
  status: 'pending' | 'confirmed' | 'processing' | 'out_for_delivery' | 'delivered' | 'cancelled';
  total_amount: number;
  shipping_address?: string;
  shipping_city?: string;
  shipping_state?: string;
  shipping_pincode?: string;
  notes?: string;
  created_at: string;
  updated_at: string;
  items?: OrderItem[];
  tracking?: OrderTracking[];
  payment_method?: 'COD' | 'UPI';
  transaction_id?: string;
}

export interface CreateOrderData {
  items: {
    seller_id: string;
    product_name: string;
    product_description?: string;
    quantity: number;
    unit: string;
    price_per_unit: number;
    listing_id?: string;
  }[];
  shipping_address?: string;
  shipping_city?: string;
  shipping_state?: string;
  shipping_pincode?: string;
  notes?: string;
  payment_method: 'COD' | 'UPI';
  transaction_id?: string;
}

const ORDERS_COLLECTION = 'orders';
const ORDER_ITEMS_COLLECTION = 'order_items';
const ORDER_TRACKING_COLLECTION = 'order_tracking';

export default function useOrders() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const user = useAppStore((state) => state.user);
  const isAuthenticated = useAppStore((state) => state.isAuthenticated);
  const adminSelectedCustomerId = useAppStore((state) => state.adminSelectedCustomerId);
  const subscriptionsRef = useRef<Unsubscribe[]>([]);

  // Helper to fetch order details (items and tracking)
  const fetchOrderDetails = useCallback(async (orderId: string): Promise<{ items: OrderItem[]; tracking: OrderTracking[] }> => {
    // Fetch items
    const itemsQuery = query(
      collection(db, ORDER_ITEMS_COLLECTION),
      where('order_id', '==', orderId)
    );
    const itemsSnapshot = await getDocs(itemsQuery);
    const items: OrderItem[] = itemsSnapshot.docs.map(itemDoc => {
      const itemData = itemDoc.data();
      return {
        id: itemDoc.id,
        order_id: itemData.order_id,
        seller_id: itemData.seller_id,
        product_name: itemData.product_name,
        product_description: itemData.product_description || undefined,
        quantity: itemData.quantity,
        unit: itemData.unit,
        price_per_unit: itemData.price_per_unit,
        total_price: itemData.total_price,
        listing_id: itemData.listing_id || undefined,
        created_at: itemData.created_at instanceof Timestamp ? itemData.created_at.toDate().toISOString() : new Date().toISOString(),
      };
    });

    // Fetch tracking
    const trackingQuery = query(
      collection(db, ORDER_TRACKING_COLLECTION),
      where('order_id', '==', orderId),
      orderBy('created_at', 'desc')
    );
    const trackingSnapshot = await getDocs(trackingQuery);
    const tracking: OrderTracking[] = trackingSnapshot.docs.map(trackDoc => {
      const trackData = trackDoc.data();
      return {
        id: trackDoc.id,
        order_id: trackData.order_id,
        status: trackData.status,
        location: trackData.location,
        notes: trackData.notes,
        updated_by: trackData.updated_by,
        created_at: trackData.created_at instanceof Timestamp ? trackData.created_at.toDate().toISOString() : new Date().toISOString(),
      };
    });

    return { items, tracking };
  }, []);

  // Subscribe to orders in real-time
  useEffect(() => {
    // Cleanup previous subscriptions
    subscriptionsRef.current.forEach(unsub => unsub());
    subscriptionsRef.current = [];

    if (!user || !isAuthenticated) {
      setOrders([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    let ordersQuery;

    if (user.role === 'customer') {
      ordersQuery = query(
        collection(db, ORDERS_COLLECTION),
        where('customer_id', '==', user.id),
        orderBy('created_at', 'desc')
      );
    } else if (user.role === 'farmer') {
      // For farmers, we need to find orders containing their items first
      // This is a two-step process that can't be done with a single realtime query
      // We'll use a different approach: subscribe to order_items and then orders
      const itemsQuery = query(
        collection(db, ORDER_ITEMS_COLLECTION),
        where('seller_id', '==', user.id)
      );

      const unsubItems = onSnapshot(itemsQuery, async (itemsSnapshot) => {
        const orderIds = [...new Set(itemsSnapshot.docs.map(d => d.data().order_id))];

        if (orderIds.length === 0) {
          setOrders([]);
          setLoading(false);
          return;
        }

        // Subscribe to these specific orders
        const limitedOrderIds = orderIds.slice(0, 10);
        const ordersQuery = query(
          collection(db, ORDERS_COLLECTION),
          where('__name__', 'in', limitedOrderIds),
          orderBy('created_at', 'desc')
        );

        const unsubOrders = onSnapshot(ordersQuery, async (ordersSnapshot) => {
          const ordersData: Order[] = [];

          for (const orderDoc of ordersSnapshot.docs) {
            const data = orderDoc.data();
            const { items, tracking } = await fetchOrderDetails(orderDoc.id);

            ordersData.push({
              id: orderDoc.id,
              customer_id: data.customer_id,
              seller_id: data.seller_id,
              status: data.status,
              total_amount: data.total_amount,
              shipping_address: data.shipping_address,
              shipping_city: data.shipping_city,
              shipping_state: data.shipping_state,
              shipping_pincode: data.shipping_pincode,
              notes: data.notes,
              created_at: data.created_at instanceof Timestamp ? data.created_at.toDate().toISOString() : new Date().toISOString(),
              updated_at: data.updated_at instanceof Timestamp ? data.updated_at.toDate().toISOString() : new Date().toISOString(),
              payment_method: data.payment_method || 'COD',
              transaction_id: data.transaction_id,
              items,
              tracking,
            });
          }

          setOrders(ordersData);
          setLoading(false);
        }, (err) => {
          console.error('Error fetching orders:', err);
          setError(err.message);
          setLoading(false);
        });

        subscriptionsRef.current.push(unsubOrders);
      }, (err) => {
        console.error('Error fetching order items:', err);
        setError(err.message);
        setLoading(false);
      });

      subscriptionsRef.current.push(unsubItems);
      return;
    } else {
      // Admin sees all orders
      ordersQuery = query(
        collection(db, ORDERS_COLLECTION),
        orderBy('created_at', 'desc')
      );
    }

    // Subscribe to orders for customers and admins
    const unsubscribe = onSnapshot(ordersQuery, async (ordersSnapshot) => {
      const ordersData: Order[] = [];

      for (const orderDoc of ordersSnapshot.docs) {
        const data = orderDoc.data();
        const { items, tracking } = await fetchOrderDetails(orderDoc.id);

        ordersData.push({
          id: orderDoc.id,
          customer_id: data.customer_id,
          seller_id: data.seller_id,
          status: data.status,
          total_amount: data.total_amount,
          shipping_address: data.shipping_address,
          shipping_city: data.shipping_city,
          shipping_state: data.shipping_state,
          shipping_pincode: data.shipping_pincode,
          notes: data.notes,
          created_at: data.created_at instanceof Timestamp ? data.created_at.toDate().toISOString() : new Date().toISOString(),
          updated_at: data.updated_at instanceof Timestamp ? data.updated_at.toDate().toISOString() : new Date().toISOString(),
          payment_method: data.payment_method || 'COD',
          transaction_id: data.transaction_id,
          items,
          tracking,
        });
      }

      setOrders(ordersData);
      setLoading(false);
    }, (err) => {
      console.error('Error fetching orders:', err);
      setError(err.message);
      setLoading(false);
    });

    subscriptionsRef.current.push(unsubscribe);

    return () => {
      subscriptionsRef.current.forEach(unsub => unsub());
      subscriptionsRef.current = [];
    };
  }, [user, isAuthenticated, fetchOrderDetails]);

  // Force refresh (for manual refresh control)
  const fetchOrders = useCallback(async (forceRefresh = false) => {
    // With realtime subscriptions, this is mainly for manual refresh
    // The subscriptions handle automatic updates
    if (!forceRefresh) return;

    // Force refresh by briefly unsubscribing and resubscribing
    subscriptionsRef.current.forEach(unsub => unsub());
    subscriptionsRef.current = [];

    // The useEffect will re-subscribe automatically
  }, []);

  const createOrder = useCallback(async (orderData: CreateOrderData): Promise<Order> => {
    if (!user) throw new Error('Not authenticated');

    try {
      const totalAmount = orderData.items.reduce(
        (sum, item) => sum + item.price_per_unit * item.quantity,
        0
      );

      const targetCustomerId = (user.role === 'admin' && adminSelectedCustomerId) ? adminSelectedCustomerId : user.id;

      // Create order
      const orderRef = await addDoc(collection(db, ORDERS_COLLECTION), {
        customer_id: targetCustomerId,
        status: 'pending',
        total_amount: totalAmount,
        shipping_address: orderData.shipping_address || null,
        shipping_city: orderData.shipping_city || null,
        shipping_state: orderData.shipping_state || null,
        shipping_pincode: orderData.shipping_pincode || null,
        notes: orderData.notes || null,
        payment_method: orderData.payment_method,
        transaction_id: orderData.transaction_id || null,
        created_at: serverTimestamp(),
        updated_at: serverTimestamp(),
      });

      // Create order items
      const itemsPromises = orderData.items.map(item =>
        addDoc(collection(db, ORDER_ITEMS_COLLECTION), {
          order_id: orderRef.id,
          seller_id: item.seller_id,
          product_name: item.product_name,
          product_description: item.product_description || null,
          quantity: item.quantity,
          unit: item.unit,
          price_per_unit: item.price_per_unit,
          total_price: item.price_per_unit * item.quantity,
          listing_id: item.listing_id || null,
          created_at: serverTimestamp(),
        })
      );
      await Promise.all(itemsPromises);

      // Reduce stock for each item with a listing_id
      const stockUpdatePromises = orderData.items.map(async (item) => {
        if (item.listing_id) {
          const listingRef = doc(db, 'market_listings', item.listing_id);

          // Use transaction-like approach with get + update
          const listingDoc = await getDoc(listingRef);

          if (listingDoc.exists()) {
            const listingData = listingDoc.data();
            const currentStock = listingData.stock || 0;
            const newStock = Math.max(0, currentStock - item.quantity);

            await updateDoc(listingRef, {
              stock: newStock,
              updated_at: serverTimestamp(),
            });

            if (listingData.inventory_id) {
              const inventoryRef = doc(db, 'inventory', listingData.inventory_id);
              const inventoryDoc = await getDoc(inventoryRef);
              if (inventoryDoc.exists()) {
                const invData = inventoryDoc.data();
                const invStock = invData.quantity || 0;
                const newInvStock = Math.max(0, invStock - item.quantity);
                await updateDoc(inventoryRef, {
                  quantity: newInvStock,
                  updated_at: serverTimestamp(),
                });
              }
            }
          }
        }
      });
      await Promise.all(stockUpdatePromises);

      // Create initial tracking entry
      await addDoc(collection(db, ORDER_TRACKING_COLLECTION), {
        order_id: orderRef.id,
        status: 'pending',
        notes: 'Order placed',
        updated_by: user.id,
        created_at: serverTimestamp(),
      });

      // Return the new order - the subscription will update the list
      return {
        id: orderRef.id,
        customer_id: targetCustomerId,
        status: 'pending',
        total_amount: totalAmount,
        shipping_address: orderData.shipping_address,
        shipping_city: orderData.shipping_city,
        shipping_state: orderData.shipping_state,
        shipping_pincode: orderData.shipping_pincode,
        notes: orderData.notes,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        payment_method: orderData.payment_method,
        transaction_id: orderData.transaction_id,
        items: [],
        tracking: [],
      };
    } catch (err: any) {
      throw new Error(err.message || 'Failed to create order');
    }
  }, [user]);

  const updateOrderStatus = useCallback(async (
    orderId: string,
    status: Order['status'],
    notes?: string,
    location?: string
  ) => {
    try {
      // If cancelling, restore stock to listings first
      if (status === 'cancelled') {
        const itemsQuery = query(
          collection(db, ORDER_ITEMS_COLLECTION),
          where('order_id', '==', orderId)
        );
        const itemsSnapshot = await getDocs(itemsQuery);

        for (const itemDoc of itemsSnapshot.docs) {
          const itemData = itemDoc.data();
          // Check for listing_id - handle both null and string values
          const listingId = itemData.listing_id;

          if (listingId && typeof listingId === 'string' && listingId.length > 0) {
            const listingRef = doc(db, 'market_listings', listingId);

            // Fetch the current listing stock
            const listingDoc = await getDoc(listingRef);
            if (listingDoc.exists()) {
              const listingData = listingDoc.data();
              const currentStock = listingData.stock || 0;
              const restoredStock = currentStock + itemData.quantity;

              // Update the listing with restored stock
              await updateDoc(listingRef, {
                stock: restoredStock,
                updated_at: serverTimestamp(),
              });

              // ALSO RESTORE INVENTORY STOCK!
              if (listingData.inventory_id) {
                const inventoryRef = doc(db, 'inventory', listingData.inventory_id);
                const inventoryDoc = await getDoc(inventoryRef);
                if (inventoryDoc.exists()) {
                  const invData = inventoryDoc.data();
                  const currentInvStock = invData.quantity || 0;
                  const restoredInvStock = currentInvStock + itemData.quantity;
                  await updateDoc(inventoryRef, {
                    quantity: restoredInvStock,
                    updated_at: serverTimestamp(),
                  });
                }
              }
            }
          }
        }
      }

      await updateDoc(doc(db, ORDERS_COLLECTION, orderId), {
        status,
        updated_at: serverTimestamp(),
      });

      await addDoc(collection(db, ORDER_TRACKING_COLLECTION), {
        order_id: orderId,
        status,
        notes: notes || `Order marked as ${status.replace(/_/g, ' ')}`,
        location: location || null,
        updated_by: user?.id,
        created_at: serverTimestamp(),
      });

      // The subscription will automatically update the orders list
    } catch (err: any) {
      throw new Error(err.message || 'Failed to update order status');
    }
  }, [user]);

  const cancelOrder = useCallback(async (orderId: string) => {
    await updateOrderStatus(orderId, 'cancelled', 'Order cancelled by user');
  }, [updateOrderStatus]);

  const deleteOrder = useCallback(async (orderId: string) => {
    try {
      // Delete order items
      const itemsQuery = query(collection(db, ORDER_ITEMS_COLLECTION), where('order_id', '==', orderId));
      const itemsSnapshot = await getDocs(itemsQuery);
      const deleteItemsPromises = itemsSnapshot.docs.map(docSnapshot => deleteDoc(doc(db, ORDER_ITEMS_COLLECTION, docSnapshot.id)));
      await Promise.all(deleteItemsPromises);

      // Delete order tracking
      const trackingQuery = query(collection(db, ORDER_TRACKING_COLLECTION), where('order_id', '==', orderId));
      const trackingSnapshot = await getDocs(trackingQuery);
      const deleteTrackingPromises = trackingSnapshot.docs.map(docSnapshot => deleteDoc(doc(db, ORDER_TRACKING_COLLECTION, docSnapshot.id)));
      await Promise.all(deleteTrackingPromises);

      // Delete main order document
      await deleteDoc(doc(db, ORDERS_COLLECTION, orderId));
    } catch (err: any) {
      throw new Error(err.message || 'Failed to delete order');
    }
  }, []);

  return {
    orders,
    loading,
    error,
    fetchOrders,
    createOrder,
    updateOrderStatus,
    cancelOrder,
    deleteOrder,
  };
}
