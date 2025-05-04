'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import useAuth from '@/hooks/useAuth';
import { db } from '@/lib/firebase';
import { collection, onSnapshot, addDoc, updateDoc, deleteDoc, doc, getDocs } from 'firebase/firestore';
import { PERMISSIONS } from '@/lib/auth-permissions';
import Button from '@/components/common/Button';
import Card from '@/components/common/Card';
import Table from '@/components/common/Table';
import Modal from '@/components/common/Modal';
import RequestTypeForm from '@/components/forms/RequestTypeForm';

export default function AdminRequestTypesPage() {
  const router = useRouter();
  const { user, hasPermission } = useAuth();
  const [requestTypes, setRequestTypes] = useState([]);
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedRequestType, setSelectedRequestType] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  useEffect(() => {
    if (!user) {
      router.push('/login');
      return;
    }

    // Fetch services
    const fetchServices = async () => {
      const servicesRef = collection(db, 'services');
      const servicesSnapshot = await getDocs(servicesRef);
      const servicesList = servicesSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setServices(servicesList);
    };

    fetchServices();

    // Listen to request types
    const unsubscribe = onSnapshot(collection(db, 'requestTypes'), (snapshot) => {
      const types = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setRequestTypes(types);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [user, router]);

  const categories = [
    { value: 'all', label: 'Toutes les catégories' },
    { value: 'scolarite', label: 'Scolarité' },
    { value: 'administrative', label: 'Administrative' },
    { value: 'ressources', label: 'Ressources' },
    { value: 'maintenance', label: 'Maintenance' },
    { value: 'professor', label: 'Professeur' },
  ];

  const columns = [
    {
      key: 'title',
      header: 'Type de requête',
      render: (type) => (
        <div className="flex items-center">
          <div className="h-10 w-10 flex-shrink-0">
            <div className="h-10 w-10 rounded-full bg-blue-600 flex items-center justify-center">
              <span className="text-white font-medium">
                {type.title?.[0]?.toUpperCase()}
              </span>
            </div>
          </div>
          <div className="ml-4">
            <div className="text-sm font-medium text-gray-900">{type.title}</div>
            <div className="text-sm text-gray-500">{type.category}</div>
          </div>
        </div>
      ),
    },
    {
      key: 'description',
      header: 'Description',
      render: (type) => (
        <div className="text-sm text-gray-500 max-w-xs truncate">
          {type.description}
        </div>
      ),
    },
    {
      key: 'services',
      header: 'Services impliqués',
      render: (type) => (
        <div className="flex -space-x-1">
          {type.destinationServices?.slice(0, 3).map((serviceId, index) => {
            const service = services.find(s => s.id === serviceId);
            return service ? (
              <div
                key={serviceId}
                className="inline-flex items-center justify-center h-6 w-6 rounded-full bg-blue-500 text-white text-xs font-medium ring-2 ring-white"
                title={service.name}
              >
                {service.name[0]}
              </div>
            ) : null;
          })}
          {type.destinationServices?.length > 3 && (
            <div className="inline-flex items-center justify-center h-6 w-6 rounded-full bg-gray-200 text-gray-600 text-xs font-medium ring-2 ring-white">
              +{type.destinationServices.length - 3}
            </div>
          )}
        </div>
      ),
    },
    {
      key: 'estimatedProcessTime',
      header: 'Temps estimé',
      render: (type) => (
        <div className="text-sm text-gray-900">
          {type.estimatedProcessTime} jours
        </div>
      ),
    },
    {
      key: 'status',
      header: 'Statut',
      render: (type) => (
        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
          type.isActive
            ? 'bg-green-100 text-green-800'
            : 'bg-red-100 text-red-800'
        }`}>
          {type.isActive ? 'Actif' : 'Inactif'}
        </span>
      ),
    },
    {
      key: 'actions',
      header: 'Actions',
      render: (type) => (
        <div className="flex space-x-2">
          <Button
            variant="secondary"
            size="sm"
            onClick={() => handleEdit(type)}
            className="border-blue-600 text-blue-600 hover:bg-blue-50"
          >
            Modifier
          </Button>
          <Button
            variant="secondary"
            size="sm"
            onClick={() => handleDelete(type.id)}
            className="border-red-600 text-red-600 hover:bg-red-50"
          >
            Supprimer
          </Button>
        </div>
      ),
    },
  ];

  const filteredRequestTypes = requestTypes.filter(type => {
    const matchesSearch = type.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          type.description?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || type.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const handleEdit = (type) => {
    setSelectedRequestType(type);
    setIsModalOpen(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer ce type de requête ?')) {
      await deleteDoc(doc(db, 'requestTypes', id));
    }
  };

  const handleSubmit = async (data) => {
    if (selectedRequestType) {
      await updateDoc(doc(db, 'requestTypes', selectedRequestType.id), {
        ...data,
        updatedAt: new Date(),
      });
    } else {
      await addDoc(collection(db, 'requestTypes'), {
        ...data,
        createdAt: new Date(),
        updatedAt: new Date(),
      });
    }
    setIsModalOpen(false);
    setSelectedRequestType(null);
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
              Types de Requêtes
            </h1>
            <p className="mt-1 text-sm text-gray-500">
              Configurez les types de demandes possibles
            </p>
          </div>
          <Button
            onClick={() => {
              setSelectedRequestType(null);
              setIsModalOpen(true);
            }}
            className="bg-blue-600 text-white font-medium px-6 py-2.5 rounded-lg hover:bg-blue-700 transition-colors inline-flex items-center"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            Nouveau Type
          </Button>
        </div>

        {/* Stats Card */}
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-4 mb-8">
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <svg className="h-6 w-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      Total Types
                    </dt>
                    <dd className="text-xl font-semibold text-gray-900">
                      {requestTypes.length}
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
                      Types Actifs
                    </dt>
                    <dd className="text-xl font-semibold text-gray-900">
                      {requestTypes.filter(t => t.isActive).length}
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
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      Temps Moyen
                    </dt>
                    <dd className="text-xl font-semibold text-gray-900">
                      {requestTypes.length > 0
                        ? Math.round(requestTypes.reduce((acc, curr) => acc + curr.estimatedProcessTime, 0) / requestTypes.length)
                        : 0} jours
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
                  <svg className="h-6 w-6 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                  </svg>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      Catégories
                    </dt>
                    <dd className="text-xl font-semibold text-gray-900">
                      {categories.length - 1}
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
                    placeholder="Titre ou description..."
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
                data={filteredRequestTypes}
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
            setSelectedRequestType(null);
          }}
          title={selectedRequestType ? "Modifier le type de requête" : "Créer un type de requête"}
          maxWidth="lg"
        >
          <RequestTypeForm
            initialData={selectedRequestType}
            services={services}
            onSubmit={handleSubmit}
            onCancel={() => {
              setIsModalOpen(false);
              setSelectedRequestType(null);
            }}
          />
        </Modal>
      </div>
    </div>
  );
}