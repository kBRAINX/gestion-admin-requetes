'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import useAuth from '@/hooks/useAuth';
import { useRequests } from '@/hooks/useRequests';
import { ROLES } from '@/lib/auth-permissions';
import Card from '@/components/common/Card';
import { FileText, Clock, CheckCircle, AlertCircle, BarChart2 } from 'lucide-react';
import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement } from 'chart.js';
import { Pie, Bar } from 'react-chartjs-2';

ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement);

export default function ServiceDashboard() {
  const router = useRouter();
  const { user } = useAuth();
  const { requests, loading } = useRequests();

  useEffect(() => {
    if (!user) {
      router.push('/login');
      return;
    }

    if (![ROLES.SERVICE_HEAD, ROLES.SERVICE_MEMBER].includes(user.role)) {
      router.push('/dashboard');
    }
  }, [user, router]);

  // Filter requests for this service
  const serviceRequests = requests.filter(request =>
    request.currentServiceId === user?.serviceId
  );

  const pendingRequests = serviceRequests.filter(r => r.status === 'pending');
  const inProgressRequests = serviceRequests.filter(r => r.status === 'in_progress');
  const completedRequests = serviceRequests.filter(r => r.status === 'approved' || r.status === 'rejected');

  const getRequestsChartData = () => {
    const requestsByStatus = serviceRequests.reduce((acc, request) => {
      acc[request.status] = (acc[request.status] || 0) + 1;
      return acc;
    }, {});

    return {
      labels: ['En attente', 'En cours', 'Approuvées', 'Rejetées'],
      datasets: [{
        data: [
          requestsByStatus.pending || 0,
          requestsByStatus.in_progress || 0,
          requestsByStatus.approved || 0,
          requestsByStatus.rejected || 0
        ],
        backgroundColor: ['#F59E0B', '#3B82F6', '#10B981', '#EF4444'],
      }]
    };
  };

  const getRequestsByTypeData = () => {
    const requestsByType = serviceRequests.reduce((acc, request) => {
      const type = request.type.slice(0, 20); // Truncate long names
      acc[type] = (acc[type] || 0) + 1;
      return acc;
    }, {});

    return {
      labels: Object.keys(requestsByType),
      datasets: [{
        label: 'Requêtes par type',
        data: Object.values(requestsByType),
        backgroundColor: '#3B82F6',
      }]
    };
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
      {/* Welcome Header */}
      <div className="bg-white shadow rounded-lg p-6">
        <h2 className="text-2xl font-bold text-gray-900">
          Bienvenue, {user?.displayName}
        </h2>
        <p className="mt-1 text-sm text-gray-600">
          Service: {user?.serviceName || 'Non défini'}
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <AlertCircle className="h-6 w-6 text-yellow-600" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Requêtes en attente
                  </dt>
                  <dd className="text-2xl font-semibold text-gray-900">
                    {pendingRequests.length}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </Card>

        <Card>
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <Clock className="h-6 w-6 text-blue-600" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    En cours de traitement
                  </dt>
                  <dd className="text-2xl font-semibold text-gray-900">
                    {inProgressRequests.length}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </Card>

        <Card>
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <CheckCircle className="h-6 w-6 text-green-600" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Requêtes traitées
                  </dt>
                  <dd className="text-2xl font-semibold text-gray-900">
                    {completedRequests.length}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </Card>

        <Card>
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <FileText className="h-6 w-6 text-gray-600" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Total requêtes
                  </dt>
                  <dd className="text-2xl font-semibold text-gray-900">
                    {serviceRequests.length}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <div className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              État des requêtes
            </h3>
            <div className="h-64">
              <Pie data={getRequestsChartData()} options={{ maintainAspectRatio: false }} />
            </div>
          </div>
        </Card>

        <Card>
          <div className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Requêtes par type
            </h3>
            <div className="h-64">
              <Bar data={getRequestsByTypeData()} options={{ maintainAspectRatio: false }} />
            </div>
          </div>
        </Card>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
        <Card className="hover:shadow-lg transition-shadow">
          <button
            onClick={() => router.push('/service/requests')}
            className="w-full h-full"
          >
            <div className="p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0 rounded-full p-3 bg-blue-100">
                  <FileText className="h-6 w-6 text-blue-600" />
                </div>
                <div className="ml-4">
                  <h3 className="text-lg font-medium text-gray-900">
                    Traiter les requêtes
                  </h3>
                  <p className="mt-1 text-sm text-gray-500">
                    Gérer les requêtes en attente
                  </p>
                </div>
              </div>
            </div>
          </button>
        </Card>

        <Card className="hover:shadow-lg transition-shadow">
          <button
            onClick={() => router.push('/service/history')}
            className="w-full h-full"
          >
            <div className="p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0 rounded-full p-3 bg-green-100">
                  <CheckCircle className="h-6 w-6 text-green-600" />
                </div>
                <div className="ml-4">
                  <h3 className="text-lg font-medium text-gray-900">
                    Historique
                  </h3>
                  <p className="mt-1 text-sm text-gray-500">
                    Consulter l'historique des requêtes
                  </p>
                </div>
              </div>
            </div>
          </button>
        </Card>

        <Card className="hover:shadow-lg transition-shadow">
          <div className="p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0 rounded-full p-3 bg-purple-100">
                <BarChart2 className="h-6 w-6 text-purple-600" />
              </div>
              <div className="ml-4">
                <h3 className="text-lg font-medium text-gray-900">
                  Rapports
                </h3>
                <p className="mt-1 text-sm text-gray-500">
                  Générer des rapports
                </p>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}