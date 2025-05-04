'use client';

import { useState, useEffect } from 'react';
import { db, auth } from '@/lib/firebase';
import { collection, query, onSnapshot, addDoc, updateDoc, doc, serverTimestamp, getDoc } from 'firebase/firestore';
import { createUserWithEmailAndPassword, updateProfile } from 'firebase/auth';
import { ROLE_PERMISSIONS } from '@/lib/auth-permissions';

export function useUsers() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const q = query(collection(db, 'users'));
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const usersData = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      }));
      setUsers(usersData);
      setLoading(false);
    }, (err) => {
      setError(err.message);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const getUsers = async () => {
    try {
      const querySnapshot = await getDocs(collection(db, 'users'));
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      }));
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  const getUser = async (userId) => {
    try {
      const userDoc = await getDoc(doc(db, 'users', userId));
      if (userDoc.exists()) {
        return { id: userDoc.id, ...userDoc.data() };
      }
      return null;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  const createUser = async (userData) => {
    try {
      // Créer l'utilisateur dans Firebase Auth
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        userData.email,
        userData.password || 'defaultPassword123' // Vous devriez générer un mot de passe sécurisé
      );

      // Mettre à jour le profil utilisateur
      await updateProfile(userCredential.user, {
        displayName: userData.displayName,
      });

      // Créer le document utilisateur dans Firestore
      const userRef = await addDoc(collection(db, 'users'), {
        id: userCredential.user.uid,
        email: userData.email,
        displayName: userData.displayName,
        role: userData.role,
        matricule: userData.matricule || '',
        department: userData.department || '',
        permissions: ROLE_PERMISSIONS[userData.role] || [],
        isActive: true,
        createdAt: serverTimestamp(),
      });

      return userRef.id;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  const updateUser = async (userId, userData) => {
    try {
      const userRef = doc(db, 'users', userId);

      // Si le rôle change, mettre à jour les permissions
      if (userData.role) {
        userData.permissions = ROLE_PERMISSIONS[userData.role] || [];
      }

      await updateDoc(userRef, {
        ...userData,
        updatedAt: serverTimestamp(),
      });
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  const deleteUser = async (userId) => {
    try {
      const userRef = doc(db, 'users', userId);
      await updateDoc(userRef, {
        isActive: false,
        deletedAt: serverTimestamp(),
      });
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  const assignUserToService = async (userId, serviceId, role = 'service_member') => {
    try {
      const userRef = doc(db, 'users', userId);
      await updateDoc(userRef, {
        serviceId,
        role,
        permissions: ROLE_PERMISSIONS[role] || [],
        updatedAt: serverTimestamp(),
      });
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  const getUsersByRole = (role) => {
    return users.filter(user => user.role === role);
  };

  const getUsersByService = (serviceId) => {
    return users.filter(user => user.serviceId === serviceId);
  };

  return {
    users,
    loading,
    error,
    getUsers,
    getUser,
    createUser,
    updateUser,
    deleteUser,
    assignUserToService,
    getUsersByRole,
    getUsersByService,
  };
}