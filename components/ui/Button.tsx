import React from 'react';

interface ButtonProps {
  children: React.ReactNode;
  variant?: 'primary' | 'secondary';
  disabled?: boolean;
  onClick?: () => void;
  type?: 'button' | 'submit' | 'reset';
  className?: string;
  fullWidth?: boolean;
}

export default function Button({
  children,
  variant = 'primary',
  disabled = false,
  onClick,
  type = 'button',
  className = '',
  fullWidth = false,
}: ButtonProps) {
  const baseClasses = variant === 'primary' 
    ? 'btn-primary' 
    : 'btn-secondary';

  const responsiveClasses = 'btn-mobile';
  const widthClasses = fullWidth ? 'w-full' : '';
  const disabledClasses = disabled ? 'opacity-50 cursor-not-allowed' : '';

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`${baseClasses} ${responsiveClasses} ${widthClasses} ${disabledClasses} ${className}`}
    >
      {children}
    </button>
  );
}
