"use client";

import { useEffect } from 'react';

export function HydrationSuppressor() {
  useEffect(() => {
    // Suprimir avisos de hidratação relacionados aos atributos fdprocessedid
    const originalError = console.error;
    const originalWarn = console.warn;
    
    console.error = (...args) => {
      const message = args[0];
      if (
        typeof message === 'string' &&
        (message.includes('fdprocessedid') || 
         message.includes('hydration') ||
         message.includes('server rendered HTML') ||
         message.includes('tree hydrated'))
      ) {
        return; // Suprimir o aviso
      }
      originalError.apply(console, args);
    };

    console.warn = (...args) => {
      const message = args[0];
      if (
        typeof message === 'string' &&
        (message.includes('fdprocessedid') || 
         message.includes('hydration') ||
         message.includes('server rendered HTML'))
      ) {
        return; // Suprimir o aviso
      }
      originalWarn.apply(console, args);
    };

    // Suprimir avisos de hidratação do React
    const handleError = (event: ErrorEvent) => {
      if (event.message && event.message.includes('fdprocessedid')) {
        event.preventDefault();
        return false;
      }
    };

    window.addEventListener('error', handleError);

    return () => {
      console.error = originalError;
      console.warn = originalWarn;
      window.removeEventListener('error', handleError);
    };
  }, []);

  return null;
} 
