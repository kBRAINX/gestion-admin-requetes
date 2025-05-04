'use client';

import { useState, useEffect } from 'react';
import { db } from '@/lib/firebase';
import { collection, query, onSnapshot, addDoc, updateDoc, doc, serverTimestamp, getDoc } from 'firebase/firestore';
import useAuth from './useAuth';

export function useRequests() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { user } = useAuth();

  useEffect(() => {
    const q = query(collection(db, 'requests'));
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const requestsData = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      }));
      setRequests(requestsData);
      setLoading(false);
    }, (err) => {
      setError(err.message);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const getRequest = async (requestId) => {
    try {
      const requestDoc = await getDoc(doc(db, 'requests', requestId));
      if (requestDoc.exists()) {
        return { id: requestDoc.id, ...requestDoc.data() };
      }
      return null;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  const createRequest = async (requestData) => {
    try {
      const requestRef = await addDoc(collection(db, 'requests'), {
        ...requestData,
        userId: user?.id,
        userName: user?.displayName,
        userEmail: user?.email,
        status: 'pending',
        createdAt: serverTimestamp(),
        workflow: [],
      });
      return requestRef.id;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  const processRequest = async (requestId, action, comment = '') => {
    try {
      const requestRef = doc(db, 'requests', requestId);
      const requestDoc = await getDoc(requestRef);
      const currentRequest = requestDoc.data();

      const workflowEntry = {
        id: Date.now().toString(),
        userId: user.id,
        userName: user.displayName,
        action,
        comment,
        timestamp: serverTimestamp(),
        serviceId: user.serviceId,
        serviceName: user.serviceName,
      };

      let newStatus = currentRequest.status;
      if (action === 'approve') {
        newStatus = 'approved';
      } else if (action === 'reject') {
        newStatus = 'rejected';
      } else if (action === 'confirm') {
        newStatus = 'in_progress';
      }

      await updateDoc(requestRef, {
        status: newStatus,
        workflow: [...(currentRequest.workflow || []), workflowEntry],
        processedAt: serverTimestamp(),
        processedBy: user.id,
        processedByName: user.displayName,
      });
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  const transferRequest = async (requestId, targetServiceId) => {
    try {
      const requestRef = doc(db, 'requests', requestId);
      const requestDoc = await getDoc(requestRef);
      const currentRequest = requestDoc.data();

      const workflowEntry = {
        id: Date.now().toString(),
        userId: user.id,
        userName: user.displayName,
        action: 'transfer',
        comment: `Transferred to service ${targetServiceId}`,
        timestamp: serverTimestamp(),
        serviceId: user.serviceId,
        serviceName: user.serviceName,
      };

      await updateDoc(requestRef, {
        currentServiceId: targetServiceId,
        workflow: [...(currentRequest.workflow || []), workflowEntry],
        updatedAt: serverTimestamp(),
      });
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  return {
    requests,
    loading,
    error,
    getRequest,
    createRequest,
    processRequest,
    transferRequest,
  };
}