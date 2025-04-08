import React, { createContext, useContext, useState, useEffect } from 'react';
import { auth, db } from '../firebase';
import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged,
  updateProfile,
  User
} from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { useDispatch } from 'react-redux';
import { setUser } from '../store/slices/userSlice';
import { notify } from '../utils/notifications';

interface AuthContextType {
  currentUser: User | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (email: string, password: string, username: string, productKey: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const dispatch = useDispatch();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
      setIsAuthenticated(!!user);
      dispatch(setUser(user));
    });

    return unsubscribe;
  }, [dispatch]);

  const signup = async (email: string, password: string, username: string, productKey: string) => {
    try {
      // Check product key validity
      const productKeyDoc = await getDoc(doc(db, 'productKeys', productKey));
      if (!productKeyDoc.exists()) {
        throw new Error('Invalid product key');
      }

      const productKeyData = productKeyDoc.data();
      const expirationDate = new Date(productKeyData.expirationDate);
      const currentDate = new Date();

      if (currentDate > expirationDate || productKeyData.usedBy) {
        throw new Error('Product key is expired or already in use');
      }

      // Create user
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      await updateProfile(userCredential.user, { displayName: username });

      // Store user data
      await setDoc(doc(db, 'users', userCredential.user.uid), {
        email,
        username,
        productKeyValid: true,
        productKeyExpirationDate: expirationDate.toISOString(),
      });

      // Mark product key as used
      await setDoc(doc(db, 'productKeys', productKey), {
        ...productKeyData,
        usedBy: userCredential.user.uid,
        usedDate: currentDate.toISOString()
      });

      notify.success('Account created successfully!');

    } catch (error) {
      console.error('Error in signup:', error);
      notify.error(error instanceof Error ? error.message : 'Failed to create account');
      throw error;
    }
  };

  const login = async (email: string, password: string) => {
    try {
      await signInWithEmailAndPassword(auth, email, password);
      notify.success('Welcome back!');
    } catch (error) {
      console.error('Error in login:', error);
      notify.error('Invalid email or password');
      throw error;
    }
  };

  const logout = async () => {
    try {
      await signOut(auth);
      notify.info('Logged out successfully');
    } catch (error) {
      console.error('Error in logout:', error);
      notify.error('Failed to log out');
      throw error;
    }
  };

  const value = {
    currentUser,
    isAuthenticated,
    login,
    signup,
    logout,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}