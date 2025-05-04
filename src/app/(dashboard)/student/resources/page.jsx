'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import useAuth from '@/hooks/useAuth';
import { useResources } from '@/hooks/useResources';
import { useTheme } from '@/contexts/ThemeContext';
import Button from '@/components/common/Button';
import Card from '@/components/common/Card';
import ResourceBookingModal from '@/components/modals/ResourceBookingModal';
import { ROLES } from '@/lib/auth-permissions';

export default function StudentResourcesPage() {
  const router = useRouter();
  const { user } = useAuth();
  const { resources, loading } = useResources();
  const { colors, isDarkMode } = useTheme();
  const [selectedResource, setSelectedResource] = useState(null);
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  useEffect(() => {
    if (!user) {
      router.push('/login');
      return;
    }

    if (user.role !== ROLES.STUDENT) {
      router.push('/dashboard');
    }
  }, [user, router]);

  const categories = [
    { value: 'all', label: 'Toutes les catégories' },
    { value: 'salle', label: 'Salles' },
    { value: 'materiel', label: 'Matériel' },
    { value: 'equipement', label: 'Équipements' },
  ];

  const availableResources = resources.filter(resource =>
    resource.isActive && resource.status === 'available' && resource.allowedUsers?.includes('student')
  );

  const filteredResources = availableResources.filter(resource => {
    const matchesSearch = resource.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          resource.description?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || resource.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const handleBookResource = (resource) => {
    setSelectedResource(resource);
    setIsBookingModalOpen(true);
  };

  const handleViewDetails = (resource) => {
    router.push(`/resources/${resource.id}`);
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
      <h1 className="text-3xl font-bold mb-6" style={{ color: colors.text.primary }}>
        Ressources Disponibles
      </h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
        <div className="lg:col-span-2">
          <input
            type="text"
            placeholder="Rechercher une ressource..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full p-2 rounded border"
            style={{
              backgroundColor: colors.background.primary,
              borderColor: colors.border,
              color: colors.text.primary,
            }}
          />
        </div>
        <div>
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="w-full p-2 rounded border"
            style={{
              backgroundColor: colors.background.primary,
              borderColor: colors.border,
              color: colors.text.primary,
            }}
          >
            {categories.map(category => (
              <option key={category.value} value={category.value}>
                {category.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredResources.map(resource => (
          <Card key={resource.id} className="hover:shadow-lg transition-shadow">
            <div className="p-6">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-lg font-semibold" style={{ color: colors.text.primary }}>
                    {resource.name}
                  </h3>
                  <p className="text-sm" style={{ color: colors.text.tertiary }}>
                    Code: {resource.code}
                  </p>
                </div>
                <span
                  className="px-2 py-1 rounded-full text-xs font-medium"
                  style={{
                    backgroundColor: isDarkMode ? 'rgba(59, 130, 246, 0.2)' : 'rgba(59, 130, 246, 0.1)',
                    color: colors.primary,
                  }}
                >
                  {category.label}
                </span>
              </div>

              <p className="mb-4" style={{ color: colors.text.secondary }}>
                {resource.description || 'Aucune description disponible'}
              </p>

              <div className="space-y-2 mb-4">
                {resource.capacity && (
                  <div className="flex items-center">
                    <svg className="w-4 h-4 mr-2" style={{ color: colors.text.tertiary }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                    <span style={{ color: colors.text.secondary }}>Capacité: {resource.capacity}</span>
                  </div>
                )}
                {resource.location && (
                  <div className="flex items-center">
                    <svg className="w-4 h-4 mr-2" style={{ color: colors.text.tertiary }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    <span style={{ color: colors.text.secondary }}>{resource.location}</span>
                  </div>
                )}
              </div>

              <div className="flex justify-between">
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => handleViewDetails(resource)}
                  style={{ borderColor: colors.border }}
                >
                  Voir détails
                </Button>
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => handleBookResource(resource)}
                  style={{ backgroundColor: colors.primary }}
                  className="text-white"
                >
                  Réserver
                </Button>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {filteredResources.length === 0 && (
        <Card className="mt-8">
          <div className="p-8 text-center">
            <svg
              className="mx-auto h-12 w-12 mb-4"
              style={{ color: colors.text.tertiary }}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
            <h3 className="text-sm font-medium mb-2" style={{ color: colors.text.primary }}>
              Aucune ressource trouvée
            </h3>
            <p className="text-sm" style={{ color: colors.text.secondary }}>
              Essayez de modifier vos filtres de recherche
            </p>
          </div>
        </Card>
      )}

      <ResourceBookingModal
        isOpen={isBookingModalOpen}
        onClose={() => setIsBookingModalOpen(false)}
        resource={selectedResource}
      />
    </div>
  );
}