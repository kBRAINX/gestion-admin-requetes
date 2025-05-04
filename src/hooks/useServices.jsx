'use client';

import { useState, useEffect } from 'react';
import { db } from '@/lib/firebase';
import { collection, query, onSnapshot, addDoc, updateDoc, doc, serverTimestamp, getDoc } from 'firebase/firestore';

export function useServices() {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const q = query(collection(db, 'services'));
    const unsubscribe = onSnapshot(q, async (querySnapshot) => {
      const servicesData = await Promise.all(
        querySnapshot.docs.map(async serviceDoc => {
          const serviceData = serviceDoc.data();

          // Récupérer le nom du responsable si headId existe
          let headName = '';
          if (serviceData.headId) {
            const userDoc = await getDoc(doc(db, 'users', serviceData.headId));
            if (userDoc.exists()) {
              headName = userDoc.data().displayName;
            }
          }

          return {
            id: serviceDoc.id,
            ...serviceData,
            headName,
          };
        })
      );

      setServices(servicesData);
      setLoading(false);
    }, (err) => {
      setError(err.message);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const getService = async (serviceId) => {
    try {
      const serviceDoc = await getDoc(doc(db, 'services', serviceId));
      if (serviceDoc.exists()) {
        return { id: serviceDoc.id, ...serviceDoc.data() };
      }
      return null;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  const createService = async (serviceData) => {
    try {
      const serviceRef = await addDoc(collection(db, 'services'), {
        ...serviceData,
        members: serviceData.headId ? [serviceData.headId] : [],
        isActive: true,
        canReceiveRequests: true,
        createdAt: serverTimestamp(),
      });
      return serviceRef.id;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  const updateService = async (serviceId, serviceData) => {
    try {
      const serviceRef = doc(db, 'services', serviceId);
      await updateDoc(serviceRef, {
        ...serviceData,
        updatedAt: serverTimestamp(),
      });
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  const deleteService = async (serviceId) => {
    try {
      const serviceRef = doc(db, 'services', serviceId);
      await updateDoc(serviceRef, {
        isActive: false,
        deletedAt: serverTimestamp(),
      });
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  const addMemberToService = async (serviceId, userId) => {
    try {
      const serviceRef = doc(db, 'services', serviceId);
      const serviceDoc = await getDoc(serviceRef);
      const currentService = serviceDoc.data();

      const updatedMembers = [...(currentService.members || [])];
      if (!updatedMembers.includes(userId)) {
        updatedMembers.push(userId);
      }

      await updateDoc(serviceRef, {
        members: updatedMembers,
        updatedAt: serverTimestamp(),
      });
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  const removeMemberFromService = async (serviceId, userId) => {
    try {
      const serviceRef = doc(db, 'services', serviceId);
      const serviceDoc = await getDoc(serviceRef);
      const currentService = serviceDoc.data();

      const updatedMembers = (currentService.members || []).filter(id => id !== userId);

      await updateDoc(serviceRef, {
        members: updatedMembers,
        updatedAt: serverTimestamp(),
      });
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  const setServiceHead = async (serviceId, userId) => {
    try {
      const serviceRef = doc(db, 'services', serviceId);
      await updateDoc(serviceRef, {
        headId: userId,
        updatedAt: serverTimestamp(),
      });

      // Ajouter aussi l'utilisateur aux membres si pas déjà présent
      await addMemberToService(serviceId, userId);
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  return {
    services,
    loading,
    error,
    getService,
    createService,
    updateService,
    deleteService,
    addMemberToService,
    removeMemberFromService,
    setServiceHead,
  };
}