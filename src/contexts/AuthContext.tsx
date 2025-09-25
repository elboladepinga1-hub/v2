import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { 
  User,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut as firebaseSignOut,
  sendPasswordResetEmail,
  onAuthStateChanged
} from 'firebase/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { auth, db } from '../utils/firebaseClient';

interface UserProfile {
  name: string;
  cpf: string;
  rg: string;
  phone: string;
  address: string;
  email: string;
  createdAt: string;
}

interface AuthContextType {
  user: User | null;
  userProfile: UserProfile | null;
  loading: boolean;
  signUp: (email: string, password: string, userData?: any) => Promise<{ error: any }>;
  signIn: (email: string, password: string) => Promise<{ error: any }>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<{ error: any }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  const [isAdmin, setIsAdmin] = useState(false);

  const refreshClaims = async (u?: User | null) => {
    try {
      const current = u || auth.currentUser;
      if (!current) {
        setIsAdmin(false);
        return false;
      }
      // Try to refresh token claims; if network fails, return false and keep user signed in but not admin
      try {
        const idTokenResult = await current.getIdTokenResult(true);
        const claims = idTokenResult?.claims || {};
        setIsAdmin(Boolean(claims.admin));
        return Boolean(claims.admin);
      } catch (innerErr: any) {
        console.warn('Failed to getIdTokenResult (likely network issue)', innerErr?.code || innerErr?.message || innerErr);
        setIsAdmin(false);
        return false;
      }
    } catch (e) {
      console.warn('Failed to refresh token claims', e);
      setIsAdmin(false);
      return false;
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setUser(user);

      if (user) {
        // Refresh token claims
        try {
          await refreshClaims(user);
        } catch (e) {
          console.warn('refreshClaims error', e);
        }

        // Fetch user profile from Firestore
        try {
          const userDoc = await getDoc(doc(db, 'users', user.uid));
          if (userDoc.exists()) {
            setUserProfile(userDoc.data() as UserProfile);
          }
        } catch (error: any) {
          // Firestore network errors or permission issues can happen; log and continue with minimal profile
          console.error('Error fetching user profile (Firestore may be unreachable):', error?.message || error);

          // If permissions prevent reading user profile, fall back to a minimal profile from the auth user so UI keeps working.
          if ((error?.code === 'permission-denied') || String(error?.message || '').toLowerCase().includes('missing or insufficient permissions')) {
            console.warn('Firestore permission denied when reading user profile. Ensure Firestore security rules allow reads on the users collection or adjust the app to store a public profile.');
            const fallback: UserProfile = {
              name: (user.displayName as string) || '',
              cpf: '',
              rg: '',
              phone: user.phoneNumber || '',
              address: '',
              email: user.email || '',
              createdAt: user.metadata?.creationTime || new Date().toISOString()
            };
            setUserProfile(fallback);
          }
        }
      } else {
        setUserProfile(null);
        setIsAdmin(false);
      }

      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const signUp = async (email: string, password: string, userData?: any) => {
    try {
      const { user } = await createUserWithEmailAndPassword(auth, email, password);

      // Create minimal user profile in Firestore
      const profile: UserProfile = {
        name: userData?.name || '',
        cpf: userData?.cpf || '',
        rg: userData?.rg || '',
        phone: userData?.phone || '',
        address: userData?.address || '',
        email,
        createdAt: new Date().toISOString()
      };

      await setDoc(doc(db, 'users', user.uid), profile);
      setUserProfile(profile);

      return { error: null };
    } catch (error: any) {
      return { error };
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      await signInWithEmailAndPassword(auth, email, password);
      return { error: null };
    } catch (error: any) {
      return { error };
    }
  };

  const signOut = async () => {
    try {
      await firebaseSignOut(auth);
      setUserProfile(null);
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const resetPassword = async (email: string) => {
    try {
      await sendPasswordResetEmail(auth, email);
      return { error: null };
    } catch (error: any) {
      return { error };
    }
  };

  const value = {
    user,
    userProfile,
    loading,
    isAdmin,
    refreshClaims,
    signUp,
    signIn,
    signOut,
    resetPassword
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
