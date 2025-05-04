import React, { useState } from 'react';
import { useNotifications } from '../../contexts/NotificationContext';

export function NotificationList() {
  const { notifications, markAsRead, unreadCount } = useNotifications();
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="relative">
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="p-2 text-gray-600 hover:text-gray-900"
      >
        <svg className="w-6 h-6" /* Icône de cloche *//>
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-red-100 transform translate-x-1/2 -translate-y-1/2 bg-red-600 rounded-full">
            {unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 bg-white rounded-md shadow-lg overflow-hidden z-20">
          <div className="max-h-96 overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="p-4 text-center text-gray-500">
                Aucune notification
              </div>
            ) : (
              notifications.map((notification) => (
                <div
                  key={notification.id}
                  className={`p-4 border-b ${notification.status === 'unread' ? 'bg-blue-50' : ''}`}
                  onClick={() => markAsRead(notification.id)}
                >
                  <h3 className="text-sm font-medium text-gray-900">
                    {notification.title}
                  </h3>
                  <p className="mt-1 text-sm text-gray-500">
                    {notification.message}
                  </p>
                  <span className="mt-1 text-xs text-gray-400">
                    {new Date(notification.createdAt).toLocaleString()}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}