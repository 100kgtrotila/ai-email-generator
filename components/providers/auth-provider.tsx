'use client';

import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from 'react';
import { onIdTokenChanged, type User } from 'firebase/auth';
import Cookies from 'js-cookie';
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
    const unsubscribe = onIdTokenChanged(getFirebaseAuth(), async (firebaseUser) => {
      if (firebaseUser) {
        setUser(toAuthUser(firebaseUser));
        const token = await firebaseUser.getIdToken();
        Cookies.set('firebase-token', token, {
          expires: 1, // 1 day
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'lax',
        });
      } else {
        setUser(null);
        Cookies.remove('firebase-token');
      }
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
