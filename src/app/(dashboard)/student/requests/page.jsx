'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import useAuth from '@/hooks/useAuth';
import { useRequests } from '@/hooks/useRequests';
import { useTheme } from '@/contexts/ThemeContext';
import Button from '@/components/common/Button';
import Card from '@/components/common/Card';
import Tabs from '@/components/common/Tabs';
import { ROLES } from '@/lib/auth-permissions';

export default function StudentRequestsPage() {
  const router = useRouter();
  const { user } = useAuth();
  const { requests, loading } = useRequests();
  const { colors, isDarkMode } = useTheme();
  const [activeTab, setActiveTab] = useState('scolarite');

  useEffect(() => {
    if (!user) {
      router.push('/login');
      return;
    }

    if (user.role !== ROLES.STUDENT) {
      router.push('/dashboard');
    }
  }, [user, router]);

  const requestCategories = [
    {
      id: 'scolarite',
      label: 'Scolarité',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      ),
      types: [
        { id: 'publication-note', title: 'Demande de publication de note', description: 'Pour demander la publication d\'une note manquante' },
        { id: 'rectification-matricule', title: 'Rectification de matricule', description: 'Pour corriger une erreur dans votre matricule' },
        { id: 'attestation', title: 'Attestation', description: 'Demander une attestation de scolarité' },
        { id: 'duplicata', title: 'Duplicata', description: 'Demander un duplicata de document' },
      ]
    },
    {
      id: 'administrative',
      label: 'Administrative',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
        </svg>
      ),
      types: [
        { id: 'certificat', title: 'Certificat', description: 'Demander un certificat officiel' },
        { id: 'changement-filiere', title: 'Changement de filière', description: 'Demander un changement d\'orientation' },
        { id: 'validation-acquis', title: 'Validation des acquis', description: 'Faire valider vos acquis antérieurs' },
        { id: 'stage', title: 'Demande de stage', description: 'Obtenir une convention de stage' },
      ]
    },
    {
      id: 'ressources',
      label: 'Ressources',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      ),
      description: 'Réservation de salles et de matériel',
      redirect: '/student/resources'
    }
  ];

  const tabs = requestCategories.map(category => ({
    id: category.id,
    label: category.label,
    count: category.types?.length || 0
  }));

  const handleRequestType = (categoryId, typeId) => {
    router.push(`/requests/${categoryId}/${typeId}`);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: colors.background.primary }}>
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  const activeCategory = requestCategories.find(cat => cat.id === activeTab);

  return (
    <div className="min-h-screen p-6" style={{ backgroundColor: colors.background.secondary }}>
      <h1 className="text-3xl font-bold mb-6" style={{ color: colors.text.primary }}>
        Mes Requêtes
      </h1>

      <Tabs
        tabs={tabs}
        activeTab={activeTab}
        onChange={setActiveTab}
        className="mb-6"
      />

      {activeCategory?.types ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {activeCategory.types.map(type => (
            <Card
              key={type.id}
              className="hover:shadow-lg transition-shadow cursor-pointer"
              onClick={() => handleRequestType(activeCategory.id, type.id)}
            >
              <div className="p-6">
                <div className="flex items-center mb-4">
                  <div
                    className="p-3 rounded-lg mr-4"
                    style={{ backgroundColor: isDarkMode ? 'rgba(59, 130, 246, 0.2)' : 'rgba(59, 130, 246, 0.1)' }}
                  >
                    <svg
                      className="w-6 h-6"
                      style={{ color: colors.primary }}
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="font-semibold" style={{ color: colors.text.primary }}>
                      {type.title}
                    </h3>
                  </div>
                </div>
                <p style={{ color: colors.text.secondary }}>
                  {type.description}
                </p>
                <div className="mt-4">
                  <Button
                    variant="secondary"
                    size="sm"
                    style={{ borderColor: colors.border }}
                  >
                    Faire une demande
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      ) : activeCategory?.redirect ? (
        <Card>
          <div className="p-8 text-center">
            <div
              className="inline-flex items-center justify-center w-16 h-16 rounded-full mb-4"
              style={{ backgroundColor: isDarkMode ? 'rgba(59, 130, 246, 0.2)' : 'rgba(59, 130, 246, 0.1)' }}
            >
              <div style={{ color: colors.primary }}>
                {activeCategory.icon}
              </div>
            </div>
            <h3 className="text-lg font-semibold mb-2" style={{ color: colors.text.primary }}>
              {activeCategory.label}
            </h3>
            <p className="mb-6" style={{ color: colors.text.secondary }}>
              {activeCategory.description}
            </p>
            <Button
              onClick={() => router.push(activeCategory.redirect)}
              style={{ backgroundColor: colors.primary }}
              className="text-white"
            >
              Voir les ressources disponibles
            </Button>
          </div>
        </Card>
      ) : null}
    </div>
  );
}