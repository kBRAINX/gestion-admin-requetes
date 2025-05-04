'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useResources } from '@/hooks/useResources';
import Card from '@/components/common/Card';
import Button from '@/components/common/Button';
import ResourceCalendar from '@/components/dashboard/ResourceCalendar';
import ResourceBookingModal from '@/components/modals/ResourceBookingModal';

export default function ResourceDetailPage({ params }) {
  const router = useRouter();
  const { getResource, loading } = useResources();
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
        bg: 'bg-green-100',
        text: 'text-green-800',
        label: 'Disponible'
      },
      reserved: {
        bg: 'bg-yellow-100',
        text: 'text-yellow-800',
        label: 'Partiellement réservé'
      },
      maintenance: {
        bg: 'bg-red-100',
        text: 'text-red-800',
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
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-6 bg-gray-50">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <Button
            variant="primary"
            onClick={() => router.back()}
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
                    <h1 className="text-2xl font-bold text-gray-900">
                      {resource.name}
                    </h1>
                    <p className="text-sm text-gray-500 mt-1">
                      Code: {resource.code}
                    </p>
                  </div>
                  {getStatusBadge(resource.status)}
                </div>

                <p className="text-gray-600 mb-6">
                  {resource.description || 'Aucune description disponible'}
                </p>

                <div className="space-y-4 mb-6">
                  {resource.category && (
                    <div>
                      <label className="text-sm font-medium text-gray-500">
                        Catégorie
                      </label>
                      <p className="text-gray-900">
                        {resource.category}
                      </p>
                    </div>
                  )}

                  {resource.capacity && (
                    <div>
                      <label className="text-sm font-medium text-gray-500">
                        Capacité
                      </label>
                      <p className="text-gray-900">
                        {resource.capacity} personnes
                      </p>
                    </div>
                  )}

                  {resource.location && (
                    <div>
                      <label className="text-sm font-medium text-gray-500">
                        Localisation
                      </label>
                      <p className="text-gray-900">
                        {resource.location}
                      </p>
                    </div>
                  )}

                  {resource.features && resource.features.length > 0 && (
                    <div>
                      <label className="text-sm font-medium text-gray-500 mb-2 block">
                        Équipements
                      </label>
                      <div className="flex flex-wrap gap-2">
                        {resource.features.map((feature, index) => (
                          <span
                            key={index}
                            className="px-2 py-1 rounded-md text-sm bg-gray-100 text-gray-800"
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
                    className="w-full bg-blue-600 text-white"
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
                <h3 className="text-sm font-medium text-gray-900 mb-4">
                  Instructions de réservation
                </h3>
                <ul className="space-y-2 text-sm text-gray-600">
                  <li className="flex items-start">
                    <svg className="w-4 h-4 mr-2 mt-0.5 flex-shrink-0 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    <span>Sélectionnez une date et un créneau disponible</span>
                  </li>
                  <li className="flex items-start">
                    <svg className="w-4 h-4 mr-2 mt-0.5 flex-shrink-0 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    <span>Remplissez les informations requises</span>
                  </li>
                  <li className="flex items-start">
                    <svg className="w-4 h-4 mr-2 mt-0.5 flex-shrink-0 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
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
                <h2 className="text-lg font-semibold text-gray-900 mb-6">
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