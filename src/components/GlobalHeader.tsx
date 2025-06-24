"use client";

import React from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';

const APP_VERSION = '0.1.3'; // Versão do package.json

export function GlobalHeader() {
  const { user, signOut } = useAuth();

  const handleLogout = async () => {
    await signOut();
    // Opcional: redirecionar para tela de login
    window.location.href = '/auth';
  };

  return (
    <header className="w-full flex items-center justify-between px-6 py-2 border-b bg-card shadow-sm sticky top-0 z-50">
      <div className="flex items-center gap-4">
        <span className="text-sm text-muted-foreground">
          Usuário: <span className="font-semibold text-primary">{user?.email || 'Desconhecido'}</span>
        </span>
      </div>
      <div className="flex items-center gap-4">
        <span className="text-xs text-muted-foreground">Versão: <span className="font-semibold">{APP_VERSION}</span></span>
        <Button size="sm" variant="outline" onClick={handleLogout}>Sair</Button>
      </div>
    </header>
  );
} 