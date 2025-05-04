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
import Tabs from '@/components/common/Tabs';
import { PERMISSIONS, ROLES } from '@/lib/auth-permissions';

export default function ServiceMemberRequestsPage() {
  const router = useRouter();
  const { user, hasPermission } = useAuth();
  const { requests, loading, processRequest, transferRequest } = useRequests();
  const { colors, isDarkMode } = useTheme();
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [currentTab, setCurrentTab] = useState('pending');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    if (!user) {
      router.push('/login');
      return;
    }

    if (![ROLES.SERVICE_HEAD, ROLES.SERVICE_MEMBER].includes(user.role)) {
      router.push('/dashboard');
    }
  }, [user, router]);

  // Filter requests based on user's service
  const serviceRequests = requests.filter(request =>
    request.currentServiceId === user?.serviceId
  );

  const tabs = [
    { id: 'pending', label: 'À traiter', count: serviceRequests.filter(r => r.status === 'pending').length },
    { id: 'in_progress', label: 'En cours', count: serviceRequests.filter(r => r.status === 'in_progress').length },
    { id: 'processed', label: 'Traitées', count: serviceRequests.filter(r => r.status === 'approved' || r.status === 'rejected').length },
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
              {request.isLastService ? (
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
              ) : (
                <>
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={() => handleConfirm(request.id)}
                    style={{ backgroundColor: colors.primary }}
                    className="text-white"
                  >
                    Confirmer
                  </Button>
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => handleTransfer(request.id)}
                    style={{ borderColor: colors.border }}
                  >
                    Transférer
                  </Button>
                </>
              )}
            </>
          )}
        </div>
      ),
    },
  ];

  const getPriorityLabel = (priority) => {
    const priorityLabels = {
      high: 'Haute',
      medium: 'Moyenne',
      low: 'Basse',
    };
    return priorityLabels[priority] || priority;
  };

  const filteredRequests = serviceRequests.filter(request => {
    const matchesTab =
      currentTab === 'pending' ? request.status === 'pending' :
      currentTab === 'in_progress' ? request.status === 'in_progress' :
      request.status === 'approved' || request.status === 'rejected';

    const matchesSearch = request.type?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          request.userName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          request.userEmail?.toLowerCase().includes(searchTerm.toLowerCase());

    return matchesTab && matchesSearch;
  });

  const handleViewDetails = (request) => {
    setSelectedRequest(request);
    setIsDetailModalOpen(true);
  };

  const handleConfirm = async (requestId) => {
    if (window.confirm('Êtes-vous sûr de vouloir confirmer cette requête ?')) {
      await processRequest(requestId, 'confirm');
    }
  };

  const handleTransfer = async (requestId) => {
    // Implementation for transferring to next service
    if (window.confirm('Êtes-vous sûr de vouloir transférer cette requête ?')) {
      const request = requests.find(r => r.id === requestId);
      const nextServiceIndex = request.serviceWorkflow.findIndex(s => s.id === user.serviceId) + 1;

      if (nextServiceIndex < request.serviceWorkflow.length) {
        const nextService = request.serviceWorkflow[nextServiceIndex];
        await transferRequest(requestId, nextService.id);
      }
    }
  };

  const handleApprove = async (requestId) => {
    const comment = window.prompt('Commentaire d\'approbation (optionnel):');
    await processRequest(requestId, 'approve', comment);
  };

  const handleReject = async (requestId) => {
    const reason = window.prompt('Raison du rejet (requis):');
    if (reason) {
      await processRequest(requestId, 'reject', reason);
    }
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
        Requêtes à Traiter
      </h1>

      <Tabs
        tabs={tabs}
        activeTab={currentTab}
        onChange={setCurrentTab}
        className="mb-6"
      />

      <Card className="mb-6">
        <div className="p-4">
          <div className="mb-4">
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