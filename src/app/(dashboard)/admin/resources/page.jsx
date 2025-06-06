'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import useAuth from '@/hooks/useAuth';
import { useResources } from '@/hooks/useResources';
import { PERMISSIONS } from '@/lib/auth-permissions';
import Button from '@/components/common/Button';
import Card from '@/components/common/Card';
import Table from '@/components/common/Table';
import Modal from '@/components/common/Modal';
import ResourceForm from '@/components/forms/ResourceForm';

export default function AdminResourcesPage() {
  const router = useRouter();
  const { user, hasPermission } = useAuth();
  const { resources, loading, createResource, updateResource, deleteResource } = useResources();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedResource, setSelectedResource] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  useEffect(() => {
    if (!user) {
      router.push('/login');
      return;
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
      header: 'Ressource',
      render: (resource) => (
        <div className="flex items-center">
          <div className="h-10 w-10 flex-shrink-0">
            <div className="h-10 w-10 rounded-full bg-blue-600 flex items-center justify-center">
              <span className="text-white font-medium">
                {resource.name?.[0]?.toUpperCase()}
              </span>
            </div>
          </div>
          <div className="ml-4">
            <div className="text-sm font-medium text-gray-900">{resource.name}</div>
            <div className="text-sm text-gray-500">{resource.code}</div>
          </div>
        </div>
      ),
    },
    {
      key: 'category',
      header: 'Catégorie',
      render: (resource) => (
        <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
          {getCategoryLabel(resource.category)}
        </span>
      ),
    },
    {
      key: 'capacity',
      header: 'Capacité',
      render: (resource) => (
        <div className="text-sm text-gray-900">
          {resource.capacity || '-'}
        </div>
      ),
    },
    {
      key: 'location',
      header: 'Localisation',
      render: (resource) => (
        <div className="text-sm text-gray-500">
          {resource.location || '-'}
        </div>
      ),
    },
    {
      key: 'status',
      header: 'Statut',
      render: (resource) => (
        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
          resource.status === 'available'
            ? 'bg-green-100 text-green-800'
            : resource.status === 'maintenance'
            ? 'bg-yellow-100 text-yellow-800'
            : 'bg-red-100 text-red-800'
        }`}>
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
            className="border-gray-300 text-gray-700 hover:bg-gray-50"
          >
            Voir
          </Button>
          <Button
            variant="secondary"
            size="sm"
            onClick={() => handleEdit(resource)}
            className="border-blue-600 text-blue-600 hover:bg-blue-50"
          >
            Modifier
          </Button>
          <Button
            variant="secondary"
            size="sm"
            onClick={() => handleDelete(resource.id)}
            className="border-red-600 text-red-600 hover:bg-red-50"
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
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
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
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Gestion des Ressources
            </h1>
            <p className="mt-1 text-sm text-gray-500">
              Gérez l'inventaire de vos ressources
            </p>
          </div>
          <Button
            onClick={() => {
              setSelectedResource(null);
              setIsModalOpen(true);
            }}
            className="bg-blue-600 text-white font-medium px-6 py-2.5 rounded-lg hover:bg-blue-700 transition-colors inline-flex items-center"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            Nouvelle Ressource
          </Button>
        </div>

        {/* Stats Card */}
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-4 mb-8">
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <svg className="h-6 w-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                  </svg>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      Total Ressources
                    </dt>
                    <dd className="text-xl font-semibold text-gray-900">
                      {resources.length}
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <svg className="h-6 w-6 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      Disponibles
                    </dt>
                    <dd className="text-xl font-semibold text-gray-900">
                      {resources.filter(r => r.status === 'available').length}
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <svg className="h-6 w-6 text-yellow-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      Maintenance
                    </dt>
                    <dd className="text-xl font-semibold text-gray-900">
                      {resources.filter(r => r.status === 'maintenance').length}
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <svg className="h-6 w-6 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      Réservées
                    </dt>
                    <dd className="text-xl font-semibold text-gray-900">
                      {resources.filter(r => r.status === 'reserved').length}
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Table Card */}
        <Card className="shadow-lg">
          <div className="p-6">
            {/* Filters */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Rechercher
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                  </div>
                  <input
                    type="text"
                    placeholder="Nom ou code de la ressource..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Catégorie
                </label>
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="block w-full pl-3 pr-10 py-2 text-base border border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
                >
                  {categories.map(category => (
                    <option key={category.value} value={category.value}>
                      {category.label}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1 invisible">
                  Actions
                </label>
                <Button
                  onClick={() => {
                    setSearchTerm('');
                    setSelectedCategory('all');
                  }}
                  className="w-full bg-gray-100 text-gray-700 border border-gray-300 hover:bg-gray-200 px-4 py-2 rounded-md"
                >
                  Réinitialiser filtres
                </Button>
              </div>
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
              <Table
                columns={columns}
                data={filteredResources}
                currentPage={1}
                totalPages={1}
                onPageChange={() => {}}
              />
            </div>
          </div>
        </Card>

        {/* Modal */}
        <Modal
          isOpen={isModalOpen}
          onClose={() => {
            setIsModalOpen(false);
            setSelectedResource(null);
          }}
          title={selectedResource ? "Modifier la ressource" : "Créer une ressource"}
          maxWidth="lg"
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
    </div>
  );
}