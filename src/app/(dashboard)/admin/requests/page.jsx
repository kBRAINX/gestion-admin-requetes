'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import useAuth from '@/hooks/useAuth';
import { useRequests } from '@/hooks/useRequests';
import { db } from '@/lib/firebase';
import { collection, query, getDocs } from 'firebase/firestore';
import { PERMISSIONS } from '@/lib/auth-permissions';
import Card from '@/components/common/Card';
import Table from '@/components/common/Table';
import RequestDetailModal from '@/components/modals/RequestDetailModal';
import Tabs from '@/components/common/Tabs';

export default function AdminRequestsPage() {
  const router = useRouter();
  const { user, hasPermission } = useAuth();
  const { requests, loading, processRequest } = useRequests();
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [currentTab, setCurrentTab] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [services, setServices] = useState([]);

  useEffect(() => {
    if (!user) {
      router.push('/login');
      return;
    }

    if (!hasPermission(PERMISSIONS.VIEW_ALL_REQUESTS)) {
      router.push('/unauthorized');
      return;
    }

    fetchServices();
  }, [user, hasPermission, router]);

  const fetchServices = async () => {
    const servicesRef = collection(db, 'services');
    const servicesSnapshot = await getDocs(servicesRef);
    const servicesList = servicesSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    setServices(servicesList);
  };

  const tabs = [
    { id: 'all', label: 'Toutes', count: requests.length },
    { id: 'pending', label: 'En attente', count: requests.filter(r => r.status === 'pending').length },
    { id: 'in_progress', label: 'En cours', count: requests.filter(r => r.status === 'in_progress').length },
    { id: 'approved', label: 'Approuvées', count: requests.filter(r => r.status === 'approved').length },
    { id: 'rejected', label: 'Rejetées', count: requests.filter(r => r.status === 'rejected').length },
  ];

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
      key: 'id',
      header: 'ID',
      render: (request) => (
        <div className="font-mono text-sm text-gray-600">
          #{request.id.slice(0, 8)}
        </div>
      ),
    },
    {
      key: 'type',
      header: 'Type',
      render: (request) => (
        <div className="text-sm font-medium text-gray-900">
          {request.type}
        </div>
      ),
    },
    {
      key: 'user',
      header: 'Demandeur',
      render: (request) => (
        <div>
          <div className="text-sm font-medium text-gray-900">
            {request.userName}
          </div>
          <div className="text-sm text-gray-500">
            {request.userEmail}
          </div>
        </div>
      ),
    },
    {
      key: 'status',
      header: 'Statut',
      render: (request) => (
        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
          request.status === 'approved'
            ? 'bg-green-100 text-green-800'
            : request.status === 'pending'
            ? 'bg-yellow-100 text-yellow-800'
            : request.status === 'rejected'
            ? 'bg-red-100 text-red-800'
            : 'bg-blue-100 text-blue-800'
        }`}>
          {getStatusLabel(request.status)}
        </span>
      ),
    },
    {
      key: 'currentService',
      header: 'Service actuel',
      render: (request) => {
        const currentService = services.find(s => s.id === request.currentServiceId);
        return currentService ? currentService.name : '-';
      },
    },
    {
      key: 'priority',
      header: 'Priorité',
      render: (request) => (
        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
          request.priority === 'high'
            ? 'bg-red-100 text-red-800'
            : request.priority === 'medium'
            ? 'bg-yellow-100 text-yellow-800'
            : 'bg-gray-100 text-gray-800'
        }`}>
          {getPriorityLabel(request.priority)}
        </span>
      ),
    },
    {
      key: 'date',
      header: 'Date',
      render: (request) => (
        <div className="text-sm text-gray-500">
          {new Date(request.createdAt).toLocaleDateString('fr-FR')}
        </div>
      ),
    },
    {
      key: 'actions',
      header: 'Actions',
      render: (request) => (
        <div className="flex space-x-2">
          <Button
            variant="secondary"
            size="sm"
            onClick={() => handleViewDetails(request)}
          >
            Détails
          </Button>
          {currentTab === 'pending' && hasPermission(PERMISSIONS.APPROVE_REQUESTS) && (
            <>
              <Button
                variant="primary"
                size="sm"
                onClick={() => handleApprove(request.id)}
                className="bg-green-600 text-white"
              >
                Approuver
              </Button>
              <Button
                variant="danger"
                size="sm"
                onClick={() => handleReject(request.id)}
              >
                Rejeter
              </Button>
            </>
          )}
        </div>
      ),
    },
  ];

  const getStatusLabel = (status) => {
    const statusLabels = {
      pending: 'En attente',
      in_progress: 'En cours',
      approved: 'Approuvée',
      rejected: 'Rejetée',
    };
    return statusLabels[status] || status;
  };

  const getPriorityLabel = (priority) => {
    const priorityLabels = {
      high: 'Haute',
      medium: 'Moyenne',
      low: 'Basse',
    };
    return priorityLabels[priority] || priority;
  };

  const filteredRequests = requests.filter(request => {
    const matchesTab = currentTab === 'all' || request.status === currentTab;
    const matchesSearch = request.type?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          request.userName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          request.userEmail?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || request.category === selectedCategory;
    return matchesTab && matchesSearch && matchesCategory;
  });

  const handleViewDetails = (request) => {
    setSelectedRequest(request);
    setIsDetailModalOpen(true);
  };

  const handleApprove = async (requestId) => {
    if (window.confirm('Êtes-vous sûr de vouloir approuver cette requête ?')) {
      await processRequest(requestId, 'approve');
    }
  };

  const handleReject = async (requestId) => {
    const reason = window.prompt('Raison du rejet (optionnel):');
    await processRequest(requestId, 'reject', reason);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">
        Gestion des Requêtes
      </h1>

      <Tabs
        tabs={tabs}
        activeTab={currentTab}
        onChange={setCurrentTab}
      />

      <Card>
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <input
              type="text"
              placeholder="Rechercher une requête..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
            />
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
            >
              {categories.map(category => (
                <option key={category.value} value={category.value}>
                  {category.label}
                </option>
              ))}
            </select>
          </div>

          <Table
            columns={columns}
            data={filteredRequests}
            currentPage={1}
            totalPages={1}
            onPageChange={() => {}}
          />
        </div>
      </Card>

      <RequestDetailModal
        isOpen={isDetailModalOpen}
        onClose={() => setIsDetailModalOpen(false)}
        request={selectedRequest}
      />
    </div>
  );
}