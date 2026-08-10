import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import useAuth from '../../src/hooks/useAuth';
import type { UserRole } from '../../src/store/slices/authSlice';
import useAppStore from '../../src/store/useAppStore';
import { borderRadius, useThemeColors, spacing, typography } from '../../src/theme/theme';

const ROLES: { key: UserRole; label: string; icon: string; description: string }[] = [
  { key: 'farmer', label: 'Farmer', icon: ' 🚜', description: 'Manage your hydroponic farm' },
  { key: 'customer', label: 'Customer', icon: ' 🛒', description: 'Shop fresh produce' },
  { key: 'admin', label: 'Admin', icon: '️🛡️', description: 'Manage all operations' },
];

export default function SignupScreen() {
  const router = useRouter();
  const themeColors = useThemeColors();
  const styles = createStyles(themeColors);
  const { signup, authInitialized } = useAuth();
  const user = useAppStore((state) => state.user);
  const isAuthenticated = useAppStore((state) => state.isAuthenticated);

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [role, setRole] = useState<UserRole>('farmer');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [pincode, setPincode] = useState('');
  const [farmName, setFarmName] = useState('');
  const [farmLocation, setFarmLocation] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Redirect if already authenticated
  useEffect(() => {
    if (authInitialized && isAuthenticated && user) {
      if (user.role === 'customer') {
        router.replace('/(tabs)/market');
      } else {
        router.replace('/(tabs)/dashboard');
      }
    }
  }, [authInitialized, isAuthenticated, user, router]);

  // Show loading while checking auth state
  if (!authInitialized) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={themeColors.primary} />
        <Text style={styles.loadingText}>Loading...</Text>
      </View>
    );
  }

  const handleSignup = async () => {
    if (!name.trim()) {
      setError('Name is required');
      return;
    }
    if (!email.trim()) {
      setError('Email is required');
      return;
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    try {
      setLoading(true);
      setError('');

      await signup({
        name: name.trim(),
        email: email.trim().toLowerCase(),
        password,
        role,
        phone: phone.trim() || undefined,
        address: address.trim() || undefined,
        city: city.trim() || undefined,
        state: state.trim() || undefined,
        pincode: pincode.trim() || undefined,
        farm_name: role === 'farmer' ? farmName.trim() : undefined,
        farm_location: role === 'farmer' ? farmLocation.trim() : undefined,
      });

      // Auth state change will trigger redirect via useEffect
    } catch (err: any) {
      setError(err.message || 'Signup failed');
    } finally {
      setLoading(false);
    }
  };

  const renderRoleSpecificFields = () => {
    if (role === 'farmer') {
      return (
        <>
          <View style={styles.inputWrapper}>
            <Text style={styles.inputLabel}>Farm Name</Text>
            <TextInput
              style={styles.input}
              placeholder="Green Valley Farm"
              placeholderTextColor={themeColors.textMuted}
              value={farmName}
              onChangeText={setFarmName}
              editable={!loading}
            />
          </View>
          <View style={styles.inputWrapper}>
            <Text style={styles.inputLabel}>Farm Location</Text>
            <TextInput
              style={styles.input}
              placeholder="Pune, Maharashtra"
              placeholderTextColor={themeColors.textMuted}
              value={farmLocation}
              onChangeText={setFarmLocation}
              editable={!loading}
            />
          </View>
        </>
      );
    }

    if (role === 'customer') {
      return (
        <>
          <View style={styles.inputWrapper}>
            <Text style={styles.inputLabel}>Shipping Address</Text>
            <TextInput
              style={styles.input}
              placeholder="123 Main Street"
              placeholderTextColor={themeColors.textMuted}
              value={address}
              onChangeText={setAddress}
              editable={!loading}
            />
          </View>
          <View style={styles.row}>
            <View style={[styles.inputWrapper, { flex: 1, marginRight: spacing.sm }]}>
              <Text style={styles.inputLabel}>City</Text>
              <TextInput
                style={styles.input}
                placeholder="Mumbai"
                placeholderTextColor={themeColors.textMuted}
                value={city}
                onChangeText={setCity}
                editable={!loading}
              />
            </View>
            <View style={[styles.inputWrapper, { flex: 1 }]}>
              <Text style={styles.inputLabel}>State</Text>
              <TextInput
                style={styles.input}
                placeholder="MH"
                placeholderTextColor={themeColors.textMuted}
                value={state}
                onChangeText={setState}
                maxLength={2}
                autoCapitalize="characters"
                editable={!loading}
              />
            </View>
          </View>
          <View style={styles.inputWrapper}>
            <Text style={styles.inputLabel}>Pincode</Text>
            <TextInput
              style={styles.input}
              placeholder="400001"
              placeholderTextColor={themeColors.textMuted}
              value={pincode}
              onChangeText={setPincode}
              keyboardType="numeric"
              maxLength={6}
              editable={!loading}
            />
          </View>
          <View style={styles.inputWrapper}>
            <Text style={styles.inputLabel}>Phone</Text>
            <TextInput
              style={styles.input}
              placeholder="+91 9876543210"
              placeholderTextColor={themeColors.textMuted}
              value={phone}
              onChangeText={setPhone}
              keyboardType="phone-pad"
              editable={!loading}
            />
          </View>
        </>
      );
    }

    return null;
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
        <View style={styles.header}>
          <Text style={styles.title}>Create Account</Text>
          <Text style={styles.subtitle}>Join HyGrow today</Text>
        </View>

        <View style={styles.formContainer}>
          {error ? (
            <View style={styles.errorContainer}>
              <Text style={styles.errorText}>{error}</Text>
            </View>
          ) : null}

          {/* Role Selection */}
          <Text style={styles.sectionLabel}>Select Your Role</Text>
          <View style={styles.roleContainer}>
            {ROLES.map((r) => (
              <Pressable
                key={r.key}
                style={[styles.roleCard, role === r.key && styles.roleCardActive]}
                onPress={() => !loading && setRole(r.key)}
                disabled={loading}
              >
                <Text style={styles.roleIcon}>{r.icon}</Text>
                <Text style={[styles.roleLabel, role === r.key && styles.roleLabelActive]}>{r.label}</Text>
                <Text style={styles.roleDesc}>{r.description}</Text>
                {role === r.key && <View style={styles.roleCheckmark} />}
              </Pressable>
            ))}
          </View>

          {/* Basic Fields */}
          <View style={styles.divider}>
            <Text style={styles.dividerText}>Account Details</Text>
          </View>

          <View style={styles.inputWrapper}>
            <Text style={styles.inputLabel}>Full Name</Text>
            <TextInput
              style={styles.input}
              placeholder="John Doe"
              placeholderTextColor={themeColors.textMuted}
              value={name}
              onChangeText={setName}
              editable={!loading}
            />
          </View>

          <View style={styles.inputWrapper}>
            <Text style={styles.inputLabel}>Email</Text>
            <TextInput
              style={styles.input}
              placeholder="you@example.com"
              placeholderTextColor={themeColors.textMuted}
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
              editable={!loading}
            />
          </View>

          <View style={styles.row}>
            <View style={[styles.inputWrapper, { flex: 1, marginRight: spacing.sm }]}>
              <Text style={styles.inputLabel}>Password</Text>
              <TextInput
                style={styles.input}
                placeholder="Min 6 chars"
                placeholderTextColor={themeColors.textMuted}
                value={password}
                onChangeText={setPassword}
                secureTextEntry
                editable={!loading}
              />
            </View>
            <View style={[styles.inputWrapper, { flex: 1 }]}>
              <Text style={styles.inputLabel}>Confirm</Text>
              <TextInput
                style={styles.input}
                placeholder="Repeat"
                placeholderTextColor={themeColors.textMuted}
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                secureTextEntry
                editable={!loading}
              />
            </View>
          </View>

          {/* Role-specific Fields */}
          {renderRoleSpecificFields()}

          <Pressable
            style={({ pressed }) => [styles.button, pressed && styles.buttonPressed, loading && styles.buttonDisabled]}
            onPress={handleSignup}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color={themeColors.background} />
            ) : (
              <Text style={styles.buttonText}>Create Account as {ROLES.find(r => r.key === role)?.label}</Text>
            )}
          </Pressable>

          <Pressable onPress={() => router.push('/(auth)/login')} style={styles.linkButton} disabled={loading}>
            <Text style={styles.linkText}>Already have an account? <Text style={styles.linkTextBold}>Sign In</Text></Text>
          </Pressable>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const createStyles = (colors: any) => StyleSheet.create({
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
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollContent: {
    flexGrow: 1,
    padding: spacing.lg,
    paddingTop: 60,
    paddingBottom: 40,
  },
  header: {
    marginBottom: spacing.xl,
  },
  title: {
    ...typography.h1,
    marginBottom: spacing.xs,
    color: colors.text,
  },
  subtitle: {
    ...typography.body,
    color: colors.textSecondary,
  },
  formContainer: {
    backgroundColor: colors.surface,
    padding: spacing.lg,
    borderRadius: borderRadius.xl,
    borderWidth: 1,
    borderColor: colors.border,
  },
  sectionTitle: {
    ...typography.h3,
    marginBottom: spacing.md,
    marginTop: spacing.md,
    color: colors.text,
  },
  errorContainer: {
    backgroundColor: colors.danger + '20',
    borderRadius: borderRadius.md,
    padding: spacing.md,
    marginBottom: spacing.md,
  },
  errorText: {
    ...typography.bodySmall,
    color: colors.danger,
    textAlign: 'center',
  },
  sectionLabel: {
    ...typography.label,
    marginBottom: spacing.sm,
    color: colors.text,
  },
  roleContainer: {
    marginBottom: spacing.lg,
    gap: spacing.sm,
  },
  roleCard: {
    padding: spacing.md,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surfaceLight,
  },
  roleCardActive: {
    backgroundColor: colors.primary + '15',
    borderColor: colors.primary,
    borderWidth: 2,
  },
  roleIcon: {
    fontSize: 24,
    marginBottom: 4,
  },
  roleLabel: {
    ...typography.body,
    fontWeight: '600',
    marginBottom: 2,
    color: colors.textSecondary,
  },
  roleLabelActive: {
    color: colors.primary,
  },
  roleDesc: {
    ...typography.caption,
    color: colors.textMuted,
  },
  roleCheckmark: {
    position: 'absolute',
    top: spacing.sm,
    right: spacing.sm,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.primary,
  },
  divider: {
    marginVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    paddingBottom: spacing.xs,
  },
  dividerText: {
    ...typography.label,
    color: colors.textMuted,
  },
  row: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  inputWrapper: {
    marginBottom: spacing.md,
  },
  inputLabel: {
    ...typography.label,
    marginBottom: spacing.xs,
    color: colors.text,
  },
  input: {
    backgroundColor: colors.surfaceLight,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    color: colors.text,
    fontSize: 16,
  },
  button: {
    backgroundColor: colors.primary,
    padding: spacing.md,
    borderRadius: borderRadius.md,
    alignItems: 'center',
    marginTop: spacing.sm,
  },
  buttonPressed: {
    opacity: 0.8,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    ...typography.body,
    fontWeight: '700',
    color: colors.background,
  },
  linkButton: {
    marginTop: spacing.lg,
    alignItems: 'center',
  },
  linkText: {
    ...typography.bodySmall,
    color: colors.textSecondary,
  },
  linkTextBold: {
    color: colors.primary,
    fontWeight: '600',
  },
});
