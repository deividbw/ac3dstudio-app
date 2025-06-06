
"use client";

// This page is effectively superseded by the FilamentsTab component 
// under /servicos/cadastros.
// You can choose to redirect from here, remove this page, or keep it if you want a direct link.
// For now, I'll make it a simple redirect to the new location or just a placeholder.
// A better approach might be to have /filaments redirect to /servicos/cadastros?tab=filaments

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function FilamentsPageRedirect() {
  const router = useRouter();

  useEffect(() => {
    // Redirect to the new filaments management UI.
    // If you want to select the tab programmatically, the Tabs component would need to support that.
    // For now, it will go to the page and default to the first tab (which should be Filaments).
    router.replace('/servicos/cadastros'); 
  }, [router]);

  return (
    <div className="flex justify-center items-center min-h-screen">
      <p>Redirecionando para o gerenciamento de filamentos...</p>
    </div>
  );
}
