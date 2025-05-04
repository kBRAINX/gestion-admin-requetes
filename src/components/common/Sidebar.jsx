'use client';

import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { useTheme } from '@/contexts/ThemeContext';

export default function Sidebar({ isOpen, onToggle, navigation }) {
  const pathname = usePathname();
  const { colors, isDarkMode } = useTheme();

  const isActive = (href) => {
    if (href === '/dashboard') {
      return pathname === '/dashboard';
    }
    return pathname.startsWith(href);
  };

  return (
    <div
      className={`${
        isOpen ? 'w-64' : 'w-16'
      } transition-all duration-300 ease-in-out flex flex-col border-r`}
      style={{
        backgroundColor: colors.background.primary,
        borderColor: colors.border
      }}
    >
      {/* Logo */}
      <div className="h-16 flex items-center justify-between px-4" style={{ borderBottom: `1px solid ${colors.border}` }}>
        {isOpen && (
          <span className="text-lg font-bold" style={{ color: colors.text.primary }}>
            ADMIN PORTAL
          </span>
        )}
        <button
          onClick={onToggle}
          className="p-2 rounded-md hover:opacity-70"
          style={{ color: colors.text.primary }}
        >
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d={isOpen ? "M4 6h16M4 12h16M4 18h16" : "M3 12h18M3 6h18M3 18h18"}
            />
          </svg>
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-1">
        {navigation.map((item) => {
          const active = isActive(item.href);
          return (
            <Link
              key={item.name}
              href={item.href}
              className={`flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                active
                  ? `text-white`
                  : ''
              }`}
              style={{
                backgroundColor: active ? colors.primary : 'transparent',
                color: active ? '#FFFFFF' : colors.text.primary,
              }}
            >
              <div className="flex items-center">
                <span className="flex-shrink-0">
                  {item.icon}
                </span>
                {isOpen && (
                  <span className="ml-3 flex-shrink-0">
                    {item.name}
                  </span>
                )}
              </div>
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="px-3 py-4 space-y-1">
        <div className="border-t" style={{ borderColor: colors.border }}></div>
        <div className={`px-3 py-2 text-sm ${isOpen ? 'block' : 'hidden'}`} style={{ color: colors.text.tertiary }}>
          Version 1.0.0
        </div>
      </div>
    </div>
  );
}