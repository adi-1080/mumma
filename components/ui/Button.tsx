import React from 'react';

interface ButtonProps {
  children: React.ReactNode;
  variant?: 'primary' | 'secondary';
  disabled?: boolean;
  isLoading?: boolean;
  loadingText?: string;
  onClick?: () => void;
  type?: 'button' | 'submit' | 'reset';
  className?: string;
  fullWidth?: boolean;
}

export default function Button({
  children,
  variant = 'primary',
  disabled = false,
  isLoading = false,
  loadingText,
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
  const disabledClasses = (disabled || isLoading) ? 'opacity-80 cursor-not-allowed' : '';
  const loadingClasses = isLoading ? 'btn-loading' : '';

  return (
    <button
      type={type}
      onClick={isLoading ? undefined : onClick}
      disabled={disabled || isLoading}
      className={`${baseClasses} ${responsiveClasses} ${widthClasses} ${disabledClasses} ${loadingClasses} ${className}`}
    >
      <div className="flex items-center justify-center gap-2">
        {isLoading ? (
          <>
            {loadingText || children}
            <span className="flex gap-1 ml-1">
              <span className="w-1.5 h-1.5 bg-current rounded-full animate-bounce [animation-delay:-0.3s]"></span>
              <span className="w-1.5 h-1.5 bg-current rounded-full animate-bounce [animation-delay:-0.15s]"></span>
              <span className="w-1.5 h-1.5 bg-current rounded-full animate-bounce"></span>
            </span>
          </>
        ) : children}
      </div>
    </button>
  );
}
