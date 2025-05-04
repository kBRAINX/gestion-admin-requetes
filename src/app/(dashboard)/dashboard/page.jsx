'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import useAuth from '@/hooks/useAuth';
import { useRequests } from '@/hooks/useRequests';
import { useResources } from '@/hooks/useResources';
import { useTheme } from '@/contexts/ThemeContext';
import Card from '@/components/common/Card';
import { ROLES } from '@/lib/auth-permissions';

export default function DashboardPage() {
  const router = useRouter();
  const { user } = useAuth();
  const { requests, loading: loadingRequests } = useRequests();
  const { resources, loading: loadingResources } = useResources();
  const { colors, isDarkMode } = useTheme();

  useEffect(() => {
    if (!user) {
      router.push('/login');
    }
  }, [user, router]);

  if (!user || loadingRequests || loadingResources) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: colors.background.primary }}>
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  // Filter data based on user role
  const getUserRequests = () => {
    switch (user.role) {
      case ROLES.STUDENT:
        return requests.filter(r => r.userId === user.id);
      case ROLES.SERVICE_HEAD:
      case ROLES.SERVICE_MEMBER:
        return requests.filter(r => r.currentServiceId === user.serviceId);
      default:
        return requests;
    }
  };

  const userRequests = getUserRequests();

  const getStatistics = () => {
    const pendingRequests = userRequests.filter(r => r.status === 'pending').length;
    const inProgressRequests = userRequests.filter(r => r.status === 'in_progress').length;
    const approvedRequests = userRequests.filter(r => r.status === 'approved').length;
    const totalRequests = userRequests.length;

    return {
      pendingRequests,
      inProgressRequests,
      approvedRequests,
      totalRequests,
      availableResources: resources.filter(r => r.status === 'available').length,
      totalResources: resources.length,
    };
  };

  const stats = getStatistics();

  const getQuickLinks = () => {
    switch (user.role) {
      case ROLES.SUPERADMIN:
        return [
          { label: 'Gérer les services', href: '/admin/services', icon: 'users' },
          { label: 'Gérer les utilisateurs', href: '/admin/users', icon: 'user' },
          { label: 'Voir toutes les requêtes', href: '/admin/requests', icon: 'document' },
          { label: 'Gérer les ressources', href: '/admin/resources', icon: 'calendar' },
        ];
      case ROLES.SERVICE_HEAD:
      case ROLES.SERVICE_MEMBER:
        return [
          { label: 'Requêtes à traiter', href: '/service/requests', icon: 'document' },
          { label: 'Historique des requêtes', href: '/service/history', icon: 'clock' },
        ];
      case ROLES.STUDENT:
        return [
          { label: 'Nouvelle requête', href: '/student/requests', icon: 'document' },
          { label: 'Réserver une ressource', href: '/student/resources', icon: 'calendar' },
          { label: 'Mon historique', href: '/student/history', icon: 'clock' },
        ];
      default:
        return [];
    }
  };

  const getIcon = (type) => {
    switch (type) {
      case 'users':
        return <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" /></svg>;
      case 'user':
        return <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>;
      case 'document':
        return <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>;
      case 'calendar':
        return <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>;
      case 'clock':
        return <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>;
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen p-6" style={{ backgroundColor: colors.background.secondary }}>
      <div className="mb-8">
        <h1 className="text-3xl font-bold" style={{ color: colors.text.primary }}>
          Bienvenue, {user.displayName}
        </h1>
        <p className="mt-2" style={{ color: colors.text.secondary }}>
          Voici un aperçu de votre activité
        </p>
      </div>

      {/* Statistics Grid */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4 mb-8">
        <Card>
          <div className="p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0 rounded-md p-3" style={{ backgroundColor: `${colors.primary}20` }}>
                <svg className="w-6 h-6" style={{ color: colors.primary }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <div className="ml-5">
                <p className="text-sm font-medium" style={{ color: colors.text.secondary }}>
                  Total requêtes
                </p>
                <p className="text-2xl font-semibold" style={{ color: colors.text.primary }}>
                  {stats.totalRequests}
                </p>
              </div>
            </div>
          </div>
        </Card>

        <Card>
          <div className="p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0 rounded-md p-3" style={{ backgroundColor: '#FEF3C720' }}>
                <svg className="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="ml-5">
                <p className="text-sm font-medium" style={{ color: colors.text.secondary }}>
                  En attente
                </p>
                <p className="text-2xl font-semibold" style={{ color: colors.text.primary }}>
                  {stats.pendingRequests}
                </p>
              </div>
            </div>
          </div>
        </Card>

        <Card>
          <div className="p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0 rounded-md p-3" style={{ backgroundColor: '#DBEAFE20' }}>
                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="ml-5">
                <p className="text-sm font-medium" style={{ color: colors.text.secondary }}>
                  En cours
                </p>
                <p className="text-2xl font-semibold" style={{ color: colors.text.primary }}>
                  {stats.inProgressRequests}
                </p>
              </div>
            </div>
          </div>
        </Card>

        <Card>
          <div className="p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0 rounded-md p-3" style={{ backgroundColor: '#D1FAE520' }}>
                <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="ml-5">
                <p className="text-sm font-medium" style={{ color: colors.text.secondary }}>
                  Approuvées
                </p>
                <p className="text-2xl font-semibold" style={{ color: colors.text.primary }}>
                  {stats.approvedRequests}
                </p>
              </div>
            </div>
          </div>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card className="mb-8">
        <div className="p-6">
          <h2 className="text-lg font-semibold mb-6" style={{ color: colors.text.primary }}>
            Actions rapides
          </h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {getQuickLinks().map((link, index) => (
              <a
                key={index}
                href={link.href}
                className="flex items-center p-4 rounded-md hover:opacity-90 transition-opacity"
                style={{ backgroundColor: isDarkMode ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.05)' }}
              >
                <div className="flex-shrink-0 mr-4" style={{ color: colors.primary }}>
                  {getIcon(link.icon)}
                </div>
                <div className="text-sm font-medium" style={{ color: colors.text.primary }}>
                  {link.label}
                </div>
              </a>
            ))}
          </div>
        </div>
      </Card>

      {/* Recent Activity */}
      <Card>
        <div className="p-6">
          <h2 className="text-lg font-semibold mb-6" style={{ color: colors.text.primary }}>
            Activité récente
          </h2>
          <div className="space-y-4">
            {userRequests.slice(0, 5).map((request, index) => (
              <div key={index} className="flex items-center justify-between py-3 border-b" style={{ borderColor: colors.border }}>
                <div className="flex items-center">
                  <div className="flex-shrink-0 mr-4">
                    <div className="w-8 h-8 rounded-full flex items-center justify-center" style={{ backgroundColor: getStatusColor(request.status) }}>
                      {getStatusIcon(request.status)}
                    </div>
                  </div>
                  <div>
                    <p className="text-sm font-medium" style={{ color: colors.text.primary }}>
                      {request.type}
                    </p>
                    <p className="text-sm" style={{ color: colors.text.secondary }}>
                      {new Date(request.createdAt).toLocaleDateString('fr-FR')}
                    </p>
                  </div>
                </div>
                <span
                  className="px-2 py-1 rounded-full text-xs font-medium"
                  style={{
                    backgroundColor: `${getStatusColor(request.status)}20`,
                    color: getStatusColor(request.status)
                  }}
                >
                  {getStatusLabel(request.status)}
                </span>
              </div>
            ))}
          </div>
        </div>
      </Card>
    </div>
  );
}

// Helper functions
function getStatusColor(status) {
  switch (status) {
    case 'approved':
      return '#10B981';
    case 'rejected':
      return '#EF4444';
    case 'in_progress':
      return '#3B82F6';
    case 'pending':
      return '#F59E0B';
    default:
      return '#6B7280';
  }
}

function getStatusIcon(status) {
  switch (status) {
    case 'approved':
      return <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" /></svg>;
    case 'pending':
      return <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" /></svg>;
    case 'in_progress':
      return <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM7 9a1 1 0 100-2 1 1 0 000 2zm7-1a1 1 0 11-2 0 1 1 0 012 0zm-7.536 5.879a1 1 0 001.415 0 3 3 0 014.242 0 1 1 0 001.415-1.415 5 5 0 00-7.072 0 1 1 0 000 1.415z" clipRule="evenodd" /></svg>;
    default:
      return null;
  }
}

function getStatusLabel(status) {
  const statusLabels = {
    pending: 'En attente',
    in_progress: 'En cours',
    approved: 'Approuvée',
    rejected: 'Rejetée',
  };
  return statusLabels[status] || status;
}