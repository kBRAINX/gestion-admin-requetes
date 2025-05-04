'use client';

import { useState, useRef, useEffect } from 'react';
import { useTheme } from '@/contexts/ThemeContext';

export default function Navbar({ user, onSignOut, onToggleTheme, isDarkMode }) {
  const { colors } = useTheme();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <nav className="h-16 flex items-center justify-between px-6 border-b" style={{
      backgroundColor: colors.background.primary,
      borderColor: colors.border
    }}>
      {/* Left section */}
      <div className="flex items-center">
        <div className="w-8" /> {/* Spacer */}
      </div>

      {/* Right section */}
      <div className="flex items-center space-x-4">
        {/* Theme Toggle */}
        <button
          onClick={onToggleTheme}
          className="p-2 rounded-full hover:opacity-70"
          style={{ color: colors.text.primary }}
          aria-label="Toggle theme"
        >
          {isDarkMode ? (
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z" clipRule="evenodd" />
            </svg>
          ) : (
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" />
            </svg>
          )}
        </button>

        {/* User Menu */}
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setDropdownOpen(!dropdownOpen)}
            className="flex items-center space-x-3 py-2 px-3 rounded-full hover:opacity-70"
            style={{ color: colors.text.primary }}
          >
            <div className="flex-shrink-0">
              <div
                className="h-8 w-8 rounded-full flex items-center justify-center"
                style={{ backgroundColor: colors.primary, color: '#FFFFFF' }}
              >
                {user?.displayName?.[0]?.toUpperCase() || user?.email?.[0]?.toUpperCase()}
              </div>
            </div>
            <div className="hidden md:block text-sm font-medium">
              {user?.displayName || user?.email}
            </div>
          </button>

          {dropdownOpen && (
            <div
              className="absolute right-0 mt-2 w-48 rounded-md shadow-lg py-1 z-50"
              style={{ backgroundColor: colors.background.primary, border: `1px solid ${colors.border}` }}
            >
              <div className="px-4 py-2 border-b" style={{ borderColor: colors.border }}>
                <p className="text-sm font-medium" style={{ color: colors.text.primary }}>
                  {user?.displayName}
                </p>
                <p className="text-sm" style={{ color: colors.text.secondary }}>
                  {user?.email}
                </p>
              </div>

              <button
                onClick={onSignOut}
                className="flex items-center w-full px-4 py-2 text-sm hover:opacity-70"
                style={{ color: colors.text.primary }}
              >
                <svg className="w-4 h-4 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
                Déconnexion
              </button>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}