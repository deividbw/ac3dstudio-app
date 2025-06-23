
import { Suspense } from 'react';
import { Loader2 } from 'lucide-react';
import produtosRedirectClient from './components/produtosRedirectClient';

export default function produtosPage() {
  return (
    <Suspense fallback={
      <div className="flex justify-center items-center min-h-screen">
        <div className="flex flex-col items-center space-y-2">
          <Loader2 className="h-12 w-12 animate-spin text-primary" />
          <p className="text-muted-foreground">Carregando página de produtos...</p>
        </div>
      </div>
    }>
      <produtosRedirectClient />
    </Suspense>
  );
}
