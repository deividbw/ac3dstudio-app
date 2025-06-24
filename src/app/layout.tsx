import type {Metadata, Viewport} from 'next';
import './globals.css';
import { Toaster } from "@/components/ui/toaster"; // Added Toaster
import { HydrationSuppressor } from "@/components/HydrationSuppressor";
import { GlobalHeader } from '@/components/GlobalHeader';

export const metadata: Metadata = {
  title: 'AC3DStudio',
  description: 'Orçamento de peças feitas em 3D',
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'AC3DStudio',
  },
  icons: {
    apple: '/icons/apple-touch-icon.png',
  },
};

export const viewport: Viewport = {
  themeColor: '#26E600',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    // suppressHydrationWarning é usado para evitar erros com temas e outras extensões do lado do cliente.
    <html lang="pt-BR" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=PT+Sans:ital,wght@0,400;0,700;1,400;1,700&display=swap" rel="stylesheet" />
        <script
          dangerouslySetInnerHTML={{
            __html: `
              // Suprimir avisos de hidratação relacionados aos atributos fdprocessedid
              (function() {
                // Interceptar console.error antes do React carregar
                const originalError = console.error;
                console.error = function(...args) {
                  const message = args[0];
                  if (
                    typeof message === 'string' &&
                    (message.includes('fdprocessedid') || 
                     message.includes('hydration') ||
                     message.includes('server rendered HTML') ||
                     message.includes('tree hydrated') ||
                     message.includes('preload') ||
                     message.includes('themeColor') ||
                     message.includes('viewport') ||
                     message.includes('Attempted to call viewport'))
                  ) {
                    return; // Suprimir o aviso
                  }
                  originalError.apply(console, args);
                };

                // Também interceptar console.warn para hidratação e outros avisos
                const originalWarn = console.warn;
                console.warn = function(...args) {
                  const message = args[0];
                  if (
                    typeof message === 'string' &&
                    (message.includes('fdprocessedid') || 
                     message.includes('hydration') ||
                     message.includes('server rendered HTML') ||
                     message.includes('preload') ||
                     message.includes('themeColor') ||
                     message.includes('viewport') ||
                     message.includes('Unsupported metadata'))
                  ) {
                    return; // Suprimir o aviso
                  }
                  originalWarn.apply(console, args);
                };

                // Suprimir avisos de hidratação do React
                window.addEventListener('error', function(event) {
                  if (event.message && (
                    event.message.includes('fdprocessedid') ||
                    event.message.includes('preload') ||
                    event.message.includes('themeColor') ||
                    event.message.includes('viewport')
                  )) {
                    event.preventDefault();
                    return false;
                  }
                });
              })();
            `,
          }}
        />
      </head>
      <body className="font-body antialiased" suppressHydrationWarning>
        <HydrationSuppressor />
        <GlobalHeader />
        {children}
        <Toaster />
      </body>
    </html>
  );
}
