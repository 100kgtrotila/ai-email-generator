'use client';

import { useCallback } from 'react';
import { getFirebaseAuth } from '@/lib/firebase/client';

export class NotAuthenticatedError extends Error {
  constructor() {
    super('Not authenticated.');
    this.name = 'NotAuthenticatedError';
  }
}

export function useIdToken() {
  return useCallback(async (): Promise<string> => {
    const user = getFirebaseAuth().currentUser;
    if (!user) throw new NotAuthenticatedError();
    return user.getIdToken();
  }, []);
}
