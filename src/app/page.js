'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import useAuth from '@/hooks/useAuth';
import { db } from '@/lib/firebase';
import { doc, getDoc } from 'firebase/firestore';

export default function HomePage() {
  const router = useRouter();
  const { user, loading } = useAuth();
  const [settings, setSettings] = useState(null);

  // Fonction pour obtenir la route du dashboard selon le rôle
  const getDashboardRoute = () => {
    if (!user) return '/dashboard';

    switch (user.role) {
      case 'superadmin':
      case 'admin':
        return '/admin';
      case 'service_head':
      case 'service_member':
        return '/service';
      case 'student':
        return '/student';
      case 'employee':
        return '/dashboard';
      default:
        return '/dashboard';
    }
  };

  useEffect(() => {
    const checkSetup = async () => {
      try {
        const settingsDoc = await getDoc(doc(db, 'settings', 'app'));

        if (!settingsDoc.exists() || !settingsDoc.data().setupCompleted) {
          router.push('/setup');
          return;
        }

        setSettings(settingsDoc.data());
      } catch (err) {
        console.error('Error checking settings:', err);
      }
    };

    checkSetup();
  }, [router]);

  if (loading || !settings) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600"></div>
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
        <svg className="h-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
    <div className="min-h-screen bg-gray-50">
      <header className="shadow-sm bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center">
              <span className="text-xl font-bold text-blue-600">
                {settings?.institutionName || 'Portail Administratif'}
              </span>
            </div>
            <div>
              {user ? (
                <Link href={getDashboardRoute()} className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700">
                  Tableau de bord
                </Link>
              ) : (
                <Link href="/login" className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700">
                  Connexion
                </Link>
              )}
            </div>
          </div>
        </div>
      </header>

      <div className="py-12 bg-blue-600">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl font-extrabold text-white sm:text-5xl sm:tracking-tight lg:text-6xl">
              Simplifiez vos démarches administratives
            </h1>
            <p className="max-w-xl mt-5 mx-auto text-xl text-gray-100">
              Un portail centralisé pour toutes vos demandes et réservations de ressources.
            </p>
            {!user && (
              <div className="mt-8 flex justify-center">
                <div className="inline-flex rounded-md shadow">
                  <Link href="/register" className="inline-flex items-center justify-center px-5 py-3 border border-transparent text-base font-medium rounded-md text-blue-600 bg-white hover:bg-gray-50">
                    S&apos;inscrire gratuitement
                  </Link>
                </div>
                <div className="ml-3 inline-flex">
                  <Link href="/login" className="inline-flex items-center justify-center px-5 py-3 border border-transparent text-base font-medium rounded-md text-white bg-blue-700 hover:bg-blue-800">
                    Se connecter
                  </Link>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-3xl font-extrabold text-gray-900 sm:text-4xl">
              Nos services
            </h2>
            <p className="mt-4 max-w-2xl mx-auto text-xl text-gray-500">
              Une plateforme intuitive pour faciliter toutes vos démarches.
            </p>
          </div>

          <div className="mt-10">
            <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
              {features.map((feature, index) => (
                <div key={index} className="overflow-hidden shadow rounded-lg bg-white">
                  <div className="px-4 py-5 sm:p-6">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 rounded-md p-3 bg-blue-600">
                        <div className="text-white">
                          {feature.icon}
                        </div>
                      </div>
                      <div className="ml-5">
                        <h3 className="text-lg font-medium text-gray-900">{feature.title}</h3>
                      </div>
                    </div>
                    <div className="mt-4">
                      <p className="text-base text-gray-500">
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

      <footer className="bg-white">
        <div className="max-w-7xl mx-auto py-12 px-4 overflow-hidden sm:px-6 lg:px-8">
          <div className="mt-8 flex justify-center space-x-6">
            <p className="text-center text-base text-gray-400">
              &copy; {new Date().getFullYear()} {settings?.institutionName || 'Portail Administratif'}. Tous droits réservés.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}