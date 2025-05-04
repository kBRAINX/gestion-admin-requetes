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
import { ROLES } from '@/lib/auth-permissions';

export default function ServiceHistoryPage() {
  const router = useRouter();
  const { user } = useAuth();
  const { requests, loading } = useRequests();
  const { colors, isDarkMode } = useTheme();
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [dateRange, setDateRange] = useState('all');

  useEffect(() => {
    if (!user) {
      router.push('/login');
      return;
    }

    if (![ROLES.SERVICE_HEAD, ROLES.SERVICE_MEMBER].includes(user.role)) {
      router.push('/dashboard');
    }
  }, [user, router]);

  // Filter requests processed by the service
  const serviceRequests = requests.filter(request =>
    request.processedByService === user?.serviceId ||
    request.currentServiceId === user?.serviceId ||
    request.workflow?.some(step => step.serviceId === user?.serviceId)
  );

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
              : request.status === 'rejected'
              ? 'bg-red-100 text-red-800 dark:bg-red-800 dark:text-red-100'
              : 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-100'
          }`}
        >
          {getStatusLabel(request.status)}
        </span>
      ),
    },
    {
      key: 'processedBy',
      header: 'Traité par',
      render: (request) => (
        <div style={{ color: colors.text.primary }}>
          {request.processedByName || '-'}
        </div>
      ),
    },
    {
      key: 'processedDate',
      header: 'Date de traitement',
      render: (request) => (
        <div style={{ color: colors.text.secondary }}>
          {request.processedAt ? new Date(request.processedAt).toLocaleDateString('fr-FR') : '-'}
        </div>
      ),
    },
    {
      key: 'actions',
      header: 'Actions',
      render: (request) => (
        <button
          onClick={() => handleViewDetails(request)}
          className="inline-flex items-center px-3 py-1.5 border rounded-md text-sm hover:opacity-80"
          style={{
            borderColor: colors.border,
            color: colors.primary
          }}
        >
          Voir détails
        </button>
      ),
    },
  ];

  const statusOptions = [
    { value: 'all', label: 'Tous les statuts' },
    { value: 'approved', label: 'Approuvées' },
    { value: 'rejected', label: 'Rejetées' },
  ];

  const dateRangeOptions = [
    { value: 'all', label: 'Toutes les dates' },
    { value: 'today', label: 'Aujourd\'hui' },
    { value: 'week', label: 'Cette semaine' },
    { value: 'month', label: 'Ce mois' },
    { value: 'year', label: 'Cette année' },
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

  const filterByDateRange = (request) => {
    if (dateRange === 'all') return true;

    const requestDate = new Date(request.processedAt || request.createdAt);
    const now = new Date();

    switch (dateRange) {
      case 'today':
        return requestDate.toDateString() === now.toDateString();
      case 'week':
        const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        return requestDate >= weekAgo;
      case 'month':
        return requestDate.getMonth() === now.getMonth() && requestDate.getFullYear() === now.getFullYear();
      case 'year':
        return requestDate.getFullYear() === now.getFullYear();
      default:
        return true;
    }
  };

  const filteredRequests = serviceRequests.filter(request => {
    const matchesSearch = request.type?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          request.userName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          request.userEmail?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = selectedStatus === 'all' || request.status === selectedStatus;
    const matchesDate = filterByDateRange(request);
    return matchesSearch && matchesStatus && matchesDate;
  });

  const handleViewDetails = (request) => {
    setSelectedRequest(request);
    setIsDetailModalOpen(true);
  };

  const getServiceStats = () => {
    const total = serviceRequests.length;
    const approved = serviceRequests.filter(r => r.status === 'approved').length;
    const rejected = serviceRequests.filter(r => r.status === 'rejected').length;
    const avgProcessingTime = serviceRequests
      .filter(r => r.processedAt && r.createdAt)
      .reduce((acc, r) => {
        const duration = new Date(r.processedAt) - new Date(r.createdAt);
        return acc + (duration / (1000 * 60 * 60 * 24)); // Convert to days
      }, 0) / serviceRequests.filter(r => r.processedAt).length || 0;

    return { total, approved, rejected, avgProcessingTime };
  };

  const stats = getServiceStats();

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
        Historique des requêtes traitées
      </h1>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Card>
          <div className="p-6">
            <div className="text-3xl font-bold" style={{ color: colors.primary }}>
              {stats.total}
            </div>
            <div className="text-sm" style={{ color: colors.text.secondary }}>
              Total des requêtes
            </div>
          </div>
        </Card>
        <Card>
          <div className="p-6">
            <div className="text-3xl font-bold text-green-600">
              {stats.approved}
            </div>
            <div className="text-sm" style={{ color: colors.text.secondary }}>
              Approuvées
            </div>
          </div>
        </Card>
        <Card>
          <div className="p-6">
            <div className="text-3xl font-bold text-red-600">
              {stats.rejected}
            </div>
            <div className="text-sm" style={{ color: colors.text.secondary }}>
              Rejetées
            </div>
          </div>
        </Card>
        <Card>
          <div className="p-6">
            <div className="text-3xl font-bold text-blue-600">
              {stats.avgProcessingTime.toFixed(1)}j
            </div>
            <div className="text-sm" style={{ color: colors.text.secondary }}>
              Temps moyen de traitement
            </div>
          </div>
        </Card>
      </div>

      {/* Filters */}
      <Card className="mb-6">
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="w-full p-2 rounded border"
                style={{
                  backgroundColor: colors.background.primary,
                  borderColor: colors.border,
                  color: colors.text.primary,
                }}
              >
                {statusOptions.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <select
                value={dateRange}
                onChange={(e) => setDateRange(e.target.value)}
                className="w-full p-2 rounded border"
                style={{
                  backgroundColor: colors.background.primary,
                  borderColor: colors.border,
                  color: colors.text.primary,
                }}
              >
                {dateRangeOptions.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </Card>

      {/* Table */}
      <Card>
        <div className="p-6">
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