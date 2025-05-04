'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import useAuth from '@/hooks/useAuth';
import { useResources } from '@/hooks/useResources';
import { useTheme } from '@/contexts/ThemeContext';
import Card from '@/components/common/Card';
import Button from '@/components/common/Button';
import Modal from '@/components/common/Modal';
import ResourceCalendar from '@/components/dashboard/ResourceCalendar';
import ResourceBookingModal from '@/components/modals/ResourceBookingModal';

export default function ResourceDetailPage({ params }) {
  const router = useRouter();
  const { user } = useAuth();
  const { getResource, loading } = useResources();
  const { colors, isDarkMode } = useTheme();
  const [resource, setResource] = useState(null);
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
  const [selectedTimeSlot, setSelectedTimeSlot] = useState(null);

  useEffect(() => {
    const fetchResource = async () => {
      try {
        const resourceData = await getResource(params.id);
        setResource(resourceData);
      } catch (error) {
        console.error('Error fetching resource:', error);
      }
    };

    if (params.id) {
      fetchResource();
    }
  }, [params.id]);

  const handleTimeSlotClick = (timeSlot) => {
    if (timeSlot.available) {
      setSelectedTimeSlot(timeSlot);
      setIsBookingModalOpen(true);
    }
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      available: {
        bg: 'bg-green-100 dark:bg-green-800',
        text: 'text-green-800 dark:text-green-100',
        label: 'Disponible'
      },
      reserved: {
        bg: 'bg-yellow-100 dark:bg-yellow-800',
        text: 'text-yellow-800 dark:text-yellow-100',
        label: 'Partiellement réservé'
      },
      maintenance: {
        bg: 'bg-red-100 dark:bg-red-800',
        text: 'text-red-800 dark:text-red-100',
        label: 'Maintenance'
      }
    };

    const config = statusConfig[status] || statusConfig.available;
    return (
      <span className={`px-3 py-1 rounded-full text-sm font-medium ${config.bg} ${config.text}`}>
        {config.label}
      </span>
    );
  };

  if (loading || !resource) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: colors.background.primary }}>
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-6" style={{ backgroundColor: colors.background.secondary }}>
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <Button
            variant="secondary"
            onClick={() => router.back()}
            style={{ borderColor: colors.border }}
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Retour
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Resource Info */}
          <div className="lg:col-span-1">
            <Card>
              <div className="p-6">
                {resource.imageUrl && (
                  <div className="mb-6">
                    <img
                      src={resource.imageUrl}
                      alt={resource.name}
                      className="w-full h-64 object-cover rounded-lg"
                    />
                  </div>
                )}

                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h1 className="text-2xl font-bold" style={{ color: colors.text.primary }}>
                      {resource.name}
                    </h1>
                    <p className="text-sm mt-1" style={{ color: colors.text.tertiary }}>
                      Code: {resource.code}
                    </p>
                  </div>
                  {getStatusBadge(resource.status)}
                </div>

                <p className="mb-6" style={{ color: colors.text.secondary }}>
                  {resource.description || 'Aucune description disponible'}
                </p>

                <div className="space-y-4 mb-6">
                  {resource.category && (
                    <div>
                      <label className="text-sm font-medium" style={{ color: colors.text.tertiary }}>
                        Catégorie
                      </label>
                      <p style={{ color: colors.text.primary }}>
                        {resource.category}
                      </p>
                    </div>
                  )}

                  {resource.capacity && (
                    <div>
                      <label className="text-sm font-medium" style={{ color: colors.text.tertiary }}>
                        Capacité
                      </label>
                      <p style={{ color: colors.text.primary }}>
                        {resource.capacity} personnes
                      </p>
                    </div>
                  )}

                  {resource.location && (
                    <div>
                      <label className="text-sm font-medium" style={{ color: colors.text.tertiary }}>
                        Localisation
                      </label>
                      <p style={{ color: colors.text.primary }}>
                        {resource.location}
                      </p>
                    </div>
                  )}

                  {resource.features && resource.features.length > 0 && (
                    <div>
                      <label className="text-sm font-medium mb-2 block" style={{ color: colors.text.tertiary }}>
                        Équipements
                      </label>
                      <div className="flex flex-wrap gap-2">
                        {resource.features.map((feature, index) => (
                          <span
                            key={index}
                            className="px-2 py-1 rounded-md text-sm"
                            style={{
                              backgroundColor: isDarkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)',
                              color: colors.text.primary
                            }}
                          >
                            {feature}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {resource.status === 'available' && (
                  <Button
                    className="w-full"
                    style={{ backgroundColor: colors.primary }}
                    onClick={() => setIsBookingModalOpen(true)}
                  >
                    Faire une réservation
                  </Button>
                )}
              </div>
            </Card>

            {/* Booking Instructions */}
            <Card className="mt-6">
              <div className="p-6">
                <h3 className="text-sm font-medium mb-4" style={{ color: colors.text.primary }}>
                  Instructions de réservation
                </h3>
                <ul className="space-y-2 text-sm" style={{ color: colors.text.secondary }}>
                  <li className="flex items-start">
                    <svg className="w-4 h-4 mr-2 mt-0.5 flex-shrink-0" style={{ color: colors.primary }} fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    <span>Sélectionnez une date et un créneau disponible</span>
                  </li>
                  <li className="flex items-start">
                    <svg className="w-4 h-4 mr-2 mt-0.5 flex-shrink-0" style={{ color: colors.primary }} fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    <span>Remplissez les informations requises</span>
                  </li>
                  <li className="flex items-start">
                    <svg className="w-4 h-4 mr-2 mt-0.5 flex-shrink-0" style={{ color: colors.primary }} fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    <span>Attendez la confirmation par email</span>
                  </li>
                </ul>
              </div>
            </Card>
          </div>

          {/* Calendar */}
          <div className="lg:col-span-2">
            <Card>
              <div className="p-6">
                <h2 className="text-lg font-semibold mb-6" style={{ color: colors.text.primary }}>
                  Disponibilités
                </h2>
                <ResourceCalendar
                  resource={resource}
                  onTimeSlotClick={handleTimeSlotClick}
                />
              </div>
            </Card>
          </div>
        </div>

        {/* Booking Modal */}
        <ResourceBookingModal
          isOpen={isBookingModalOpen}
          onClose={() => {
            setIsBookingModalOpen(false);
            setSelectedTimeSlot(null);
          }}
          resource={resource}
          selectedTimeSlot={selectedTimeSlot}
        />
      </div>
    </div>
  );
}