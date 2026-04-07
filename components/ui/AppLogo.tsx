import React from 'react';

export default function AppLogo({ className = '' }: { className?: string }) {
  return (
    <img 
      src="/mummalogo.png" 
      alt="Mumma's Kitchen" 
      className={className}
    />
  );
}
