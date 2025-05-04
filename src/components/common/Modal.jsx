'use client';

import { useEffect } from 'react';
import { useTheme } from '@/contexts/ThemeContext';

export default function Modal({
  isOpen,
  onClose,
  title,
  children,
  maxWidth = '2xl',
  className = '',
}) {
  const { colors } = useTheme();

  const maxWidths = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-xl',
    '2xl': 'max-w-2xl',
    '3xl': 'max-w-3xl',
    '4xl': 'max-w-4xl',
  };

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        {/* Overlay */}
        <div
          className="fixed inset-0 transition-opacity"
          style={{ backgroundColor: 'rgba(0, 0, 0, 0.5)' }}
          onClick={onClose}
        />

        {/* Modal */}
        <div
          className={`inline-block align-bottom rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:w-full ${maxWidths[maxWidth]} ${className}`}
          style={{
            backgroundColor: colors.background.primary,
            border: `1px solid ${colors.border}`,
          }}
        >
          {/* Header */}
          {title && (
            <div
              className="px-4 py-3 sm:px-6 flex items-center justify-between border-b"
              style={{ borderColor: colors.border }}
            >
              <h3 className="text-lg font-medium" style={{ color: colors.text.primary }}>
                {title}
              </h3>
              <button
                onClick={onClose}
                className="rounded-md p-1 hover:opacity-70"
                style={{ color: colors.text.secondary }}
              >
                <span className="sr-only">Fermer</span>
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          )}

          {/* Content */}
          <div className="px-4 py-5 sm:p-6">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}