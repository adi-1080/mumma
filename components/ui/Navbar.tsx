'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { authClient } from '@/lib/auth-client';
import AppLogo from '@/components/ui/AppLogo';

export default function Navbar() {
  const pathname = usePathname();

  const { data: session } = authClient.useSession();

  const getActiveClass = (path: string) => {
    if (path === '/' && pathname === '/') return 'active';
    if (path === '/cook' && pathname.startsWith('/cook')) return 'active';
    if (path === '/community' && pathname === '/community') return 'active';
    return '';
  };

  return (
    <nav className="nav-container nav-mobile relative !z-[9999]">
      <div className="flex items-center gap-2 font-lilita text-white text-xl border-none">
        <div className="w-10 h-10 rounded-[12px] overflow-hidden flex-shrink-0 shadow-custom-small bg-white">
          <AppLogo className="w-full h-full object-cover" />
        </div>
        <span className="mt-1 desktop-only">Mumma's Kitchen</span>
        <span className="mt-1 mobile-only">Mumma's</span>
        <div className="flex gap-1 bg-white/10 rounded-[20px] p-1 mobile-hidden ml-4">
          <Link href="/" className={`np block text-center ${getActiveClass('/')}`}>
            Home
          </Link>
          <Link href="/cook" className={`np block text-center ${getActiveClass('/cook')}`}>
            Cook
          </Link>
          <Link href="/community" className={`np block text-center ${getActiveClass('/community')}`}>
            Community
          </Link>
        </div>
        <span className="mt-1 mobile-hidden"></span>
        <span className="mt-1 mobile-only"></span>
      </div>
      
      {session ? (
        <div className="flex items-center gap-2 ml-auto">
          <Link href="/profile" className="flex items-center">
            <div className="w-8 h-8 rounded-full overflow-hidden border-2 border-dark flex-shrink-0 shadow-custom-small bg-white">
              {session.user?.image ? (
                <img 
                  src={session.user.image} 
                  alt={session.user.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full bg-yellow flex items-center justify-center text-sm">
                  👩‍🍳
                </div>
              )}
            </div>
            <button 
              className="bg-white/20 hover:bg-white/30 text-white font-nunito font-bold text-sm px-3 py-2 rounded-[10px] transition-colors mobile-hidden"
              onClick={async () => {
                await authClient.signOut();
                window.location.pathname = '/';
              }}
            >
              <span className="desktop-only">Sign Out</span>
              <span className="mobile-only">Exit</span>
            </button>
          </Link>
        </div>
      ) : (
        <Link href="/login" className="ml-auto bg-yellow hover:bg-yellow/90 text-dark font-nunito font-bold text-sm px-4 py-2 rounded-[10px] shadow-custom-small transition-colors whitespace-nowrap inline-flex items-center justify-center">
          <span className="desktop-only text-dark">Sign In</span>
          <span className="mobile-only text-dark">Login</span>
        </Link>
      )}
    </nav>
  );
}
