import type { Metadata } from 'next';
import './globals.css';
import { QueryProvider } from '@/components/providers/QueryProvider';
import { FlashMessage } from '@/components/FlashMessage';

export const metadata: Metadata = {
  title: 'Clube dos Filmes',
  description: 'Plataforma para clubes de filmes: vote, assista, avalie e debata.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR">
      <body className="antialiased min-h-screen bg-stone-50 text-stone-900 dark:bg-stone-950 dark:text-stone-100">
        <QueryProvider>
          <FlashMessage />
          {children}
        </QueryProvider>
      </body>
    </html>
  );
}
