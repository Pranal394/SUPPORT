import React, { createContext, useContext, useEffect, useState } from 'react';
import { onAuthStateChanged, User } from 'firebase/auth';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db } from '../lib/firebase';
import { UserProfile, Role } from '../types';

interface AuthContextType {
  user: User | null;
  profile: UserProfile | null;
  loading: boolean;
  isAdmin: boolean;
  isSuperAdmin: boolean;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  profile: null,
  loading: true,
  isAdmin: false,
  isSuperAdmin: false,
});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  const SUPER_ADMIN_EMAIL = 'pranalshrivastav62@gmail.com';

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setUser(user);
      if (user) {
        // Fetch or create profile
        const userDocRef = doc(db, 'users', user.uid);
        const userDoc = await getDoc(userDocRef);

        if (userDoc.exists()) {
          setProfile({ ...userDoc.data(), uid: user.uid } as UserProfile);
        } else {
          // Create initial profile
          const initialRole: Role = user.email === SUPER_ADMIN_EMAIL ? 'admin' : 'user';
          const newProfile: Partial<UserProfile> = {
            email: user.email || '',
            displayName: user.displayName || 'Anonymous User',
            photoURL: user.photoURL || '',
            role: initialRole,
            assignedDepartments: initialRole === 'admin' ? [
              'Shards Connect', 'Shards Shields', 'Shards Security', 'Suraksha Sankalp - Shards Connect', 'Cif Shards Connect'
            ] : [],
            createdAt: new Date(),
          };
          
          try {
            await setDoc(userDocRef, {
              ...newProfile,
              createdAt: serverTimestamp(),
            });
            setProfile({ ...newProfile, uid: user.uid, createdAt: new Date() } as UserProfile);
          } catch (error) {
            console.error("Error creating user profile:", error);
          }
        }
      } else {
        setProfile(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const isAdmin = profile?.role === 'admin' || user?.email === SUPER_ADMIN_EMAIL;
  const isSuperAdmin = user?.email === SUPER_ADMIN_EMAIL;

  return (
    <AuthContext.Provider value={{ user, profile, loading, isAdmin, isSuperAdmin }}>
      {children}
    </AuthContext.Provider>
  );
};

// Firestore Error Handler Utility
export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
  }
}

export function handleFirestoreError(error: { code: string; message: string }, operationType: OperationType, path: string | null) {
  if (error?.code === 'permission-denied') {
    const errInfo: FirestoreErrorInfo = {
      error: error.message,
      authInfo: {
        userId: auth.currentUser?.uid,
        email: auth.currentUser?.email,
        emailVerified: auth.currentUser?.emailVerified,
      },
      operationType,
      path
    };
    console.error('Firestore Error: ', JSON.stringify(errInfo));
    throw new Error(JSON.stringify(errInfo));
  }
  throw error;
}
