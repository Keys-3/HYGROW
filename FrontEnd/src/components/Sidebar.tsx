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

import useAppStore from '../store/useAppStore';
import { colors } from '../theme/theme';

const getNavItems = (role: string) => [
  { name: 'Dashboard', icon: House, href: '/dashboard', roles: ['farmer', 'admin'] },
  { name: 'AI Tools', icon: Bot, href: '/ai', roles: ['farmer', 'admin'] },
  { name: 'Market', icon: ShoppingCart, href: '/market', roles: ['customer'] },
  { name: 'Inventory', icon: Warehouse, href: '/inventory', roles: ['farmer', 'admin'] },
  { name: 'Analytics', icon: BarChart3, href: '/analytics', roles: ['farmer', 'admin'] },
  { name: 'Orders', icon: Package, href: '/orders', roles: ['customer'] },
  { name: 'Setting', icon: Settings, href: '/settings', roles: ['farmer', 'customer', 'admin'] },
].filter(item => item.roles.includes(role));

export function Sidebar() {
  const pathname = usePathname();
  const user = useAppStore(state => state.user);

  if (!user) {
    return null;
  }

  const navItems = getNavItems(user.role);

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
    color={isActive ? colors.primary : colors.textMuted}
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

const styles = StyleSheet.create({
  container: {
    width: 240,
    height: '100%',
    backgroundColor: colors.background,
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
    backgroundColor: 'rgba(16, 185, 129, 0.1)',
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
