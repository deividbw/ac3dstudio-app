import { AppSidebar } from '@/components/AppSidebar';
import React from 'react';

export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen bg-background">
      <AppSidebar />
      <main className="flex-1 overflow-auto p-6 pl-[calc(theme(spacing.64)_+_theme(spacing.6))]">
        {children}
      </main>
    </div>
  );
}
