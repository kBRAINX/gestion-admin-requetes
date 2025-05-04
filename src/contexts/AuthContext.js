'use client';

import React, { createContext, useState, useEffect } from 'react';
import { auth, db } from '@/lib/firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc, Timestamp } from 'firebase/firestore';

/**
 * AuthContext provides user auth state and actions throughout the app.
 */
const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Subscribe to Firebase Auth state
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setLoading(true);
      if (firebaseUser) {
        try {
          // Fetch Firestore profile
          const userRef = doc(db, 'users', firebaseUser.uid);
          const userSnap = await getDoc(userRef);
          if (userSnap.exists()) {
            const data = userSnap.data();
            setUser({
              uid: firebaseUser.uid,
              email: firebaseUser.email,
              displayName: data.displayName || firebaseUser.displayName || '',
              photoURL: data.photoURL || firebaseUser.photoURL || '',
              createdAt: data.createdAt instanceof Timestamp ? data.createdAt.toDate() : data.createdAt,
              lastLogin: data.lastLogin instanceof Timestamp ? data.lastLogin.toDate() : data.lastLogin,
              preferences: data.preferences || {},
              role: data.role || 'student',
            });
          } else {
            // No Firestore doc, create minimal profile
            setUser({
              uid: firebaseUser.uid,
              email: firebaseUser.email,
              displayName: firebaseUser.displayName || '',
              photoURL: firebaseUser.photoURL || '',
              createdAt: null,
              lastLogin: null,
              preferences: {},
              role: 'student',
            });
          }
        } catch (err) {
          console.error('AuthProvider fetch profile error:', err);
          setError(err.message);
          setUser(null);
        }
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  return (
    <AuthContext.Provider value={{ user, setUser, loading, setLoading, error, setError }}>
      {children}
    </AuthContext.Provider>
  );
}

export default AuthContext;
