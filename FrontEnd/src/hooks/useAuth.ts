import { useCallback, useEffect, useRef, useState } from 'react';
import {
  onAuthStateChanged,
  User as FirebaseUser,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut
} from 'firebase/auth';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import useAppStore from '../store/useAppStore';
import { auth, db } from '../../firebase';
import { User, UserRole } from '../store/slices/authSlice';

export interface SignupData {
  name: string;
  email: string;
  password: string;
  role: UserRole;
  phone?: string;
  address?: string;
  city?: string;
  state?: string;
  pincode?: string;
  farm_name?: string;
  farm_location?: string;
  upi_id?: string;
}

const AUTH_INIT_TIMEOUT_MS = 8000;

export default function useAuth() {
  const user = useAppStore((state) => state.user);
  const isAuthenticated = useAppStore((state) => state.isAuthenticated);
  const loading = useAppStore((state) => state.loading);
  const storeLogin = useAppStore((state) => state.login);
  const storeLogout = useAppStore((state) => state.logout);
  const setLoading = useAppStore((state) => state.setLoading);

  // Track if we've already initialized auth state
  const [authInitialized, setAuthInitialized] = useState(false);
  const initRef = useRef(false);

  useEffect(() => {
    // Prevent double initialization
    if (initRef.current) return;
    initRef.current = true;

    let mounted = true;
    let authCheckCompleted = false;

    // Set a timeout to ensure we don't hang forever
    const timeoutId = setTimeout(() => {
      if (!authCheckCompleted && mounted) {
        console.warn('[Auth] Auth initialization timed out');
        storeLogout();
        setAuthInitialized(true);
      }
    }, AUTH_INIT_TIMEOUT_MS);

    // Subscribe to auth state changes
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser: FirebaseUser | null) => {
      if (!mounted) return;

      authCheckCompleted = true;
      clearTimeout(timeoutId);

      if (firebaseUser) {
        // User is signed in, fetch their profile
        try {
          const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid));

          if (!mounted) return;

          if (userDoc.exists()) {
            const data = userDoc.data();
            const userData: User = {
              id: firebaseUser.uid,
              email: data.email || firebaseUser.email || '',
              name: data.name || '',
              role: data.role || 'farmer',
              phone: data.phone,
              address: data.address,
              city: data.city,
              state: data.state,
              pincode: data.pincode,
              farm_name: data.farm_name,
              farm_location: data.farm_location,
              upi_id: data.upi_id,
              created_at: data.createdAt?.toDate?.()?.toISOString?.(),
              preferences: data.preferences,
            };
            storeLogin(userData);

            if (data.preferences) {
              useAppStore.setState({
                ...(data.preferences.farmerFeatures && { farmerFeatures: data.preferences.farmerFeatures }),
                ...(data.preferences.isDarkMode !== undefined && { isDarkMode: data.preferences.isDarkMode })
              });
            }
          } else {
            // User exists in Firebase Auth but not in Firestore
            // Create a basic profile
            const basicUser: User = {
              id: firebaseUser.uid,
              email: firebaseUser.email || '',
              name: firebaseUser.displayName || 'User',
              role: 'farmer',
            };
            storeLogin(basicUser);
          }
        } catch (error) {
          console.error('[Auth] Error fetching user profile:', error);
          storeLogout();
        }
      } else {
        // User is signed out
        storeLogout();
      }

      setAuthInitialized(true);
    });

    return () => {
      mounted = false;
      clearTimeout(timeoutId);
      unsubscribe();
    };
  }, [storeLogin, storeLogout]);

  const signup = useCallback(async (data: SignupData) => {
    setLoading(true);
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, data.email, data.password);
      const firebaseUser = userCredential.user;

      const profile = {
        uid: firebaseUser.uid,
        email: data.email,
        name: data.name,
        role: data.role,
        phone: data.phone || null,
        address: data.address || null,
        city: data.city || null,
        state: data.state || null,
        pincode: data.pincode || null,
        farm_name: data.role === 'farmer' ? data.farm_name : null,
        farm_location: data.role === 'farmer' ? data.farm_location : null,
        upi_id: data.role === 'farmer' ? data.upi_id : null,
        createdAt: serverTimestamp(),
      };

      await setDoc(doc(db, 'users', firebaseUser.uid), profile);

      const userData: User = {
        id: firebaseUser.uid,
        email: data.email,
        name: data.name,
        role: data.role,
        phone: data.phone,
        address: data.address,
        city: data.city,
        state: data.state,
        pincode: data.pincode,
        farm_name: data.farm_name,
        farm_location: data.farm_location,
        upi_id: data.upi_id,
      };

      storeLogin(userData);
      return firebaseUser;
    } catch (error: any) {
      setLoading(false);
      throw new Error(getFriendlyErrorMessage(error.code));
    }
  }, [storeLogin, setLoading]);

  const login = useCallback(async (email: string, password: string) => {
    setLoading(true);
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);

      // Fetch profile after successful login
      const userDoc = await getDoc(doc(db, 'users', userCredential.user.uid));

      if (userDoc.exists()) {
        const data = userDoc.data();
        const userData: User = {
          id: userCredential.user.uid,
          email: data.email || userCredential.user.email || '',
          name: data.name || '',
          role: data.role || 'farmer',
          phone: data.phone,
          address: data.address,
          city: data.city,
          state: data.state,
          pincode: data.pincode,
          farm_name: data.farm_name,
          farm_location: data.farm_location,
          upi_id: data.upi_id,
          created_at: data.createdAt?.toDate?.()?.toISOString?.(),
          preferences: data.preferences,
        };
        storeLogin(userData);

        if (data.preferences) {
          useAppStore.setState({
            ...(data.preferences.farmerFeatures && { farmerFeatures: data.preferences.farmerFeatures }),
            ...(data.preferences.isDarkMode !== undefined && { isDarkMode: data.preferences.isDarkMode })
          });
        }
      } else {
        const userData: User = {
          id: userCredential.user.uid,
          email: userCredential.user.email || email,
          name: userCredential.user.displayName || 'User',
          role: 'farmer',
        };
        storeLogin(userData);
      }

      return userCredential.user;
    } catch (error: any) {
      setLoading(false);
      throw new Error(getFriendlyErrorMessage(error.code));
    }
  }, [storeLogin, setLoading]);

  const logout = useCallback(async () => {
    try {
      await signOut(auth);
      storeLogout();
    } catch (error) {
      console.error('[Auth] Logout error:', error);
      storeLogout();
    }
  }, [storeLogout]);

  const updateProfile = useCallback(async (updates: Partial<User>) => {
    if (!user) throw new Error('Not authenticated');
    try {
      await setDoc(doc(db, 'users', user.id), updates, { merge: true });
      useAppStore.getState().updateUser(updates);
    } catch (error: any) {
      throw new Error(error.message || 'Update failed');
    }
  }, [user]);

  return {
    user,
    isAuthenticated,
    loading: loading || !authInitialized,
    authInitialized,
    signup,
    login,
    logout,
    updateProfile
  };
}

function getFriendlyErrorMessage(errorCode: string): string {
  switch (errorCode) {
    case 'auth/user-not-found':
      return 'No account found with this email';
    case 'auth/wrong-password':
      return 'Incorrect password';
    case 'auth/invalid-email':
      return 'Invalid email address';
    case 'auth/email-already-in-use':
      return 'An account with this email already exists';
    case 'auth/weak-password':
      return 'Password should be at least 6 characters';
    case 'auth/invalid-credential':
      return 'Invalid email or password';
    case 'auth/too-many-requests':
      return 'Too many failed attempts. Try again later';
    case 'auth/network-request-failed':
      return 'Network error. Check your connection';
    default:
      return 'Authentication failed. Please try again';
  }
}
