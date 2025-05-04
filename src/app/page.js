'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useTheme } from '@/contexts/ThemeContext';
import { db } from '@/lib/firebase';
import { doc, getDoc } from 'firebase/firestore';
import Image from 'next/image';

export default function HomePage() {
  const router = useRouter();
  const { colors, isDarkMode } = useTheme();
  const [settings, setSettings] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkSetup = async () => {
      try {
        const settingsDoc = await getDoc(doc(db, 'settings', 'app'));

        if (!settingsDoc.exists() || !settingsDoc.data().setupCompleted) {
          router.push('/setup');
          return;
        }

        setSettings(settingsDoc.data());
        setLoading(false);
      } catch (err) {
        console.error('Error checking settings:', err);
        setLoading(false);
      }
    };

    checkSetup();
  }, [router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: colors.background.primary }}>
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  const features = [
    {
      title: 'Demandes administratives',
      description: 'Soumettez vos demandes administratives en ligne et suivez leur progression en temps réel.',
      icon: (
        <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      ),
    },
    {
      title: 'Réservation de ressources',
      description: 'Consultez la disponibilité des salles et du matériel et effectuez vos réservations facilement.',
      icon: (
        <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      ),
    },
    {
      title: 'Suivi et notifications',
      description: 'Recevez des notifications en temps réel sur l\'avancement de vos demandes et réservations.',
      icon: (
        <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
        </svg>
      ),
    },
  ];

  return (
    <div className="min-h-screen" style={{ backgroundColor: colors.background.secondary }}>
      <header className="shadow-sm" style={{ backgroundColor: colors.background.primary }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center">
              {settings?.logo ? (
                <Image
                  src={settings.logo}
                  alt={settings.institutionName}
                  className="h-8 w-auto"
                  width={32}
                  height={32}
                />
              ) : (
                <span className="text-xl font-bold" style={{ color: colors.primary }}>
                  {settings?.institutionName || 'Portail Administratif'}
                </span>
              )}
            </div>
            <div>
              <Link href="/login" className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white" style={{ backgroundColor: colors.primary }}>
                Connexion
              </Link>
            </div>
          </div>
        </div>
      </header>

      <div className="py-12" style={{ backgroundColor: colors.primary }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl font-extrabold text-white sm:text-5xl sm:tracking-tight lg:text-6xl">
              Simplifiez vos démarches administratives
            </h1>
            <p className="max-w-xl mt-5 mx-auto text-xl" style={{ color: 'rgba(255, 255, 255, 0.9)' }}>
              Un portail centralisé pour toutes vos demandes et réservations de ressources.
            </p>
            <div className="mt-8 flex justify-center">
              <div className="inline-flex rounded-md shadow">
                <Link href="/register" className="inline-flex items-center justify-center px-5 py-3 border border-transparent text-base font-medium rounded-md text-blue-600 bg-white hover:bg-gray-50">
                  S&apos;inscrire gratuitement
                </Link>
              </div>
              <div className="ml-3 inline-flex">
                <Link href="/login" className="inline-flex items-center justify-center px-5 py-3 border border-transparent text-base font-medium rounded-md text-white hover:opacity-90" style={{ backgroundColor: colors.primaryDark }}>
                  Se connecter
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-3xl font-extrabold sm:text-4xl" style={{ color: colors.text.primary }}>
              Nos services
            </h2>
            <p className="mt-4 max-w-2xl mx-auto text-xl" style={{ color: colors.text.secondary }}>
              Une plateforme intuitive pour faciliter toutes vos démarches.
            </p>
          </div>

          <div className="mt-10">
            <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
              {features.map((feature, index) => (
                <div key={index} className="overflow-hidden shadow rounded-lg" style={{ backgroundColor: colors.background.primary }}>
                  <div className="px-4 py-5 sm:p-6">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 rounded-md p-3" style={{ backgroundColor: colors.primary }}>
                        <div className="text-white">
                          {feature.icon}
                        </div>
                      </div>
                      <div className="ml-5">
                        <h3 className="text-lg font-medium" style={{ color: colors.text.primary }}>{feature.title}</h3>
                      </div>
                    </div>
                    <div className="mt-4">
                      <p className="text-base" style={{ color: colors.text.secondary }}>
                        {feature.description}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="py-12" style={{ backgroundColor: colors.background.primary }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-3xl font-extrabold sm:text-4xl" style={{ color: colors.text.primary }}>
              Notre impact
            </h2>
            <p className="mt-4 max-w-2xl mx-auto text-xl" style={{ color: colors.text.secondary }}>
              Des chiffres qui témoignent de notre efficacité.
            </p>
          </div>

          <div className="mt-10">
            <div className="grid grid-cols-1 gap-8 sm:grid-cols-3">
              <div className="overflow-hidden shadow rounded-lg" style={{ backgroundColor: colors.background.secondary }}>
                <div className="px-4 py-5 sm:p-6 text-center">
                  <div className="text-3xl font-extrabold" style={{ color: colors.primary }}>+50%</div>
                  <div className="mt-2 text-lg font-medium" style={{ color: colors.text.primary }}>Gain de temps</div>
                  <div className="mt-1 text-sm" style={{ color: colors.text.secondary }}>Dans le traitement des demandes</div>
                </div>
              </div>

              <div className="overflow-hidden shadow rounded-lg" style={{ backgroundColor: colors.background.secondary }}>
                <div className="px-4 py-5 sm:p-6 text-center">
                  <div className="text-3xl font-extrabold" style={{ color: colors.primary }}>-30%</div>
                  <div className="mt-2 text-lg font-medium" style={{ color: colors.text.primary }}>Réduction des erreurs</div>
                  <div className="mt-1 text-sm" style={{ color: colors.text.secondary }}>Grâce à notre système de validation</div>
                </div>
              </div>

              <div className="overflow-hidden shadow rounded-lg" style={{ backgroundColor: colors.background.secondary }}>
                <div className="px-4 py-5 sm:p-6 text-center">
                  <div className="text-3xl font-extrabold" style={{ color: colors.primary }}>100%</div>
                  <div className="mt-2 text-lg font-medium" style={{ color: colors.text.primary }}>Traçabilité</div>
                  <div className="mt-1 text-sm" style={{ color: colors.text.secondary }}>Des demandes et des réservations</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <footer style={{ backgroundColor: colors.background.secondary }}>
        <div className="max-w-7xl mx-auto py-12 px-4 overflow-hidden sm:px-6 lg:px-8">
          <div className="mt-8 flex justify-center space-x-6">
            <p className="text-center text-base" style={{ color: colors.text.tertiary }}>
              &copy; {new Date().getFullYear()} {settings?.institutionName || 'Portail Administratif'}. Tous droits réservés.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}