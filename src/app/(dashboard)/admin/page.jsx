'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import useAuth from '@/hooks/useAuth';
import { db } from '@/lib/firebase';
import { collection, onSnapshot } from 'firebase/firestore';
import { PERMISSIONS } from '@/lib/auth-permissions';
import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement } from 'chart.js';
import { Pie, Bar } from 'react-chartjs-2';
import Button from '@/components/common/Button';
import { logoutUser } from '@/services/authService';

ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement);

export default function AdminDashboard() {
  const router = useRouter();
  const { user, signOut, hasPermission } = useAuth();
  const [loading, setLoading] = useState(true);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [stats, setStats] = useState({
    totalUsers: 0,
    activeRequests: 0,
    pendingRequests: 0,
    resourceBookings: 0,
    users: [],
    requests: [],
    resources: []
  });

  useEffect(() => {
    if (!user) {
      router.push('/login');
      return;
    }

    // Subscribe to real-time updates
    const unsubscribeUsers = onSnapshot(collection(db, 'users'), (snapshot) => {
      const users = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setStats(prev => ({ ...prev, totalUsers: users.length, users }));
    });

    const unsubscribeRequests = onSnapshot(collection(db, 'requests'), (snapshot) => {
      const requests = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      const activeRequests = requests.filter(r => r.status !== 'approved' && r.status !== 'rejected').length;
      const pendingRequests = requests.filter(r => r.status === 'pending').length;
      setStats(prev => ({ ...prev, activeRequests, pendingRequests, requests }));
    });

    const unsubscribeResources = onSnapshot(collection(db, 'resources'), (snapshot) => {
      const resources = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setStats(prev => ({ ...prev, resources }));
    });

    setLoading(false);

    return () => {
      unsubscribeUsers();
      unsubscribeRequests();
      unsubscribeResources();
    };
  }, [user, router, hasPermission]);

  const handleLogout = async () => {
    try {
    setIsLoggingOut(true);
    await logoutUser();
    // Le useEffect s'occupera de la redirection
    } catch (error) {
    console.error('Error logging out:', error);
    setIsLoggingOut(false);
    }
  };

  const getRequestsChartData = () => {
    const requestsByStatus = stats.requests.reduce((acc, request) => {
      acc[request.status] = (acc[request.status] || 0) + 1;
      return acc;
    }, {});

    return {
      labels: Object.keys(requestsByStatus),
      datasets: [{
        data: Object.values(requestsByStatus),
        backgroundColor: ['#3B82F6', '#F59E0B', '#10B981', '#EF4444'],
      }]
    };
  };

  const getUsersChartData = () => {
    const usersByRole = stats.users.reduce((acc, user) => {
      acc[user.role] = (acc[user.role] || 0) + 1;
      return acc;
    }, {});

    return {
      labels: Object.keys(usersByRole),
      datasets: [{
        label: 'Utilisateurs par rôle',
        data: Object.values(usersByRole),
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
      <div className='flex justify-between items-center mb-8'>
        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-2xl font-bold text-gray-900">
            Bienvenue, {user?.displayName}
          </h2>
          <p className="mt-1 text-sm text-gray-600">
            Voici un aperçu de l'activité du système
          </p>
        </div>
        <Button
          onClick={handleLogout}
          disabled={isLoggingOut}
          variant='secondary'
        >
          {isLoggingOut ? 'Déconnexion...' : 'Déconnexion'}
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <svg className="h-6 w-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Utilisateurs totaux
                  </dt>
                  <dd className="text-2xl font-semibold text-gray-900">
                    {stats.totalUsers}
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
                <svg className="h-6 w-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Requêtes actives
                  </dt>
                  <dd className="text-2xl font-semibold text-gray-900">
                    {stats.activeRequests}
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
                <svg className="h-6 w-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Requêtes en attente
                  </dt>
                  <dd className="text-2xl font-semibold text-gray-900">
                    {stats.pendingRequests}
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
                <svg className="h-6 w-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Ressources
                  </dt>
                  <dd className="text-2xl font-semibold text-gray-900">
                    {stats.resources.length}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white shadow rounded-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Répartition des requêtes
          </h3>
          <div className="h-64">
            <Pie data={getRequestsChartData()} options={{ maintainAspectRatio: false }} />
          </div>
        </div>

        <div className="bg-white shadow rounded-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Utilisateurs par rôle
          </h3>
          <div className="h-64">
            <Bar data={getUsersChartData()} options={{ maintainAspectRatio: false }} />
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        <div
          onClick={() => router.push('/admin/users')}
          className="relative group bg-white p-6 focus-within:ring-2 focus-within:ring-inset focus-within:ring-blue-500 shadow-sm rounded-lg overflow-hidden transition-shadow hover:shadow-lg cursor-pointer"
        >
          <div>
            <span className="inline-flex p-3 bg-blue-600 rounded-lg text-white">
              <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
            </span>
          </div>
          <div className="mt-8">
            <h3 className="text-lg font-medium text-gray-900">
              Gérer les utilisateurs
            </h3>
            <p className="mt-2 text-sm text-gray-500">
              Ajouter, modifier ou supprimer des utilisateurs
            </p>
          </div>
        </div>

        <div
          onClick={() => router.push('/admin/services')}
          className="relative group bg-white p-6 focus-within:ring-2 focus-within:ring-inset focus-within:ring-blue-500 shadow-sm rounded-lg overflow-hidden transition-shadow hover:shadow-lg cursor-pointer"
        >
          <div>
            <span className="inline-flex p-3 bg-blue-600 rounded-lg text-white">
              <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
            </span>
          </div>
          <div className="mt-8">
            <h3 className="text-lg font-medium text-gray-900">
              Gérer les services
            </h3>
            <p className="mt-2 text-sm text-gray-500">
              Configurer les services et leur personnel
            </p>
          </div>
        </div>

        <div
          onClick={() => router.push('/admin/resources')}
          className="relative group bg-white p-6 focus-within:ring-2 focus-within:ring-inset focus-within:ring-blue-500 shadow-sm rounded-lg overflow-hidden transition-shadow hover:shadow-lg cursor-pointer"
        >
          <div>
            <span className="inline-flex p-3 bg-blue-600 rounded-lg text-white">
              <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </span>
          </div>
          <div className="mt-8">
            <h3 className="text-lg font-medium text-gray-900">
              Gérer les ressources
            </h3>
            <p className="mt-2 text-sm text-gray-500">
              Administrer les salles et le matériel
            </p>
          </div>
        </div>

        <div
          onClick={() => router.push('/admin/request-types')}
          className="relative group bg-white p-6 focus-within:ring-2 focus-within:ring-inset focus-within:ring-blue-500 shadow-sm rounded-lg overflow-hidden transition-shadow hover:shadow-lg cursor-pointer"
        >
          <div>
            <span className="inline-flex p-3 bg-blue-600 rounded-lg text-white">
              <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </span>
          </div>
          <div className="mt-8">
            <h3 className="text-lg font-medium text-gray-900">
              Types de requêtes
            </h3>
            <p className="mt-2 text-sm text-gray-500">
              Configurer les types de demandes
            </p>
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-white shadow rounded-lg">
        <div className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Activité récente
          </h3>
          <div className="flow-root">
            <ul className="-mb-8">
              {stats.requests.slice(0, 5).map((request, index) => (
                <li key={request.id}>
                  <div className="relative pb-8">
                    {index !== 4 && (
                      <span className="absolute top-4 left-4 -ml-px h-full w-0.5 bg-gray-200" aria-hidden="true" />
                    )}
                    <div className="relative flex space-x-3">
                      <div>
                        <span className="h-8 w-8 rounded-full bg-blue-600 flex items-center justify-center ring-8 ring-white">
                          <svg className="h-4 w-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                          </svg>
                        </span>
                      </div>
                      <div className="min-w-0 flex-1 pt-1.5 flex justify-between space-x-4">
                        <div>
                          <p className="text-sm text-gray-900">{request.type}</p>
                          <p className="text-sm text-gray-500">Par {request.userName}</p>
                        </div>
                        <div className="text-right text-sm whitespace-nowrap text-gray-500">
                          {new Date(request.createdAt.toDate()).toLocaleDateString()}
                        </div>
                      </div>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}