'use client';

import { useTheme } from '@/contexts/ThemeContext';

export default function Button({
  children,
  type = 'button',
  variant = 'primary',
  size = 'md',
  disabled = false,
  onClick,
  className = '',
  style = {},
}) {
  const { colors } = useTheme();

  const variants = {
    primary: {
      base: 'text-white',
      style: { backgroundColor: colors.primary },
      hoverStyle: { backgroundColor: colors.primaryDark },
    },
    secondary: {
      base: 'bg-transparent border',
      style: { borderColor: colors.border, color: colors.text.primary },
      hoverStyle: { opacity: 0.8 },
    },
    danger: {
      base: 'bg-red-600 text-white',
      style: {},
      hoverStyle: { backgroundColor: '#DC2626' },
    },
  };

  const sizes = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-sm',
    lg: 'px-6 py-3 text-base',
  };

  const baseStyle = {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: '0.375rem',
    fontWeight: '500',
    transition: 'all 0.2s',
    cursor: disabled ? 'not-allowed' : 'pointer',
    ...style,
  };

  const variantStyles = variants[variant] || variants.primary;
  const baseClasses = `${variantStyles.base} ${sizes[size]} ${disabled ? 'opacity-50' : ''} ${className}`;

  const handleMouseEnter = (e) => {
    if (!disabled) {
      Object.assign(e.currentTarget.style, variantStyles.hoverStyle);
    }
  };

  const handleMouseLeave = (e) => {
    if (!disabled) {
      Object.assign(e.currentTarget.style, variantStyles.style);
    }
  };

  return (
    <button
      type={type}
      className={baseClasses}
      style={{ ...baseStyle, ...variantStyles.style }}
      disabled={disabled}
      onClick={onClick}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {children}
    </button>
  );
}