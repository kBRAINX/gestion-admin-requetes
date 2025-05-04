import React, { createContext, useContext, useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import { auth } from '../lib/firebase'; // config Firebase client

const NotificationContext = createContext();

export function NotificationProvider({ children }) {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [socket, setSocket] = useState(null);

  useEffect(() => {
    // Écouter les changements d'état d'authentification Firebase
    const unsubscribe = auth.onAuthStateChanged(async (user) => {
      if (user) {
        // Obtenir le token d'authentification Firebase
        const token = await user.getIdToken();
        
        const socketInstance = io(process.env.NEXT_PUBLIC_SOCKET_URL, {
          auth: { token }
        });

        socketInstance.on('notification', (notification) => {
          setNotifications(prev => [notification, ...prev]);
          if (notification.status === 'unread') {
            setUnreadCount(prev => prev + 1);
          }
        });

        setSocket(socketInstance);
      } else {
        // Déconnecter le socket si l'utilisateur n'est plus authentifié
        if (socket) {
          socket.close();
        }
      }
    });

    return () => {
      unsubscribe();
      if (socket) {
        socket.close();
      }
    };
  }, []);

  const markAsRead = async (notificationId) => {
    if (socket) {
      socket.emit('mark-as-read', notificationId);
    }
  };

  const sendNotification = async (data) => {
    try {
      const response = await fetch('/api/notifications/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data)
      });
      return await response.json();
    } catch (error) {
      console.error('Failed to send notification:', error);
    }
  };

  return (
    <NotificationContext.Provider value={{
      notifications,
      unreadCount,
      markAsRead,
      sendNotification
    }}>
      {children}
    </NotificationContext.Provider>
  );
}

export const useNotifications = () => useContext(NotificationContext);