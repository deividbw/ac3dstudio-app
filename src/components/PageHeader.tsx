import type React from 'react';

interface PageHeaderProps {
  title: string;
  children?: React.ReactNode;
}

export function PageHeader({ title, children }: PageHeaderProps) {
  return (
    <div className="mb-6 flex flex-col items-start justify-between gap-4 rounded-lg border bg-card p-4 shadow-sm sm:flex-row sm:items-center">
      <h1 className="text-2xl font-bold tracking-tight text-foreground font-headline">{title}</h1>
      {children && <div className="flex items-center gap-2">{children}</div>}
    </div>
  );
}
