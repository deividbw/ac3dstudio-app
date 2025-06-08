
"use client";

import React from 'react';
import { PageHeader } from '@/components/PageHeader';
import { ShoppingCart } from 'lucide-react'; // Import an icon

export default function EcommercePage() {
  return (
    <div className="space-y-6">
      <PageHeader title="E-commerce" />
      <div className="flex flex-col items-center justify-center min-h-[50vh] text-center">
        <ShoppingCart className="h-24 w-24 text-muted-foreground mb-6" />
        <h2 className="text-2xl font-semibold text-foreground mb-2">
          Página de E-commerce em Construção
        </h2>
        <p className="text-muted-foreground">
          Volte em breve para conferir as novidades da nossa loja virtual!
        </p>
      </div>
    </div>
  );
}
