import { MobileTopBar } from '@/components/MobileTopBar';
import { BottomNav } from '@/components/BottomNav';
import React from 'react';

export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <MobileTopBar />
      <main className="flex-1 overflow-y-auto p-4 pb-20"> {/* Added pb-20 for bottom nav space */}
        {children}
      </main>
      {/* Button absolutely positioned above BottomNav */}
      {/* This button is context-specific to dashboard, ideally passed via slot or context if needed globally */}
      {/* For now, it will be part of the dashboard page layout */}
      <BottomNav />
    </div>
  );
}
