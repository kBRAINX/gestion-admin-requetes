'use client';

import { useState, useEffect } from 'react';
import { auth, db } from '@/lib/firebase';
import { doc, getDoc } from 'firebase/firestore';
import { ROLES, ROLE_PERMISSIONS } from '@/lib/auth-permissions';

export default function useAuth() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (firebaseUser) => {
      try {
        if (firebaseUser) {
          // Récupérer les données utilisateur depuis Firestore
          const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid));
          if (userDoc.exists()) {
            const userData = userDoc.data();
            setUser({
              id: firebaseUser.uid,
              email: firebaseUser.email,
              ...userData,
            });
          } else {
            setUser({
              id: firebaseUser.uid,
              email: firebaseUser.email,
              displayName: firebaseUser.displayName,
              role: 'student', // Default role
            });
          }
        } else {
          setUser(null);
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, []);

  const signOut = async () => {
    try {
      await auth.signOut();
    } catch (err) {
      setError(err.message);
    }
  };

  const hasPermission = (permission) => {
    if (!user || !user.role) return false;

    // SuperAdmin a toutes les permissions
    if (user.role === ROLES.SUPERADMIN) return true;

    // Vérifie si l'utilisateur a la permission
    const userPermissions = ROLE_PERMISSIONS[user.role] || [];
    return userPermissions.includes(permission);
  };

  const hasRole = (roles) => {
    if (!user || !user.role) return false;

    // Accepte un seul rôle ou un tableau de rôles
    const roleArray = Array.isArray(roles) ? roles : [roles];
    return roleArray.includes(user.role);
  };

  return {
    user,
    loading,
    error,
    signOut,
    hasPermission,
    hasRole,
  };
}