import { Link, usePathname } from 'expo-router';
import {
  ChartBar as BarChart3,
  Bot,
  House,
  Package,
  Settings,
  ShoppingCart,
  Warehouse,
} from 'lucide-react-native';
import { Image, StyleSheet, Text, View } from 'react-native';
import { useMemo } from 'react';

import useAppStore from '../store/useAppStore';
import { useThemeColors } from '../theme/theme';

const getNavItems = (role: string, features: any) => {
  const items = [
    { name: 'Dashboard', icon: House, href: '/dashboard', roles: ['farmer', 'admin'], featureKey: 'sensors' },
    { name: 'AI Tools', icon: Bot, href: '/ai', roles: ['farmer', 'admin'], featureKey: 'aiTools' },
    { name: 'Market', icon: ShoppingCart, href: '/market', roles: ['customer', 'admin'] },
    { name: 'Inventory', icon: Warehouse, href: '/inventory', roles: ['farmer', 'admin'], featureKey: 'inventory' },
    { name: 'Orders', icon: Package, href: '/orders', roles: ['customer', 'admin'] },
    { name: 'Analytics', icon: BarChart3, href: '/analytics', roles: ['farmer', 'admin'], featureKey: 'analytics' },
    { name: 'Setting', icon: Settings, href: '/settings', roles: ['farmer', 'customer', 'admin'] },
  ];

  return items.filter(item => {
    // 1. Must match role
    if (!item.roles.includes(role)) return false;
    
    // 2. If it's a feature-gated tab and user is farmer/admin, check if feature is enabled
    if (item.featureKey && (role === 'farmer' || role === 'admin')) {
      if (!features || !features[item.featureKey]?.enabled) {
        return false;
      }
    }
    return true;
  });
};

export function Sidebar() {
  const pathname = usePathname();
  const user = useAppStore(state => state.user);
  const farmerFeatures = useAppStore(state => state.farmerFeatures);
  const themeColors = useThemeColors();
  const styles = useMemo(() => createStyles(themeColors), [themeColors]);

  if (!user) {
    return null;
  }

  const navItems = getNavItems(user.role, farmerFeatures);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Image
            source={require('../../assets/images/logo.png')}
            style={styles.logo}
          />
        <Text style={styles.title}>HyGrow</Text>

        <View style={styles.userBadge}>
          <Text style={styles.userName}>{user.name}</Text>
          <Text style={styles.userRole}>{user.role}</Text>
        </View>
      </View>

      <View style={styles.nav}>
        {navItems.map(item => {
          const Icon = item.icon;

          const isActive =
            pathname === item.href ||
            pathname.startsWith(`${item.href}/`);

          return (
            <Link
              key={item.name}
              href={item.href as any}
              style={[
                styles.navItem,
                isActive && styles.navItemActive,
              ]}
            >
              <Icon
                size={20}
                color={isActive ? themeColors.primary : themeColors.textMuted}
              />
              <Text
                style={[
                  styles.navText,
                  isActive && styles.navTextActive,
                ]}
              >
                {item.name}
              </Text>
            </Link>
          );
        })}
      </View>
    </View>
  );
}

const createStyles = (colors: any) => StyleSheet.create({
  container: {
    width: 240,
    height: '100%',
    backgroundColor: colors.surface,
    borderRightWidth: 1,
    borderRightColor: colors.border,
    padding: 20,
  },
  header: {
    marginBottom: 40,
  },
  logo: {
    width: 80,
    height: 80,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.primary,
    marginBottom: 8,
  },
  userBadge: {
    backgroundColor: colors.surfaceLight,
    borderRadius: 8,
    padding: 8,
  },
  userName: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
  },
  userRole: {
    fontSize: 12,
    color: colors.textSecondary,
    textTransform: 'capitalize',
  },
  nav: {
    gap: 10,
  },
  navItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 8,
    gap: 12,
  },
  navItemActive: {
    backgroundColor: colors.primary + '20',
  },
  navText: {
    fontSize: 16,
    color: colors.textMuted,
    fontWeight: '500',
  },
  navTextActive: {
    color: colors.primary,
    fontWeight: '600',
  },
});
