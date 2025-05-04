import { Inter } from 'next/font/google';
import { ThemeProvider } from '@/contexts/ThemeContext';
import './globals.css';
import { AuthProvider } from '@/contexts/AuthContext';

const inter = Inter({ subsets: ['latin'] });

export const metadata = {
  title: 'Portail Administratif',
  description: 'Système de gestion des requêtes et ressources administratives',
};

export default function RootLayout({ children }) {
  return (
    <html lang="fr" suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeProvider>
        <AuthProvider>
          {children}
        </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}