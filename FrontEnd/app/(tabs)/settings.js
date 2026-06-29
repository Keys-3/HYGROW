import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable, Switch, Modal } from 'react-native';
import { useRouter } from 'expo-router';
import { colors, spacing, borderRadius, typography } from '../../src/theme/theme';
import useAppStore from '../../src/store/useAppStore';
import useAuth from '../../src/hooks/useAuth';
import { deviceInfo } from '../../src/data/dummyData';
import { formatDate, formatTime } from '../../src/utils/helpers';
import permissionManager from '../../src/services/permissionManager';

const ROLE_CONFIG = {
  farmer: { label: 'Farmer', icon: '🚜', color: colors.success },
  customer: { label: 'Customer', icon: '🛒', color: colors.info },
  admin: { label: 'Administrator', icon: '🛡️', color: colors.warning },
};

export default function SettingsScreen() {
  const router = useRouter();
  const { user, logout } = useAuth();
  const isDarkMode = useAppStore((state) => state.isDarkMode);
  const toggleTheme = useAppStore((state) => state.toggleTheme);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const [permissions, setPermissions] = useState({
    camera: false,
    storage: false,
    notifications: false,
  });

  // Check permissions on mount
  useEffect(() => {
    let active = true;
    const checkAll = async () => {
      const status = await permissionManager.checkPermissions();
      if (active) {
        setPermissions(status);
      }
    };
    checkAll();
    return () => {
      active = false;
    };
  }, []);

  const requestCameraPermission = async () => {
    const success = await permissionManager.requestCamera();
    setPermissions((prev) => ({ ...prev, camera: success }));
  };

  const requestStoragePermission = async () => {
    const success = await permissionManager.requestStorage();
    setPermissions((prev) => ({ ...prev, storage: success }));
  };

  const requestNotificationPermission = async () => {
    const success = await permissionManager.requestNotifications();
    setPermissions((prev) => ({ ...prev, notifications: success }));
  };

  const requestAllPermissions = async () => {
    const status = await permissionManager.requestAll();
    setPermissions(status);
  };

  const handleLogoutPress = () => {
    setShowLogoutModal(true);
  };

  const handleConfirmLogout = async () => {
    setIsLoggingOut(true);
    try {
      await logout();
    } catch (error) {
      console.error('Logout failed:', error);
    } finally {
      setShowLogoutModal(false);
      setIsLoggingOut(false);
    }
  };

  const roleConfig = ROLE_CONFIG[user?.role] || ROLE_CONFIG.farmer;
  const isCustomer = user?.role === 'customer';
  const isFarmer = user?.role === 'farmer';
  const isAdmin = user?.role === 'admin';

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <Text style={styles.title}>Settings</Text>
      </View>

      {/* Account Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Account</Text>
        <View style={styles.card}>
          <View style={styles.profileRow}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>{user?.name?.charAt(0).toUpperCase() || '?'}</Text>
            </View>
            <View style={styles.profileInfo}>
              <Text style={styles.userName}>{user?.name || 'User'}</Text>
              <Text style={styles.userEmail}>{user?.email}</Text>
              <View style={[styles.roleBadge, { backgroundColor: roleConfig.color + '20' }]}>
                <Text style={styles.roleIcon}>{roleConfig.icon}</Text>
                <Text style={[styles.roleText, { color: roleConfig.color }]}>{roleConfig.label}</Text>
              </View>
            </View>
          </View>
        </View>
      </View>

      {/* Contact/Shipping Info */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>{isFarmer ? 'Farm Details' : 'Contact Details'}</Text>
        <View style={styles.card}>
          {isFarmer && user?.farm_name && (
            <>
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Farm Name</Text>
                <Text style={styles.infoValue}>{user.farm_name}</Text>
              </View>
              <View style={styles.divider} />
            </>
          )}
          {isFarmer && user?.farm_location && (
            <>
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Farm Location</Text>
                <Text style={styles.infoValue}>{user.farm_location}</Text>
              </View>
              <View style={styles.divider} />
            </>
          )}
          {user?.phone && (
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Phone</Text>
              <Text style={styles.infoValue}>{user.phone}</Text>
            </View>
          )}
          {(user?.address || user?.city || user?.state || user?.pincode) && (
            <>
              {user?.address && (
                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>Address</Text>
                  <Text style={styles.infoValue}>{user.address}</Text>
                </View>
              )}
              {(user?.city || user?.state) && (
                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>City/State</Text>
                  <Text style={styles.infoValue}>{user.city}{user.city && user?.state ? ', ' : ''}{user.state}</Text>
                </View>
              )}
              {user?.pincode && (
                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>Pincode</Text>
                  <Text style={styles.infoValue}>{user.pincode}</Text>
                </View>
              )}
            </>
          )}
        </View>
      </View>

      {/* App Settings */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>App Settings</Text>
        <View style={styles.card}>
          <View style={styles.settingRow}>
            <Text style={styles.settingLabel}>Dark Mode</Text>
            <Switch
              value={isDarkMode}
              onValueChange={toggleTheme}
              trackColor={{ false: colors.surfaceLight, true: colors.primary + '60' }}
              thumbColor={isDarkMode ? colors.primary : colors.textMuted}
            />
          </View>
          <View style={styles.divider} />
          <View style={styles.settingRow}>
            <Text style={styles.settingLabel}>Push Notifications</Text>
            <Switch
              value={permissions.notifications}
              onValueChange={requestNotificationPermission}
              trackColor={{ false: colors.surfaceLight, true: colors.primary + '60' }}
              thumbColor={permissions.notifications ? colors.primary : colors.textMuted}
            />
          </View>
        </View>
      </View>

      {/* Farmer Permissions */}
      {isFarmer && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Essential Farmer Permissions</Text>
          <View style={styles.card}>
            <View style={styles.permissionIntroRow}>
              <Text style={styles.permissionIntroText}>
                Please grant the following device permissions to enable core farming assistance features.
              </Text>
            </View>

            <View style={styles.divider} />

            {/* Camera Permission */}
            <View style={styles.permissionRow}>
              <View style={styles.permissionTextContainer}>
                <Text style={styles.permissionRowTitle}>📸 Camera Access</Text>
                <Text style={styles.permissionRowDesc}>Required for scanning crop leaves to detect plant diseases via AI.</Text>
              </View>
              <Pressable
                style={({ pressed }) => [
                  styles.grantBtn,
                  permissions.camera && styles.grantBtnSuccess,
                  pressed && styles.pressed
                ]}
                onPress={requestCameraPermission}
                disabled={permissions.camera}
              >
                <Text style={[styles.grantBtnText, permissions.camera && styles.grantBtnTextSuccess]}>
                  {permissions.camera ? 'Granted ✓' : 'Grant'}
                </Text>
              </Pressable>
            </View>

            <View style={styles.divider} />

            {/* Storage Permission */}
            <View style={styles.permissionRow}>
              <View style={styles.permissionTextContainer}>
                <Text style={styles.permissionRowTitle}>💾 Storage Access</Text>
                <Text style={styles.permissionRowDesc}>Required to upload crop logs and save weekly growth reports.</Text>
              </View>
              <Pressable
                style={({ pressed }) => [
                  styles.grantBtn,
                  permissions.storage && styles.grantBtnSuccess,
                  pressed && styles.pressed
                ]}
                onPress={requestStoragePermission}
                disabled={permissions.storage}
              >
                <Text style={[styles.grantBtnText, permissions.storage && styles.grantBtnTextSuccess]}>
                  {permissions.storage ? 'Granted ✓' : 'Grant'}
                </Text>
              </Pressable>
            </View>

            <View style={styles.divider} />

            {/* Notifications Permission */}
            <View style={styles.permissionRow}>
              <View style={styles.permissionTextContainer}>
                <Text style={styles.permissionRowTitle}>🔔 Sensor Alerts</Text>
                <Text style={styles.permissionRowDesc}>Required to receive instant alerts if sensor readings go offline or cross safe levels.</Text>
              </View>
              <Pressable
                style={({ pressed }) => [
                  styles.grantBtn,
                  permissions.notifications && styles.grantBtnSuccess,
                  pressed && styles.pressed
                ]}
                onPress={requestNotificationPermission}
                disabled={permissions.notifications}
              >
                <Text style={[styles.grantBtnText, permissions.notifications && styles.grantBtnTextSuccess]}>
                  {permissions.notifications ? 'Granted ✓' : 'Grant'}
                </Text>
              </Pressable>
            </View>

            <View style={styles.divider} />

            {/* Request All Action Button */}
            <Pressable
              style={({ pressed }) => [
                styles.grantAllBtn,
                (permissions.camera && permissions.storage && permissions.notifications) && styles.grantAllBtnDisabled,
                pressed && styles.pressed
              ]}
              onPress={requestAllPermissions}
              disabled={permissions.camera && permissions.storage && permissions.notifications}
            >
              <Text style={[styles.grantAllBtnText, (permissions.camera && permissions.storage && permissions.notifications) && { color: colors.textSecondary }]}>
                {permissions.camera && permissions.storage && permissions.notifications
                  ? 'All Permissions Granted ✓'
                  : 'Grant All Permissions'}
              </Text>
            </Pressable>
          </View>
        </View>
      )}

      {/* Device Info - Only for Farmer/Admin */}
      {!isCustomer && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Device Information</Text>
          <View style={styles.card}>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Device ID</Text>
              <Text style={styles.infoValue}>{deviceInfo.deviceId}</Text>
            </View>
            <View style={styles.divider} />
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Firmware</Text>
              <Text style={styles.infoValue}>v{deviceInfo.firmwareVersion}</Text>
            </View>
            <View style={styles.divider} />
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>IP Address</Text>
              <Text style={styles.infoValue}>{deviceInfo.ipAddress}</Text>
            </View>
            <View style={styles.divider} />
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Last Boot</Text>
              <Text style={styles.infoValue}>{formatDate(deviceInfo.lastBoot)} {formatTime(deviceInfo.lastBoot)}</Text>
            </View>
          </View>
        </View>
      )}

      {/* Admin Panel Link - Only for Admin */}
      {isAdmin && (
        <View style={styles.section}>
          <Pressable style={({ pressed }) => [styles.adminCard, pressed && styles.pressed]}>
            <Text style={styles.adminIcon}>🛡️</Text>
            <View style={styles.adminInfo}>
              <Text style={styles.adminTitle}>Admin Panel</Text>
              <Text style={styles.adminDesc}>Manage users, orders, and settings</Text>
            </View>
            <Text style={styles.adminArrow}>→</Text>
          </Pressable>
        </View>
      )}

      {/* Orders Link - For Customers */}
      {isCustomer && (
        <Pressable
          style={({ pressed }) => [styles.ordersBtn, pressed && styles.pressed]}
          onPress={() => router.push('/(tabs)/orders')}
        >
          <Text style={styles.ordersBtnIcon}>📦</Text>
          <Text style={styles.ordersBtnText}>View My Orders</Text>
        </Pressable>
      )}

      <Pressable style={({ pressed }) => [styles.logoutBtn, pressed && styles.pressed]} onPress={handleLogoutPress}>
        <Text style={styles.logoutBtnText}>Sign Out</Text>
      </Pressable>

      {/* Logout Confirmation Modal */}
      <Modal
        visible={showLogoutModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowLogoutModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Sign Out</Text>
            <Text style={styles.modalMessage}>Are you sure you want to sign out?</Text>
            <View style={styles.modalActions}>
              <Pressable
                style={({ pressed }) => [styles.modalBtn, styles.modalBtnCancel, pressed && styles.pressed]}
                onPress={() => setShowLogoutModal(false)}
                disabled={isLoggingOut}
              >
                <Text style={styles.modalBtnCancelText}>Cancel</Text>
              </Pressable>
              <Pressable
                style={({ pressed }) => [styles.modalBtn, styles.modalBtnConfirm, pressed && styles.pressed]}
                onPress={handleConfirmLogout}
                disabled={isLoggingOut}
              >
                {isLoggingOut ? (
                  <Text style={styles.modalBtnConfirmText}>Signing out...</Text>
                ) : (
                  <Text style={styles.modalBtnConfirmText}>Sign Out</Text>
                )}
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>

      <Text style={styles.version}>HyGrow v1.0.0</Text>

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
  },
  header: {
    marginBottom: spacing.xl,
  },
  title: {
    ...typography.h1,
  },
  section: {
    marginBottom: spacing.lg,
  },
  sectionTitle: {
    ...typography.label,
    marginBottom: spacing.sm,
    marginLeft: spacing.xs,
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  profileRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.sm,
  },
  avatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: colors.primary + '20',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: colors.primary + '40',
    marginRight: spacing.md,
  },
  avatarText: {
    fontSize: 28,
    fontWeight: 'bold',
    color: colors.primary,
  },
  profileInfo: {
    flex: 1,
  },
  userName: {
    ...typography.h2,
    marginBottom: 4,
  },
  userEmail: {
    ...typography.body,
    color: colors.textSecondary,
    marginBottom: spacing.sm,
  },
  roleBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: borderRadius.full,
    alignSelf: 'flex-start',
  },
  roleIcon: {
    fontSize: 14,
    marginRight: 4,
  },
  roleText: {
    ...typography.caption,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  settingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.sm,
  },
  settingLabel: {
    ...typography.body,
  },
  divider: {
    height: 1,
    backgroundColor: colors.border,
    marginVertical: spacing.xs,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.sm,
  },
  infoLabel: {
    ...typography.body,
    color: colors.textSecondary,
  },
  infoValue: {
    ...typography.body,
    fontWeight: '500',
  },
  adminCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.warning + '10',
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.warning + '30',
  },
  adminIcon: {
    fontSize: 32,
    marginRight: spacing.md,
  },
  adminInfo: {
    flex: 1,
  },
  adminTitle: {
    ...typography.body,
    fontWeight: '600',
  },
  adminDesc: {
    ...typography.caption,
    color: colors.textSecondary,
    marginTop: 2,
  },
  adminArrow: {
    fontSize: 20,
    color: colors.warning,
  },
  ordersBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primary + '10',
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.primary + '30',
    marginBottom: spacing.lg,
    justifyContent: 'center',
  },
  ordersBtnIcon: {
    fontSize: 20,
    marginRight: spacing.sm,
  },
  ordersBtnText: {
    ...typography.body,
    color: colors.primary,
    fontWeight: '600',
  },
  logoutBtn: {
    backgroundColor: colors.danger + '20',
    padding: spacing.md,
    borderRadius: borderRadius.md,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.danger + '50',
    marginBottom: spacing.lg,
  },
  pressed: {
    opacity: 0.8,
  },
  logoutBtnText: {
    ...typography.body,
    color: colors.danger,
    fontWeight: '600',
  },
  version: {
    ...typography.caption,
    textAlign: 'center',
    color: colors.textMuted,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.lg,
  },
  modalContent: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.xl,
    padding: spacing.xl,
    width: '100%',
    maxWidth: 360,
    borderWidth: 1,
    borderColor: colors.border,
  },
  modalTitle: {
    ...typography.h2,
    textAlign: 'center',
    marginBottom: spacing.sm,
  },
  modalMessage: {
    ...typography.body,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: spacing.xl,
  },
  modalActions: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  modalBtn: {
    flex: 1,
    padding: spacing.md,
    borderRadius: borderRadius.md,
    alignItems: 'center',
  },
  modalBtnCancel: {
    backgroundColor: colors.surfaceLight,
    borderWidth: 1,
    borderColor: colors.border,
  },
  modalBtnCancelText: {
    ...typography.body,
    fontWeight: '600',
    color: colors.text,
  },
  modalBtnConfirm: {
    backgroundColor: colors.danger,
  },
  modalBtnConfirmText: {
    ...typography.body,
    fontWeight: '600',
    color: colors.background,
  },
  permissionIntroRow: {
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.sm,
  },
  permissionIntroText: {
    ...typography.bodySmall,
    color: colors.textSecondary,
    lineHeight: 18,
  },
  permissionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.sm,
    gap: spacing.md,
  },
  permissionTextContainer: {
    flex: 1,
  },
  permissionRowTitle: {
    ...typography.body,
    fontWeight: '600',
    marginBottom: 2,
  },
  permissionRowDesc: {
    ...typography.caption,
    color: colors.textSecondary,
    lineHeight: 14,
  },
  grantBtn: {
    backgroundColor: colors.surfaceLight,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: borderRadius.md,
    minWidth: 80,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
  },
  grantBtnSuccess: {
    backgroundColor: colors.success + '20',
    borderColor: colors.success + '40',
  },
  grantBtnText: {
    ...typography.caption,
    fontWeight: '700',
    color: colors.text,
  },
  grantBtnTextSuccess: {
    color: colors.success,
  },
  grantAllBtn: {
    backgroundColor: colors.primary,
    padding: spacing.md,
    borderRadius: borderRadius.md,
    alignItems: 'center',
    marginTop: spacing.sm,
  },
  grantAllBtnDisabled: {
    backgroundColor: colors.surfaceLight,
    opacity: 0.6,
  },
  grantAllBtnText: {
    ...typography.body,
    fontWeight: '700',
    color: '#0F172A',
  },
});
