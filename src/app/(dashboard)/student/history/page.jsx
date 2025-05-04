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
import WorkflowViewer from '@/components/dashboard/WorkflowViewer';
import { ROLES } from '@/lib/auth-permissions';

export default function StudentHistoryPage() {
  const router = useRouter();
  const { user } = useAuth();
  const { requests, loading } = useRequests();
  const { colors, isDarkMode } = useTheme();
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('all');

  useEffect(() => {
    if (!user) {
      router.push('/login');
      return;
    }

    if (user.role !== ROLES.STUDENT) {
      router.push('/dashboard');
    }
  }, [user, router]);

  // Filter requests for the current user
  const userRequests = requests.filter(request => request.userId === user?.id);

  const columns = [
    {
      key: 'type',
      header: 'Type de requête',
      render: (request) => (
        <div style={{ color: colors.text.primary }}>
          {request.type}
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
      key: 'date',
      header: 'Date de soumission',
      render: (request) => (
        <div style={{ color: colors.text.secondary }}>
          {new Date(request.createdAt).toLocaleDateString('fr-FR', {
            day: 'numeric',
            month: 'long',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
          })}
        </div>
      ),
    },
    {
      key: 'progress',
      header: 'Progression',
      render: (request) => (
        <div className="w-full">
          <div className="w-full bg-gray-200 rounded-full h-2" style={{ backgroundColor: colors.background.secondary }}>
            <div
              className="h-2 rounded-full transition-all"
              style={{
                width: `${getProgressPercentage(request)}%`,
                backgroundColor: getProgressColor(request.status)
              }}
            />
          </div>
          <div className="text-xs mt-1" style={{ color: colors.text.tertiary }}>
            {Math.round(getProgressPercentage(request))}%
          </div>
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
    { value: 'pending', label: 'En attente' },
    { value: 'in_progress', label: 'En cours' },
    { value: 'approved', label: 'Approuvée' },
    { value: 'rejected', label: 'Rejetée' },
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

  const getProgressPercentage = (request) => {
    if (request.status === 'approved') return 100;
    if (request.status === 'rejected') return 100;
    if (request.status === 'in_progress') return 50;
    return 25;
  };

  const getProgressColor = (status) => {
    switch (status) {
      case 'approved': return '#10B981'; // green
      case 'rejected': return '#EF4444'; // red
      case 'in_progress': return '#3B82F6'; // blue
      default: return '#F59E0B'; // yellow
    }
  };

  const filteredRequests = userRequests.filter(request => {
    const matchesSearch = request.type?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = selectedStatus === 'all' || request.status === selectedStatus;
    return matchesSearch && matchesStatus;
  });

  const handleViewDetails = (request) => {
    setSelectedRequest(request);
    setIsDetailModalOpen(true);
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
        Historique de mes requêtes
      </h1>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Card>
          <div className="p-6">
            <div className="text-3xl font-bold" style={{ color: colors.primary }}>
              {userRequests.length}
            </div>
            <div className="text-sm" style={{ color: colors.text.secondary }}>
              Total des requêtes
            </div>
          </div>
        </Card>
        <Card>
          <div className="p-6">
            <div className="text-3xl font-bold text-yellow-600">
              {userRequests.filter(r => r.status === 'pending' || r.status === 'in_progress').length}
            </div>
            <div className="text-sm" style={{ color: colors.text.secondary }}>
              En cours
            </div>
          </div>
        </Card>
        <Card>
          <div className="p-6">
            <div className="text-3xl font-bold text-green-600">
              {userRequests.filter(r => r.status === 'approved').length}
            </div>
            <div className="text-sm" style={{ color: colors.text.secondary }}>
              Approuvées
            </div>
          </div>
        </Card>
        <Card>
          <div className="p-6">
            <div className="text-3xl font-bold text-red-600">
              {userRequests.filter(r => r.status === 'rejected').length}
            </div>
            <div className="text-sm" style={{ color: colors.text.secondary }}>
              Rejetées
            </div>
          </div>
        </Card>
      </div>

      <Card>
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
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