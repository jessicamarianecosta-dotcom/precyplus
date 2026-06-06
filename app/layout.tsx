import type { Metadata } from 'next';
import './globals.css';
import { Toaster } from 'sonner';

export const metadata: Metadata = {
  title: 'Precy+ | Precifique com confiança',
  description: 'Sistema de precificação inteligente para pequenos empreendedores, artesãos e criadores.',
  keywords: 'precificação, empreendedores, artesanato, custos, margem de lucro',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Nunito:wght@400;500;600;700;800;900&family=Playfair+Display:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>
        {children}
        <Toaster
          position="top-right"
          toastOptions={{
            style: {
              fontFamily: 'Nunito, sans-serif',
              borderRadius: '12px',
              border: '1px solid rgba(255, 107, 173, 0.15)',
            },
          }}
        />
      </body>
    </html>
  );
}
