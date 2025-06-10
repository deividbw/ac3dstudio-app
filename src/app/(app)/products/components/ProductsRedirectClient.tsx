
"use client";

import { useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Loader2 } from 'lucide-react';

export default function ProductsRedirectClient() {
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('tab', 'produtos');
    // Redirect to the new products management UI within the cadastros tabs
    router.replace(`/servicos/cadastros?${params.toString()}`);
  }, [router, searchParams]);

  return (
    <div className="flex justify-center items-center min-h-screen">
      <div className="flex flex-col items-center space-y-2">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
        <p className="text-muted-foreground">Redirecionando para o gerenciamento de produtos...</p>
      </div>
    </div>
  );
}
