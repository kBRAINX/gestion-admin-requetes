import Link from 'next/link';
import React from 'react';

const Button = ({
  href,
  children,
  variant = 'primary',
  size = 'md',
  fullWidth = false,
  className = '',
  ...props
}) => {
  const baseClasses =
    'inline-flex items-center justify-center font-medium rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2';

  const variantClasses = {
    primary: `text-white bg-[#3B82F6] hover:bg-[#2563EB] border-transparent focus:ring-[#3B82F6]`,
    secondary: `text-white bg-[#10B981] hover:bg-[#059669] border-transparent focus:ring-[#10B981]`,
    outline: `text-[#3B82F6] bg-transparent border border-[#3B82F6] hover:bg-[#EFF6FF] focus:ring-[#3B82F6]`,
  };

  const sizeClasses = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-5 py-2 text-base',
    lg: 'px-6 py-3 text-lg',
  };

  const widthClass = fullWidth ? 'w-full' : '';

  const buttonClasses = `
    ${baseClasses}
    ${variantClasses[variant]}
    ${sizeClasses[size]}
    ${widthClass}
    ${className}
  `;

  if (href) {
    return (
      <Link href={href} {...props} className={buttonClasses}>
        {children}
      </Link>
    );
  }

  return (
    <button {...props} className={buttonClasses}>
      {children}
    </button>
  );
};

export default Button;
