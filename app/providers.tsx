'use client';

import { SessionProvider } from 'next-auth/react';
import React from 'react';
import { FavoriteProvider } from '@/contexts/FavoriteContext';

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <FavoriteProvider>
        {children}
      </FavoriteProvider>
    </SessionProvider>
  );
}
