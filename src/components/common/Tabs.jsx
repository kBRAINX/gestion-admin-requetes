'use client';

import { useTheme } from '@/contexts/ThemeContext';

export default function Tabs({ tabs, activeTab, onChange, className = '' }) {
  const { colors } = useTheme();

  return (
    <div className={`border-b ${className}`} style={{ borderColor: colors.border }}>
      <nav className="-mb-px flex space-x-8" aria-label="Tabs">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => onChange(tab.id)}
            className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm flex items-center ${
              activeTab === tab.id
                ? 'border-current'
                : 'border-transparent hover:border-gray-300'
            }`}
            style={{
              borderColor: activeTab === tab.id ? colors.primary : 'transparent',
              color: activeTab === tab.id ? colors.primary : colors.text.secondary,
            }}
          >
            {tab.label}
            {tab.count !== undefined && (
              <span
                className="ml-2 px-2 py-0.5 rounded-full text-xs font-medium"
                style={{
                  backgroundColor: activeTab === tab.id ? colors.primary : colors.background.secondary,
                  color: activeTab === tab.id ? '#FFFFFF' : colors.text.primary,
                }}
              >
                {tab.count}
              </span>
            )}
          </button>
        ))}
      </nav>
    </div>
  );
}