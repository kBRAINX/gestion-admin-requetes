'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import useAuth from '@/hooks/useAuth';
import { useRequests } from '@/hooks/useRequests';
import { useTheme } from '@/contexts/ThemeContext';
import Card from '@/components/common/Card';
import Table from '@/components/common/Table';
import Modal from '@/components/common/Modal';
import RequestDetailModal from '@/components/modals/RequestDetailModal';
import Button from '@/components/common/Button';
import Select from '@/components/common/Select';
import Tabs from '@/components/common/Tabs';
import { PERMISSIONS } from '@/lib/auth-permissions';

export default function AdminRequestsPage() {
  const router = useRouter();
  const { user, hasPermission } = useAuth();
  const { requests, loading, processRequest } = useRequests();
  const { colors, isDarkMode } = useTheme();
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [currentTab, setCurrentTab] = useState('pending');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  useEffect(() => {
    if (!user) {
      router.push('/login');
      return;
    }

    if (!hasPermission(PERMISSIONS.VIEW_ALL_REQUESTS)) {
      router.push('/dashboard');
    }
  }, [user, hasPermission, router]);

  const tabs = [
    { id: 'pending', label: 'En attente', count: requests.filter(r => r.status === 'pending').length },
    { id: 'in_progress', label: 'En cours', count: requests.filter(r => r.status === 'in_progress').length },
    { id: 'approved', label: 'Approuvées', count: requests.filter(r => r.status === 'approved').length },
    { id: 'rejected', label: 'Rejetées', count: requests.filter(r => r.status === 'rejected').length },
  ];

  const categories = [
    { value: 'all', label: 'Toutes les catégories' },
    { value: 'resources', label: 'Ressources' },
    { value: 'administrative', label: 'Administrative' },
    { value: 'maintenance', label: 'Maintenance' },
    { value: 'professor', label: 'Professeur' },
  ];

  const columns = [
    {
      key: 'id',
      header: 'ID',
      render: (request) => (
        <div className="font-mono text-sm" style={{ color: colors.text.secondary }}>
          #{request.id.slice(0, 8)}
        </div>
      ),
    },
    {
      key: 'type',
      header: 'Type',
      render: (request) => (
        <div style={{ color: colors.text.primary }}>
          {request.type}
        </div>
      ),
    },
    {
      key: 'user',
      header: 'Demandeur',
      render: (request) => (
        <div>
          <div className="font-medium" style={{ color: colors.text.primary }}>
            {request.userName}
          </div>
          <div className="text-sm" style={{ color: colors.text.tertiary }}>
            {request.userEmail}
          </div>
        </div>
      ),
    },
    {
      key: 'status',
      header: 'Statut',
      render: (request) => (
        <span
          className={`px-2 py-1 rounded-full text-xs font-medium ${
            request.status === 'approved'
              ? 'bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-100'
              : request.status === 'pending'
              ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-800 dark:text-yellow-100'
              : request.status === 'rejected'
              ? 'bg-red-100 text-red-800 dark:bg-red-800 dark:text-red-100'
              : 'bg-blue-100 text-blue-800 dark:bg-blue-800 dark:text-blue-100'
          }`}
        >
          {getStatusLabel(request.status)}
        </span>
      ),
    },
    {
      key: 'priority',
      header: 'Priorité',
      render: (request) => (
        <span
          className={`px-2 py-1 rounded-full text-xs font-medium ${
            request.priority === 'high'
              ? 'bg-red-100 text-red-800 dark:bg-red-800 dark:text-red-100'
              : request.priority === 'medium'
              ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-800 dark:text-yellow-100'
              : 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-100'
          }`}
        >
          {getPriorityLabel(request.priority)}
        </span>
      ),
    },
    {
      key: 'date',
      header: 'Date',
      render: (request) => (
        <div style={{ color: colors.text.secondary }}>
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
            style={{ borderColor: colors.border }}
          >
            Détails
          </Button>
          {currentTab === 'pending' && hasPermission(PERMISSIONS.APPROVE_REQUESTS) && (
            <>
              <Button
                variant="primary"
                size="sm"
                onClick={() => handleApprove(request.id)}
                style={{ backgroundColor: '#10B981', color: '#FFFFFF' }}
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
    const matchesStatus = request.status === currentTab;
    const matchesSearch = request.type?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          request.userName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          request.userEmail?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || request.category === selectedCategory;
    return matchesStatus && matchesSearch && matchesCategory;
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
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: colors.background.primary }}>
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-6" style={{ backgroundColor: colors.background.secondary }}>
      <h1 className="text-3xl font-bold mb-6" style={{ color: colors.text.primary }}>
        Gestion des Requêtes
      </h1>

      <Tabs
        tabs={tabs}
        activeTab={currentTab}
        onChange={setCurrentTab}
        className="mb-6"
      />

      <Card className="mb-6">
        <div className="p-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <input
                type="text"
                placeholder="Rechercher une requête..."
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
              <Select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                options={categories}
                className="w-full"
              />
            </div>
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