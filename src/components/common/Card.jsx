'use client';

import { useTheme } from '@/contexts/ThemeContext';

export default function Card({ children, className = '', style = {}, onClick }) {
  const { colors } = useTheme();

  const cardStyle = {
    backgroundColor: colors.background.white,
    borderRadius: '0.5rem',
    boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
    border: `1px solid ${colors.border}`,
    ...style,
  };

  return (
    <div
      className={`overflow-hidden ${className}`}
      style={cardStyle}
      onClick={onClick}
    >
      {children}
    </div>
  );
}