'use client';

/**
 * AuthProvider — React context provider for Firebase Authentication state.
 *
 * Wraps the app in an AuthContext that exposes the current user and loading
 * state. Uses onAuthStateChanged to keep the context synchronized with
 * Firebase Auth in real time.
 *
 * Usage: import useAuth from this file in any Client Component.
 */

import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from 'react';
import { onAuthStateChanged, type User } from 'firebase/auth';
import { getFirebaseAuth } from '@/lib/firebase/client';
import type { AuthUser } from '@/types';

interface AuthContextValue {
  readonly user: AuthUser | null;
  readonly loading: boolean;
}

const AuthContext = createContext<AuthContextValue>({
  user: null,
  loading: true,
});

function toAuthUser(user: User): AuthUser {
  return {
    uid: user.uid,
    email: user.email,
    displayName: user.displayName,
    photoURL: user.photoURL,
  };
}

export function AuthProvider({ children }: { readonly children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(getFirebaseAuth(), (firebaseUser) => {
      setUser(firebaseUser ? toAuthUser(firebaseUser) : null);
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  return useContext(AuthContext);
}
