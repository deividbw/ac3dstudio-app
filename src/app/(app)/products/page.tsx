
"use client";

// This page is now effectively superseded by the ProductsTab component certo
// under /servicos/cadastros.
// You can choose to redirect from here, remove this page, or keep it if you want a direct link.
// For now, I'll make it a simple redirect to the new location.

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';

export default function ProductsPageRedirect() {
  const router = useRouter();
  const searchParams = useSearchParams(); // To preserve any query params if needed

  useEffect(() => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('tab', 'produtos'); // Set the tab to 'produtos'
    // Redirect to the new products management UI within the cadastros tabs
    router.replace(`/servicos/cadastros?${params.toString()}`);
  }, [router, searchParams]);

  return (
    // O conteúdo que usa useSearchParams precisa ser envolto em Suspense
    // Para lidar com a renderização do lado do servidor vs. lado do cliente
    <ProductsPageContent />
  );
}

import { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';

function ProductsPageContent() {
  const searchParams = useSearchParams();
  return (
    <Suspense fallback={<div>Carregando...</div>}>
      <div className="flex justify-center items-center min-h-screen">
        <div className="flex flex-col items-center space-y-2">
          <Loader2 className="h-12 w-12 animate-spin text-primary" />
          <p className="text-muted-foreground">Redirecionando para o gerenciamento de produtos...</p>
        </div>
      </div>
    </Suspense>
  );
}
    