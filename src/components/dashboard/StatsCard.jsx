'use client';

import { useTheme } from '@/contexts/ThemeContext';
import Card from '../common/Card';

export default function StatsCard({
  title,
  value,
  change,
  changeType = 'increase',
  icon: Icon,
  color = 'blue',
  className = '',
}) {
  const { colors } = useTheme();

  const colorMap = {
    blue: {
      background: '#DBEAFE',
      backgroundDark: '#1E3A8A',
      text: '#1E40AF',
      textLight: '#3B82F6',
    },
    green: {
      background: '#D1FAE5',
      backgroundDark: '#064E3B',
      text: '#065F46',
      textLight: '#059669',
    },
    yellow: {
      background: '#FEF3C7',
      backgroundDark: '#92400E',
      text: '#92400E',
      textLight: '#D97706',
    },
    red: {
      background: '#FEE2E2',
      backgroundDark: '#991B1B',
      text: '#991B1B',
      textLight: '#DC2626',
    },
    purple: {
      background: '#EDE9FE',
      backgroundDark: '#5B21B6',
      text: '#5B21B6',
      textLight: '#8B5CF6',
    },
  };

  const statColor = colorMap[color] || colorMap.blue;

  return (
    <Card className={className}>
      <div className="p-6">
        <div className="flex items-center">
          <div
            className="flex-shrink-0 rounded-lg p-3"
            style={{
              backgroundColor: `${statColor.background}40`,
            }}
          >
            {Icon && <Icon className="w-6 h-6" style={{ color: statColor.textLight }} />}
          </div>
          <div className="ml-5">
            <p className="text-sm font-medium" style={{ color: colors.text.tertiary }}>
              {title}
            </p>
            <div className="flex items-baseline">
              <p className="text-2xl font-semibold" style={{ color: colors.text.primary }}>
                {value}
              </p>
              {change !== undefined && (
                <p
                  className={`ml-2 flex items-baseline text-sm font-semibold ${
                    changeType === 'increase' ? 'text-green-600' : 'text-red-600'
                  }`}
                >
                  {changeType === 'increase' ? (
                    <svg
                      className="self-center flex-shrink-0 h-4 w-4 text-green-500"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M5.293 9.707a1 1 0 010-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 01-1.414 1.414L11 7.414V15a1 1 0 11-2 0V7.414L6.707 9.707a1 1 0 01-1.414 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                  ) : (
                    <svg
                      className="self-center flex-shrink-0 h-4 w-4 text-red-500"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M14.707 10.293a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 111.414-1.414L9 12.586V5a1 1 0 012 0v7.586l2.293-2.293a1 1 0 011.414 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                  )}
                  <span className="sr-only">
                    {changeType === 'increase' ? 'Increased' : 'Decreased'} by
                  </span>
                  {change}
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
}