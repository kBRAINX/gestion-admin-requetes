'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import useAuth from '@/hooks/useAuth';
import { useServices } from '@/hooks/useServices';
import { useTheme } from '@/contexts/ThemeContext';
import Button from '@/components/common/Button';
import Card from '@/components/common/Card';
import Table from '@/components/common/Table';
import Modal from '@/components/common/Modal';
import ServiceForm from '@/components/forms/ServiceForm';
import { PERMISSIONS } from '@/lib/auth-permissions';

export default function AdminServicesPage() {
  const router = useRouter();
  const { user, hasPermission } = useAuth();
  const { services, loading, createService, updateService, deleteService } = useServices();
  const { colors, isDarkMode } = useTheme();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedService, setSelectedService] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    if (!user) {
      router.push('/login');
      return;
    }

    if (!hasPermission(PERMISSIONS.MANAGE_SERVICES)) {
      router.push('/dashboard');
    }
  }, [user, hasPermission, router]);

  const columns = [
    {
      key: 'name',
      header: 'Nom du service',
      render: (service) => (
        <div className="font-medium" style={{ color: colors.text.primary }}>
          {service.name}
        </div>
      ),
    },
    {
      key: 'description',
      header: 'Description',
      render: (service) => (
        <div style={{ color: colors.text.secondary }}>
          {service.description}
        </div>
      ),
    },
    {
      key: 'head',
      header: 'Responsable',
      render: (service) => (
        <div style={{ color: colors.text.primary }}>
          {service.headName || 'Non assigné'}
        </div>
      ),
    },
    {
      key: 'members',
      header: 'Membres',
      render: (service) => (
        <div style={{ color: colors.text.primary }}>
          {service.members?.length || 0}
        </div>
      ),
    },
    {
      key: 'status',
      header: 'Statut',
      render: (service) => (
        <span
          className={`px-2 py-1 rounded-full text-xs font-medium ${
            service.isActive
              ? 'bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-100'
              : 'bg-red-100 text-red-800 dark:bg-red-800 dark:text-red-100'
          }`}
        >
          {service.isActive ? 'Actif' : 'Inactif'}
        </span>
      ),
    },
    {
      key: 'actions',
      header: 'Actions',
      render: (service) => (
        <div className="flex space-x-2">
          <Button
            variant="secondary"
            size="sm"
            onClick={() => handleEdit(service)}
            style={{ borderColor: colors.border }}
          >
            Modifier
          </Button>
          <Button
            variant="danger"
            size="sm"
            onClick={() => handleDelete(service.id)}
          >
            Supprimer
          </Button>
        </div>
      ),
    },
  ];

  const filteredServices = services.filter(service =>
    service.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    service.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleEdit = (service) => {
    setSelectedService(service);
    setIsModalOpen(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer ce service ?')) {
      await deleteService(id);
    }
  };

  const handleSubmit = async (data) => {
    if (selectedService) {
      await updateService(selectedService.id, data);
    } else {
      await createService(data);
    }
    setIsModalOpen(false);
    setSelectedService(null);
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
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold" style={{ color: colors.text.primary }}>
          Gestion des Services
        </h1>
        <Button
          onClick={() => {
            setSelectedService(null);
            setIsModalOpen(true);
          }}
          style={{ backgroundColor: colors.primary }}
          className="text-white"
        >
          Nouveau Service
        </Button>
      </div>

      <Card className="mb-6">
        <div className="p-4">
          <div className="mb-4">
            <input
              type="text"
              placeholder="Rechercher un service..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full p-2 rounded border"
              style={{
                backgroundColor: colors.background.primary,
                borderColor: colors.border,
                color: colors.text.primary,
              }}
              autoFocus
            />
          </div>

          <Table
            columns={columns}
            data={filteredServices}
            currentPage={1}
            totalPages={1}
            onPageChange={() => {}}
          />
        </div>
      </Card>

      <Modal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedService(null);
        }}
        title={selectedService ? "Modifier le service" : "Créer un service"}
      >
        <ServiceForm
          initialData={selectedService}
          onSubmit={handleSubmit}
          onCancel={() => {
            setIsModalOpen(false);
            setSelectedService(null);
          }}
        />
      </Modal>
    </div>
  );
}