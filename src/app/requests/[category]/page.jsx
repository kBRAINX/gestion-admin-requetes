'use client';

import { use, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { db } from '@/lib/firebase';
import { collection, query, where, getDocs } from 'firebase/firestore';
import Card from '@/components/common/Card';
import Button from '@/components/common/Button';

export default function RequestCategoryPage({ params }) {
  const router = useRouter();
  const unwrappedParams = use(params);
  const [requestTypes, setRequestTypes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const categoryInfo = {
    scolarite: {
      title: 'Scolarité',
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      ),
      color: '#2563EB',
    },
    administrative: {
      title: 'Administrative',
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
        </svg>
      ),
      color: '#059669',
    },
    ressources: {
      title: 'Ressources',
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      ),
      color: '#D97706',
    },
    maintenance: {
      title: 'Maintenance',
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a1 1 0 00-.626.137l-1.09.637a1 1 0 00-.472.764l-.137 1.38h-1.378a1 1 0 00-.764.473l-.637 1.09a1 1 0 00.137.626l.477 2.387a2 2 0 00.548 1.022l.765.765a2 2 0 002.83 0L19.428 21a2 2 0 00.085-2.83L20 18.343V15a3 3 0 00-3-3h-1.172a1 1 0 00-.707.293L8.464 20.586a2 2 0 11-2.83-2.83L12.292 11.293a1 1 0 00.293-.707V9a3 3 0 013-3h3.343l-.657-.657a2 2 0 010-2.83L19.43 1.43a2 2 0 012.83 0l.758.757a2 2 0 010 2.83z" />
        </svg>
      ),
      color: '#DC2626',
    },
    professor: {
      title: 'Professeur',
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
        </svg>
      ),
      color: '#7C3AED',
    },
  };

  useEffect(() => {
    fetchRequestTypes();
  }, [unwrappedParams.category]);

  const fetchRequestTypes = async () => {
    try {
      setLoading(true);

      // Query Firebase pour obtenir les types de requêtes de la catégorie actuelle
      const q = query(
        collection(db, 'requestTypes'),
        where('category', '==', unwrappedParams.category),
        where('isActive', '==', true)
      );

      const querySnapshot = await getDocs(q);
      const types = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));

      setRequestTypes(types);
      setError('');
    } catch (error) {
      console.error('Error fetching request types:', error);
      setError('Erreur lors du chargement des types de requêtes');
      setRequestTypes([]);
    } finally {
      setLoading(false);
    }
  };

  const currentCategory = categoryInfo[unwrappedParams.category];

  const handleRequestClick = (requestId) => {
    router.push(`/requests/${unwrappedParams.category}/${requestId}`);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="flex items-center space-x-3">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-600"></div>
          <span className="text-gray-700">Chargement en cours...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white py-8 lg:py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <Button
            variant="secondary"
            onClick={() => router.push('/requests')}
            className="mb-6"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Retour
          </Button>
        </div>

        <div className="flex items-center mb-12">
          <div
            className="flex-shrink-0 p-4 rounded-lg mr-6"
            style={{
              backgroundColor: `${currentCategory.color}10`,
              color: currentCategory.color
            }}
          >
            {currentCategory.icon}
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              {currentCategory.title}
            </h1>
            <p className="mt-2 text-lg text-gray-600">
              Sélectionnez le type de demande que vous souhaitez faire
            </p>
          </div>
        </div>

        {unwrappedParams.category === 'ressources' ? (
          <Card>
            <div className="p-8 text-center">
              <div className="mb-6" style={{ color: currentCategory.color }}>
                {currentCategory.icon}
              </div>
              <h3 className="text-xl font-semibold mb-4 text-gray-900">
                Réservation de ressources
              </h3>
              <p className="text-lg mb-8 text-gray-600">
                Pour réserver une salle ou du matériel, utilisez le système de ressources
              </p>
              <Button
                onClick={() => router.push('/resources')}
                style={{ backgroundColor: currentCategory.color }}
                className="text-white"
              >
                Accéder aux ressources
              </Button>
            </div>
          </Card>
        ) : error ? (
          <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-8">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-red-700">{error}</p>
              </div>
            </div>
          </div>
        ) : requestTypes.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {requestTypes.map((requestType) => (
              <Card
                key={requestType.id}
                className="cursor-pointer hover:shadow-lg transition-shadow"
                onClick={() => handleRequestClick(requestType.id)}
              >
                <div className="p-6">
                  <h3 className="text-lg font-semibold mb-2 text-gray-900">
                    {requestType.title}
                  </h3>
                  <p className="mb-4 text-gray-600">
                    {requestType.description}
                  </p>

                  <div className="space-y-3 mb-6">
                    <div className="flex items-center text-sm">
                      <svg className="w-4 h-4 mr-2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <span className="text-gray-600">Délai: {requestType.estimatedProcessTime} jours</span>
                    </div>

                    {requestType.requiredAttachmentTypes && requestType.requiredAttachmentTypes.length > 0 && (
                      <div className="flex items-start text-sm">
                        <svg className="w-4 h-4 mr-2 mt-0.5 flex-shrink-0 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                        <div>
                          <p className="text-gray-600">Documents requis:</p>
                          <ul className="list-disc list-inside mt-1">
                            {requestType.requiredAttachmentTypes.map((doc, index) => (
                              <li key={index} className="text-gray-500">{doc}</li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    )}
                  </div>

                  <Button
                    variant="secondary"
                    size="sm"
                    className="w-full"
                  >
                    Faire cette demande
                    <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        ) : (
          <Card>
            <div className="p-8 text-center">
              <svg className="mx-auto h-12 w-12 text-gray-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Aucune demande disponible
              </h3>
              <p className="text-gray-600">
                Il n'y a pas de type de demande disponible pour cette catégorie.
              </p>
            </div>
          </Card>
        )}
      </div>
    </div>
  );
}