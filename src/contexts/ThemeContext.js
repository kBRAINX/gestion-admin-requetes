'use client';

import { createContext, useContext, useState, useEffect } from 'react';

const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
  const [isDarkMode, setIsDarkMode] = useState(false);

  useEffect(() => {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme) {
      setIsDarkMode(savedTheme === 'dark');
    } else if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
      setIsDarkMode(true);
    }
  }, []);

  const toggleTheme = () => {
    setIsDarkMode(!isDarkMode);
    localStorage.setItem('theme', !isDarkMode ? 'dark' : 'light');
  };

  const theme = {
    colors: {
      primary: '#3B82F6', // blue-600
      primaryDark: '#2563EB', // blue-700
      primaryLight: '#60A5FA', // blue-400
      white: '#FFFFFF',
      black: '#000000',
      gray: {
        light: '#F3F4F6', // gray-100
        medium: '#6B7280', // gray-500
        dark: '#1F2937', // gray-800
      },
      text: {
        primary: isDarkMode ? '#FFFFFF' : '#1F2937',
        secondary: isDarkMode ? '#E5E7EB' : '#4B5563',
        tertiary: isDarkMode ? '#9CA3AF' : '#6B7280',
      },
      background: {
        primary: isDarkMode ? '#0F172A' : '#FFFFFF', // slate-900 / white
        secondary: isDarkMode ? '#1E293B' : '#F8FAFC', // slate-800 / slate-50
        card: isDarkMode ? '#1E293B' : '#FFFFFF',
        header: isDarkMode ? '#1E293B' : '#3B82F6',
      },
      border: isDarkMode ? '#334155' : '#E2E8F0', // slate-700 / slate-200
    },
    isDarkMode,
    toggleTheme,
  };

  return (
    <ThemeContext.Provider value={theme}>
      <div className={isDarkMode ? 'dark' : ''}>
        {children}
      </div>
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};