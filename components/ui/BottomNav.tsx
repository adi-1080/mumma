'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function BottomNav() {
  const pathname = usePathname();

  const getActiveClass = (path: string) => {
    const isActive = path === '/' ? pathname === '/' : pathname.startsWith(path);
    return isActive ? 'text-pink scale-110' : 'text-dark/40';
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 h-[68px] bg-cream border-t-[3px] border-dark flex items-center justify-around px-2 z-[999] md:hidden shadow-[0_-4px_10px_rgba(0,0,0,0.06)] pb-safe">
      <Link href="/" className={`flex flex-col items-center justify-center w-14 h-12 transition-all active:scale-95 ${getActiveClass('/')}`}>
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-5 h-5">
          <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12l8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25" />
        </svg>
        <span className="text-[10px] font-lilita tracking-wide mt-1">Home</span>
      </Link>

      <Link href="/cook" className={`flex flex-col items-center justify-center w-14 h-12 transition-all active:scale-95 ${getActiveClass('/cook')}`}>
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-5 h-5">
          <path strokeLinecap="round" strokeLinejoin="round" d="M15.362 5.214A8.252 8.252 0 0112 21 8.25 8.25 0 016.038 7.048 8.287 8.287 0 009 9.6a8.983 8.983 0 013.361-6.867 8.21 8.21 0 003 2.48z" />
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 18a3.75 3.75 0 00.495-7.467 5.99 5.99 0 00-1.925 3.546 5.974 5.974 0 01-2.133-1A3.75 3.75 0 0012 18z" />
        </svg>
        <span className="text-[10px] font-lilita tracking-wide mt-1">Cook</span>
      </Link>

      <Link href="/community" className={`flex flex-col items-center justify-center w-14 h-12 transition-all active:scale-95 ${getActiveClass('/community')}`}>
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-5 h-5">
          <path strokeLinecap="round" strokeLinejoin="round" d="M18 18.72a9.094 9.094 0 003.741-.479 3 3 0 00-4.682-2.72m.94 3.198l.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0112 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 016 18.719m0 0a5.959 5.959 0 01.478-2.72m3.64-3.64a9.06 9.06 0 00-3.741-.479 3 3 0 00-4.682 2.72m.94 3.198l.001.031c0 .225-.012.447-.037.666A11.94 11.94 0 0010 20.758m.007-7.04C10.51 10.96 10.97 8.262 12 5.25c1.03 3.012 1.49 5.71 1.993 8.468M15 11c0-1.657-1.343-3-3-3s-3 1.343-3 3 1.343 3 3 3 3-1.343 3-3zm-9 3c0-1.105-.895-2-2-2s-2 .895-2 2 .895 2 2 2 2-.895 2-2zm18 0c0-1.105-.895-2-2-2s-2 .895-2 2 .895 2 2 2 2-.895 2-2z" />
        </svg>
        <span className="text-[10px] font-lilita tracking-wide mt-1">Community</span>
      </Link>

      <Link href="/recipes" className={`flex flex-col items-center justify-center w-14 h-12 transition-all active:scale-95 ${getActiveClass('/recipes')}`}>
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-5 h-5">
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" />
        </svg>
        <span className="text-[10px] font-lilita tracking-wide mt-1">Recipes</span>
      </Link>

      <Link href="/pricing" className={`flex flex-col items-center justify-center w-14 h-12 transition-all active:scale-95 ${getActiveClass('/pricing')}`}>
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-5 h-5">
          <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z" />
        </svg>
        <span className="text-[10px] font-lilita tracking-wide mt-1">Go Pro</span>
      </Link>
    </div>
  );
}
