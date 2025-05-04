'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { useTheme } from '@/contexts/ThemeContext';
import Card from '@/components/common/Card';
import Button from '@/components/common/Button';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';

export default function RequestCategoryPage({ params }) {
  const router = useRouter();
  const { user } = useAuth();
  const { colors, isDarkMode } = useTheme();
  const [requestTypes, setRequestTypes] = useState([]);
  const [loading, setLoading] = useState(true);

  const categoryInfo = {
    scolarite: {
      title: 'Scolarité',
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      ),
      color: '#3B82F6',
    },
    administrative: {
      title: 'Administrative',
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
        </svg>
      ),
      color: '#10B981',
    },
    ressources: {
      title: 'Ressources',
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      ),
      color: '#F59E0B',
    },
    maintenance: {
      title: 'Maintenance',
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a1 1 0 00-.626.137l-1.09.637a1 1 0 00-.472.764l-.137 1.38h-1.378a1 1 0 00-.764.473l-.637 1.09a1 1 0 00.137.626l.477 2.387a2 2 0 00.548 1.022l.765.765a2 2 0 002.83 0L19.428 21a2 2 0 00.085-2.83L20 18.343V15a3 3 0 00-3-3h-1.172a1 1 0 00-.707.293L8.464 20.586a2 2 0 11-2.83-2.83L12.292 11.293a1 1 0 00.293-.707V9a3 3 0 013-3h3.343l-.657-.657a2 2 0 010-2.83L19.43 1.43a2 2 0 012.83 0l.758.757a2 2 0 010 2.83z" />
        </svg>
      ),
      color: '#EF4444',
    },
    professor: {
      title: 'Professeur',
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
        </svg>
      ),
      color: '#8B5CF6',
    },
  };

  useEffect(() => {
    fetchRequestTypes();
  }, [params.category]);

  const fetchRequestTypes = async () => {
    try {
      // Simuler la récupération des types de requête depuis Firebase
      // En production, utilisez un appel à Firebase pour récupérer les types de requête par catégorie
      const mockRequestTypes = {
        scolarite: [
          {
            id: 'publication-note',
            title: 'Demande de publication de note',
            description: 'Pour demander la publication d\'une note manquante',
            estimatedTime: '5 jours',
            requiredDocs: ['Reçu de paiement de pension'],
          },
          {
            id: 'rectification-matricule',
            title: 'Rectification de matricule',
            description: 'Pour corriger une erreur dans votre matricule',
            estimatedTime: '7 jours',
            requiredDocs: ['Reçu de paiement de pension'],
          },
          {
            id: 'blocage-matricule',
            title: 'Demande de blocage de matricule',
            description: 'Demande de blocage temporaire de matricule',
            estimatedTime: '14 jours',
            requiredDocs: ['Reçu de paiement de pension', 'Lettre d\'admission'],
          },
          {
            id: 'activation-matricule',
            title: 'Demande d\'activation de matricule',
            description: 'Réactivation d\'un matricule bloqué',
            estimatedTime: '7 jours',
            requiredDocs: ['Reçu de paiement de pension'],
          },
        ],
        administrative: [
          {
            id: 'certificat',
            title: 'Demande de certificat',
            description: 'Demander un certificat officiel',
            estimatedTime: '10 jours',
            requiredDocs: ['Pièce d\'identité', 'Reçu de paiement'],
          },
          {
            id: 'attestation',
            title: 'Demande d\'attestation',
            description: 'Obtenir une attestation de scolarité',
            estimatedTime: '5 jours',
            requiredDocs: ['Reçu de paiement de pension'],
          },
          {
            id: 'changement-filiere',
            title: 'Changement de filière',
            description: 'Demander un changement d\'orientation',
            estimatedTime: '21 jours',
            requiredDocs: ['Relevé de notes', 'Lettre de motivation'],
          },
          {
            id: 'validation-acquis',
            title: 'Validation des acquis',
            description: 'Faire valider vos acquis antérieurs',
            estimatedTime: '30 jours',
            requiredDocs: ['Diplômes antérieurs', 'Relevé de notes'],
          },
        ],
        ressources: [],
        maintenance: [
          {
            id: 'reparation-infrastructure',
            title: 'Réparation d\'infrastructure',
            description: 'Signaler un problème d\'infrastructure',
            estimatedTime: '15 jours',
            requiredDocs: ['Photos du problème'],
          },
          {
            id: 'reparation-materiel',
            title: 'Réparation de matériel',
            description: 'Demander la réparation d\'équipement',
            estimatedTime: '10 jours',
            requiredDocs: ['Description du problème'],
          },
        ],
        professor: [
          {
            id: 'consultation-copie',
            title: 'Consultation de copie',
            description: 'Demander la consultation d\'une copie d\'examen',
            estimatedTime: '7 jours',
            requiredDocs: ['Matricule'],
          },
        ],
      };

      setRequestTypes(mockRequestTypes[params.category] || []);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching request types:', error);
      setLoading(false);
    }
  };

  const currentCategory = categoryInfo[params.category];

  const handleRequestClick = (requestId) => {
    router.push(`/requests/${params.category}/${requestId}`);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: colors.background.primary }}>
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-6" style={{ backgroundColor: colors.background.secondary }}>
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <Button
            variant="secondary"
            onClick={() => router.push('/requests')}
            style={{ borderColor: colors.border }}
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Retour
          </Button>
        </div>

        <div className="flex items-center mb-8">
          <div
            className="flex-shrink-0 p-4 rounded-lg mr-6"
            style={{
              backgroundColor: isDarkMode ? `rgba(${parseInt(currentCategory.color.slice(1, 3), 16)}, ${parseInt(currentCategory.color.slice(3, 5), 16)}, ${parseInt(currentCategory.color.slice(5, 7), 16)}, 0.2)` : `${currentCategory.color}20`,
              color: currentCategory.color
            }}
          >
            {currentCategory.icon}
          </div>
          <div>
            <h1 className="text-3xl font-bold" style={{ color: colors.text.primary }}>
              {currentCategory.title}
            </h1>
            <p className="mt-2" style={{ color: colors.text.secondary }}>
              Sélectionnez le type de demande que vous souhaitez faire
            </p>
          </div>
        </div>

        {params.category === 'ressources' && (
          <Card>
            <div className="p-8 text-center">
              <div className="mb-6" style={{ color: currentCategory.color }}>
                {currentCategory.icon}
              </div>
              <h3 className="text-xl font-semibold mb-4" style={{ color: colors.text.primary }}>
                Réservation de ressources
              </h3>
              <p className="text-lg mb-8" style={{ color: colors.text.secondary }}>
                Pour réserver une salle ou du matériel, utilisez le système de ressources
              </p>
              <Button
                onClick={() => router.push(user?.role === 'student' ? '/student/resources' : '/resources')}
                style={{ backgroundColor: currentCategory.color }}
                className="text-white"
              >
                Accéder aux ressources
              </Button>
            </div>
          </Card>
        )}

        {requestTypes.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {requestTypes.map((requestType) => (
              <Card
                key={requestType.id}
                className="cursor-pointer hover:shadow-lg transition-shadow"
                onClick={() => handleRequestClick(requestType.id)}
              >
                <div className="p-6">
                  <h3 className="text-lg font-semibold mb-2" style={{ color: colors.text.primary }}>
                    {requestType.title}
                  </h3>
                  <p className="mb-4" style={{ color: colors.text.secondary }}>
                    {requestType.description}
                  </p>

                  <div className="space-y-3 mb-6">
                    <div className="flex items-center text-sm">
                      <svg className="w-4 h-4 mr-2" style={{ color: colors.text.tertiary }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <span style={{ color: colors.text.secondary }}>Délai: {requestType.estimatedTime}</span>
                    </div>

                    {requestType.requiredDocs && requestType.requiredDocs.length > 0 && (
                      <div className="flex items-start text-sm">
                        <svg className="w-4 h-4 mr-2 mt-0.5 flex-shrink-0" style={{ color: colors.text.tertiary }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                        <div>
                          <p style={{ color: colors.text.secondary }}>Documents requis:</p>
                          <ul className="list-disc list-inside mt-1">
                            {requestType.requiredDocs.map((doc, index) => (
                              <li key={index} style={{ color: colors.text.tertiary }}>{doc}</li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    )}
                  </div>

                  <Button
                    variant="secondary"
                    size="sm"
                    style={{ borderColor: colors.border }}
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
        )}
      </div>
    </div>
  );
}