'use client';

import { useState, useEffect } from 'react';
import useAuth from '@/hooks/useAuth';
import { useRequests } from '@/hooks/useRequests';
import Modal from '@/components/common/Modal';
import Button from '@/components/common/Button';
import Input from '@/components/common/Input';

export default function ResourceBookingModal({
  isOpen,
  onClose,
  resource,
  selectedTimeSlot = null,
}) {
  const { user } = useAuth();
  const { createRequest } = useRequests();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    purpose: '',
    attendees: '',
    notes: '',
  });

  useEffect(() => {
    if (selectedTimeSlot) {
      // Mettre à jour le formulaire avec les informations du créneau sélectionné
      // dans le cas ou l'utilisateur a cliqué sur un créneau spécifique
    }
  }, [selectedTimeSlot]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const formatDateTime = (date) => {
    return new Date(date).toLocaleString('fr-FR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.purpose || !formData.attendees) {
      setError('Veuillez remplir tous les champs requis');
      return;
    }

    setLoading(true);
    setError('');

    try {
      await createRequest({
        type: `Réservation de ${resource.name}`,
        category: 'ressources',
        resourceId: resource.id,
        resourceName: resource.name,
        startTime: selectedTimeSlot?.start || new Date(),
        endTime: selectedTimeSlot?.end || new Date(),
        formData: {
          purpose: formData.purpose,
          attendees: formData.attendees,
          notes: formData.notes,
        },
        template: `
          <div class="request-template">
            <div class="header">
              <div class="sender-info">
                <p>${user?.displayName}</p>
                <p>${user?.email}</p>
              </div>
              <div class="recipient-info">
                <p>À la Direction des Ressources</p>
              </div>
            </div>
            <div class="subject">
              <p>OBJET : Demande de réservation de ${resource.name}</p>
            </div>
            <div class="content">
              <p>Madame, Monsieur,</p>
              <p>J'ai l'honneur de venir par la présente solliciter la réservation de la ${resource.name} pour les besoins suivants :</p>
              <p><strong>Motif :</strong> ${formData.purpose}</p>
              <p><strong>Nombre de participants :</strong> ${formData.attendees}</p>
              <p><strong>Date et heure :</strong> ${selectedTimeSlot ? formatDateTime(selectedTimeSlot.start) : ''} - ${selectedTimeSlot ? formatDateTime(selectedTimeSlot.end) : ''}</p>
              ${formData.notes ? `<p><strong>Notes supplémentaires :</strong> ${formData.notes}</p>` : ''}
              <p>Dans l'attente de votre approbation, veuillez agréer, Madame, Monsieur, l'expression de mes salutations distinguées.</p>
            </div>
            <div class="signature">
              <p>${new Date().toLocaleDateString('fr-FR')}</p>
              <p>${user?.displayName}</p>
            </div>
          </div>
        `,
      });

      onClose();
    } catch (err) {
      setError('Erreur lors de la soumission de la demande');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Réserver ${resource?.name}`}
      maxWidth="md"
    >
      <form onSubmit={handleSubmit}>
        {error && (
          <div className="mb-4 p-3 rounded-md bg-red-50 text-red-700">
            {error}
          </div>
        )}

        {selectedTimeSlot && (
          <div className="mb-6 p-4 rounded-lg bg-gray-50">
            <h3 className="text-sm font-medium text-gray-900 mb-2">
              Créneau sélectionné
            </h3>
            <p className="text-sm text-gray-600">
              Début : {formatDateTime(selectedTimeSlot.start)}
            </p>
            <p className="text-sm text-gray-600">
              Fin : {formatDateTime(selectedTimeSlot.end)}
            </p>
          </div>
        )}

        <Input
          label="Motif de la réservation"
          name="purpose"
          value={formData.purpose}
          onChange={handleInputChange}
          placeholder="Ex: Séance de travail de groupe, présentation projet..."
          required
        />

        <Input
          label="Nombre de participants"
          name="attendees"
          type="number"
          value={formData.attendees}
          onChange={handleInputChange}
          min="1"
          max={resource?.capacity}
          required
        />

        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Notes supplémentaires
          </label>
          <textarea
            name="notes"
            value={formData.notes}
            onChange={handleInputChange}
            rows="3"
            className="w-full p-2 rounded-lg border border-gray-300 focus:ring-blue-500 focus:border-blue-500"
            placeholder="Informations complémentaires (optionnel)..."
          />
        </div>

        <div className="flex justify-end space-x-3">
          <Button
            type="button"
            variant="secondary"
            onClick={onClose}
          >
            Annuler
          </Button>
          <Button
            type="submit"
            disabled={loading}
            className="bg-blue-600 text-white"
          >
            {loading ? 'Envoi en cours...' : 'Réserver'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}