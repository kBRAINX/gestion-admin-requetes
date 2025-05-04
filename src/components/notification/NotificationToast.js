import React, { useEffect, useState } from 'react';
import { useNotifications } from '../../contexts/NotificationContext';

export function NotificationToast() {
  const { notifications } = useNotifications();
  const [showToast, setShowToast] = useState(false);
  const [currentNotification, setCurrentNotification] = useState(null);

  useEffect(() => {
    if (notifications.length > 0) {
      const latest = notifications[0];
      setCurrentNotification(latest);
      setShowToast(true);
      
      const timer = setTimeout(() => {
        setShowToast(false);
      }, 5000);

      return () => clearTimeout(timer);
    }
  }, [notifications]);

  if (!showToast || !currentNotification) return null;

  return (
    <div className="fixed bottom-4 right-4 min-w-[300px] bg-white border border-gray-200 rounded-lg shadow-lg p-4 z-50">
      <div className="flex items-start">
        <div className="ml-3 w-0 flex-1">
          <p className="text-sm font-medium text-gray-900">
            {currentNotification.title}
          </p>
          <p className="mt-1 text-sm text-gray-500">
            {currentNotification.message}
          </p>
        </div>
        <div className="ml-4 flex-shrink-0 flex">
          <button
            className="bg-white rounded-md inline-flex text-gray-400 hover:text-gray-500"
            onClick={() => setShowToast(false)}
          >
            ×
          </button>
        </div>
      </div>
    </div>
  );
}
