'use client';

import { useTheme } from '@/contexts/ThemeContext';

export default function Input({
  label,
  type = 'text',
  name,
  value,
  onChange,
  placeholder,
  required = false,
  disabled = false,
  error,
  className = '',
  style = {},
}) {
  const { colors } = useTheme();

  const inputStyle = {
    width: '100%',
    padding: '0.5rem 0.75rem',
    backgroundColor: colors.background.primary,
    border: `1px solid ${error ? '#EF4444' : colors.border}`,
    borderRadius: '0.375rem',
    color: colors.text.primary,
    ...style,
  };

  return (
    <div className={`mb-4 ${className}`}>
      {label && (
        <label
          htmlFor={name}
          className="block text-sm font-medium mb-1"
          style={{ color: colors.text.primary }}
        >
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      <input
        type={type}
        id={name}
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        required={required}
        disabled={disabled}
        style={inputStyle}
        className={disabled ? 'opacity-50 cursor-not-allowed' : ''}
      />
      {error && (
        <p className="mt-1 text-sm text-red-500">{error}</p>
      )}
    </div>
  );
}