'use client';

import { useTheme } from '@/contexts/ThemeContext';

export default function Select({
  label,
  name,
  value,
  onChange,
  options = [],
  required = false,
  disabled = false,
  error,
  placeholder,
  className = '',
  style = {},
}) {
  const { colors } = useTheme();

  const selectStyle = {
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
      <select
        id={name}
        name={name}
        value={value}
        onChange={onChange}
        required={required}
        disabled={disabled}
        style={selectStyle}
        className={disabled ? 'opacity-50 cursor-not-allowed' : ''}
      >
        {placeholder && (
          <option value="" disabled>
            {placeholder}
          </option>
        )}
        {options.map((option, index) => (
          <option key={index} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      {error && (
        <p className="mt-1 text-sm text-red-500">{error}</p>
      )}
    </div>
  );
}