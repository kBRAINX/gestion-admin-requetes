'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import useAuth from '@/hooks/useAuth';
import { useResources } from '@/hooks/useResources';
import { useTheme } from '@/contexts/ThemeContext';
import Button from '@/components/common/Button';
import Card from '@/components/common/Card';
import Table from '@/components/common/Table';
import Modal from '@/components/common/Modal';
import ResourceForm from '@/components/forms/ResourceForm';
import { PERMISSIONS } from '@/lib/auth-permissions';

export default function AdminResourcesPage() {
  const router = useRouter();
  const { user, hasPermission } = useAuth();
  const { resources, loading, createResource, updateResource, deleteResource } = useResources();
  const { colors, isDarkMode } = useTheme();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedResource, setSelectedResource] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  useEffect(() => {
    if (!user) {
      router.push('/login');
      return;
    }

    if (!hasPermission(PERMISSIONS.MANAGE_RESOURCES)) {
      router.push('/dashboard');
    }
  }, [user, hasPermission, router]);

  const categories = [
    { value: 'all', label: 'Toutes les catégories' },
    { value: 'salle', label: 'Salles' },
    { value: 'materiel', label: 'Matériel' },
    { value: 'vehicule', label: 'Véhicules' },
    { value: 'equipement', label: 'Équipements' },
  ];

  const columns = [
    {
      key: 'name',
      header: 'Nom',
      render: (resource) => (
        <div className="flex items-center space-x-3">
          <div>
            <div className="font-medium" style={{ color: colors.text.primary }}>
              {resource.name}
            </div>
            <div className="text-sm" style={{ color: colors.text.tertiary }}>
              {resource.code}
            </div>
          </div>
        </div>
      ),
    },
    {
      key: 'category',
      header: 'Catégorie',
      render: (resource) => (
        <span
          className="px-2 py-1 rounded-full text-xs font-medium"
          style={{
            backgroundColor: isDarkMode ? 'rgba(59, 130, 246, 0.2)' : 'rgba(59, 130, 246, 0.1)',
            color: colors.primary,
          }}
        >
          {getCategoryLabel(resource.category)}
        </span>
      ),
    },
    {
      key: 'capacity',
      header: 'Capacité',
      render: (resource) => (
        <div style={{ color: colors.text.primary }}>
          {resource.capacity || '-'}
        </div>
      ),
    },
    {
      key: 'location',
      header: 'Localisation',
      render: (resource) => (
        <div style={{ color: colors.text.secondary }}>
          {resource.location || '-'}
        </div>
      ),
    },
    {
      key: 'status',
      header: 'Statut',
      render: (resource) => (
        <span
          className={`px-2 py-1 rounded-full text-xs font-medium ${
            resource.status === 'available'
              ? 'bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-100'
              : resource.status === 'maintenance'
              ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-800 dark:text-yellow-100'
              : 'bg-red-100 text-red-800 dark:bg-red-800 dark:text-red-100'
          }`}
        >
          {getStatusLabel(resource.status)}
        </span>
      ),
    },
    {
      key: 'actions',
      header: 'Actions',
      render: (resource) => (
        <div className="flex space-x-2">
          <Button
            variant="secondary"
            size="sm"
            onClick={() => router.push(`/resources/${resource.id}`)}
            style={{ borderColor: colors.border }}
          >
            Voir
          </Button>
          <Button
            variant="secondary"
            size="sm"
            onClick={() => handleEdit(resource)}
            style={{ borderColor: colors.border }}
          >
            Modifier
          </Button>
          <Button
            variant="danger"
            size="sm"
            onClick={() => handleDelete(resource.id)}
          >
            Supprimer
          </Button>
        </div>
      ),
    },
  ];

  const getCategoryLabel = (category) => {
    const option = categories.find(cat => cat.value === category);
    return option ? option.label : category;
  };

  const getStatusLabel = (status) => {
    const statusLabels = {
      available: 'Disponible',
      reserved: 'Réservé',
      maintenance: 'Maintenance',
      unavailable: 'Indisponible',
    };
    return statusLabels[status] || status;
  };

  const filteredResources = resources.filter(resource => {
    const matchesSearch = resource.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          resource.code?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || resource.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const handleEdit = (resource) => {
    setSelectedResource(resource);
    setIsModalOpen(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer cette ressource ?')) {
      await deleteResource(id);
    }
  };

  const handleSubmit = async (data) => {
    if (selectedResource) {
      await updateResource(selectedResource.id, data);
    } else {
      await createResource(data);
    }
    setIsModalOpen(false);
    setSelectedResource(null);
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
          Gestion des Ressources
        </h1>
        <Button
          onClick={() => {
            setSelectedResource(null);
            setIsModalOpen(true);
          }}
          style={{ backgroundColor: colors.primary }}
          className="text-white"
        >
          Nouvelle Ressource
        </Button>
      </div>

      <Card className="mb-6">
        <div className="p-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
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

          <Table
            columns={columns}
            data={filteredResources}
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
          setSelectedResource(null);
        }}
        title={selectedResource ? "Modifier la ressource" : "Créer une ressource"}
      >
        <ResourceForm
          initialData={selectedResource}
          onSubmit={handleSubmit}
          onCancel={() => {
            setIsModalOpen(false);
            setSelectedResource(null);
          }}
        />
      </Modal>
    </div>
  );
}