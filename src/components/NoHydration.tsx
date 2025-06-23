"use client";

import { useEffect, useState } from 'react';

interface NoHydrationProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export function NoHydration({ children, fallback = null }: NoHydrationProps) {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  if (!isClient) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
} 
