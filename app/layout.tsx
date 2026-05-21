import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Taxi Comptabilité | Gestion factures et dépenses',
  description: 'Plateforme de gestion comptable simplifiée pour chauffeurs de taxi',
  keywords: ['taxi', 'comptabilité', 'factures', 'dépenses'],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="fr">
      <body className="bg-white antialiased">
        {children}
      </body>
    </html>
  );
}
