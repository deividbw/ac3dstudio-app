import type React from 'react';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button'; // Import Button

interface PageHeaderProps {
  title: string;
  children?: React.ReactNode;
  backButtonHref?: string; // Nova prop opcional
}

export function PageHeader({ title, children, backButtonHref }: PageHeaderProps) {
  return (
    <div className="mb-6 flex flex-col items-start justify-between gap-4 rounded-lg border bg-card p-4 shadow-sm sm:flex-row sm:items-center">
      <div className="flex items-center gap-3"> {/* Envolve a seta e o título */}
        {backButtonHref && (
          <Link href={backButtonHref}>
            <Button className="h-8 w-8 shrink-0 border bg-background hover:bg-accent hover:text-accent-foreground">
              <ArrowLeft className="h-5 w-5" />
              <span className="sr-only">Voltar</span>
            </Button>
          </Link>
        )}
        <h1 className="text-2xl font-bold tracking-tight text-foreground font-heading">{title}</h1>
      </div>
      {children && <div className="flex items-center gap-2">{children}</div>}
    </div>
  );
}
