'use client';

import { useState, useEffect } from 'react';
import { db } from '@/lib/firebase';
import { collection, query, onSnapshot, addDoc, updateDoc, doc, serverTimestamp, getDoc, where } from 'firebase/firestore';

export function useResources() {
  const [resources, setResources] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const q = query(collection(db, 'resources'));
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const resourcesData = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      }));
      setResources(resourcesData);
      setLoading(false);
    }, (err) => {
      setError(err.message);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const getResource = async (resourceId) => {
    try {
      const resourceDoc = await getDoc(doc(db, 'resources', resourceId));
      if (resourceDoc.exists()) {
        return { id: resourceDoc.id, ...resourceDoc.data() };
      }
      return null;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  const createResource = async (resourceData) => {
    try {
      const resourceRef = await addDoc(collection(db, 'resources'), {
        ...resourceData,
        isActive: true,
        status: 'available',
        features: resourceData.features ? resourceData.features.split(',').map(f => f.trim()) : [],
        bookings: [],
        createdAt: serverTimestamp(),
      });
      return resourceRef.id;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  const updateResource = async (resourceId, resourceData) => {
    try {
      const resourceRef = doc(db, 'resources', resourceId);
      const updateData = { ...resourceData };

      if (updateData.features && typeof updateData.features === 'string') {
        updateData.features = updateData.features.split(',').map(f => f.trim());
      }

      await updateDoc(resourceRef, {
        ...updateData,
        updatedAt: serverTimestamp(),
      });
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  const deleteResource = async (resourceId) => {
    try {
      const resourceRef = doc(db, 'resources', resourceId);
      await updateDoc(resourceRef, {
        isActive: false,
        deletedAt: serverTimestamp(),
      });
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  const bookResource = async (resourceId, bookingData) => {
    try {
      const resourceRef = doc(db, 'resources', resourceId);
      const resourceDoc = await getDoc(resourceRef);
      const currentResource = resourceDoc.data();

      const newBooking = {
        id: Date.now().toString(),
        ...bookingData,
        createdAt: serverTimestamp(),
      };

      await updateDoc(resourceRef, {
        bookings: [...(currentResource.bookings || []), newBooking],
        status: 'reserved',
        updatedAt: serverTimestamp(),
      });
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  const getAvailableSlots = async (resourceId, startDate, endDate) => {
    try {
      // Implémentation de la logique pour obtenir les créneaux disponibles
      const resource = await getResource(resourceId);
      if (!resource) return [];

      // Logique simplifiée - à adapter selon vos besoins
      const slots = [];
      const start = new Date(startDate);
      const end = new Date(endDate);

      for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
        for (let hour = 8; hour < 18; hour++) {
          const slotStart = new Date(d);
          slotStart.setHours(hour, 0, 0, 0);
          const slotEnd = new Date(d);
          slotEnd.setHours(hour + 1, 0, 0, 0);

          // Vérifier si le créneau est disponible
          const isAvailable = !resource.bookings?.some(booking => {
            const bookingStart = new Date(booking.startTime);
            const bookingEnd = new Date(booking.endTime);
            return (slotStart < bookingEnd && slotEnd > bookingStart);
          });

          slots.push({
            start: slotStart,
            end: slotEnd,
            available: isAvailable,
          });
        }
      }

      return slots;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  return {
    resources,
    loading,
    error,
    getResource,
    createResource,
    updateResource,
    deleteResource,
    bookResource,
    getAvailableSlots,
  };
}