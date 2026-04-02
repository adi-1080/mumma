import React from 'react';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
}

export default function Card({
  children,
  onClick,
  className = '',
}: {
  children: React.ReactNode;
  onClick?: () => void;
  className?: string;
}) {
  const baseClasses = 'card-primary';
  const responsiveClasses = 'card-mobile';
  const interactiveClasses = onClick ? 'cursor-pointer hover:shadow-lg' : '';

  return (
    <div 
      className={`${baseClasses} ${responsiveClasses} ${interactiveClasses} ${className}`}
      onClick={onClick}
    >
      {children}
    </div>
  );
}
