'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import useAuth from '@/hooks/useAuth';
import { useRequests } from '@/hooks/useRequests';
import { useResources } from '@/hooks/useResources';
import { ROLES } from '@/lib/auth-permissions';
import { db } from '@/lib/firebase';
import { collection, query, onSnapshot, where } from 'firebase/firestore';
import Card from '@/components/common/Card';
import Button from '@/components/common/Button';
import { FileText, Calendar, BookOpen, Clock, ArrowRight, LogOut } from 'lucide-react';
import { logoutUser } from '@/services/authService';

export default function StudentDashboard() {
  const router = useRouter();
  const { user } = useAuth();
  const { requests, loading: loadingRequests } = useRequests();
  const { resources, loading: loadingResources } = useResources();
  const [requestTypes, setRequestTypes] = useState([]);
  const [loadingRequestTypes, setLoadingRequestTypes] = useState(true);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  useEffect(() => {
    if (!user && !isLoggingOut) {
      router.push('/login');
      return;
    }

    if (user && user.role !== ROLES.STUDENT) {
      router.push('/dashboard');
    }
  }, [user, router, isLoggingOut]);

  // Fetch request types from Firebase
  useEffect(() => {
    const q = query(collection(db, 'requestTypes'), where('isActive', '==', true));
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const types = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      }));
      setRequestTypes(types);
      setLoadingRequestTypes(false);
    });

    return () => unsubscribe();
  }, []);

  const userRequests = requests.filter(r => r.userId === user?.id);
  const availableResources = resources.filter(r => r.isActive && r.status === 'available');

  const recentRequests = userRequests.slice(0, 5);

  const requestStats = {
    total: userRequests.length,
    pending: userRequests.filter(r => r.status === 'pending').length,
    inProgress: userRequests.filter(r => r.status === 'in_progress').length,
    approved: userRequests.filter(r => r.status === 'approved').length,
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'approved':
        return 'text-green-600 bg-green-100';
      case 'rejected':
        return 'text-red-600 bg-red-100';
      case 'in_progress':
        return 'text-blue-600 bg-blue-100';
      case 'pending':
        return 'text-yellow-600 bg-yellow-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  const getStatusLabel = (status) => {
    const statusLabels = {
      pending: 'En attente',
      in_progress: 'En cours',
      approved: 'Approuvée',
      rejected: 'Rejetée',
    };
    return statusLabels[status] || status;
  };

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

  const quickActions = [
    {
      title: 'Nouvelle demande',
      description: 'Soumettre une nouvelle requête',
      onClick: () => router.push('/student/requests'),
      icon: <FileText className="h-6 w-6" />,
      color: 'text-blue-600 bg-blue-100',
    },
    {
      title: 'Réserver une ressource',
      description: 'Réserver une salle ou du matériel',
      onClick: () => router.push('/resources'),
      icon: <Calendar className="h-6 w-6" />,
      color: 'text-green-600 bg-green-100',
    },
    {
      title: 'Mon historique',
      description: 'Voir toutes mes requêtes',
      onClick: () => router.push('/student/history'),
      icon: <BookOpen className="h-6 w-6" />,
      color: 'text-purple-600 bg-purple-100',
    },
  ];

  if (loadingRequests || loadingResources || loadingRequestTypes || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto">
      {/* Welcome Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-primary">
            Bienvenue, {user?.displayName || 'Utilisateur'}
          </h1>
          <p className="mt-1 text-secondary">Voici un aperçu de vos activités</p>
        </div>
        <Button
          variant="secondary"
          onClick={handleLogout}
          disabled={isLoggingOut}
          className="inline-flex items-center"
        >
          <LogOut className="h-5 w-5 mr-2" />
          {isLoggingOut ? 'Déconnexion...' : 'Déconnexion'}
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <Card>
          <div className="p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0 rounded-md p-3 bg-blue-100">
                <FileText className="h-6 w-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Total requêtes</p>
                <p className="text-2xl font-semibold text-gray-900">{requestStats.total}</p>
              </div>
            </div>
          </div>
        </Card>

        <Card>
          <div className="p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0 rounded-md p-3 bg-yellow-100">
                <Clock className="h-6 w-6 text-yellow-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">En attente</p>
                <p className="text-2xl font-semibold text-gray-900">{requestStats.pending}</p>
              </div>
            </div>
          </div>
        </Card>

        <Card>
          <div className="p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0 rounded-md p-3 bg-blue-100">
                <Calendar className="h-6 w-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">En cours</p>
                <p className="text-2xl font-semibold text-gray-900">{requestStats.inProgress}</p>
              </div>
            </div>
          </div>
        </Card>

        <Card>
          <div className="p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0 rounded-md p-3 bg-green-100">
                <FileText className="h-6 w-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Approuvées</p>
                <p className="text-2xl font-semibold text-gray-900">{requestStats.approved}</p>
              </div>
            </div>
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Quick Actions */}
        <div className="lg:col-span-1">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Actions rapides</h2>
          <div className="space-y-4">
            {quickActions.map((action, index) => (
              <Card key={index} className="hover:shadow-md transition-shadow cursor-pointer">
                <button
                  onClick={action.onClick}
                  className="w-full text-left flex items-center p-4"
                >
                    <div className={`flex-shrink-0 rounded-lg p-3 ${action.color}`}>
                      {action.icon}
                    </div>
                    <div className="ml-4">
                      <h3 className="text-sm font-medium text-gray-900">{action.title}</h3>
                      <p className="text-sm text-gray-500">{action.description}</p>
                    </div>
                    <div className="ml-auto">
                      <ArrowRight className="h-5 w-5 text-gray-400" />
                    </div>
                </button>
              </Card>
            ))}
          </div>
        </div>

        {/* Recent Requests */}
        <div className="lg:col-span-2">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Requêtes récentes</h2>
            <Button variant="primary" onClick={() => router.push('/student/history')}>
              Voir tout
            </Button>
          </div>

          <Card>
            <div className="p-6">
              {recentRequests.length > 0 ? (
                <div className="space-y-4">
                  {recentRequests.map(request => (
                    <div
                      key={request.id}
                      className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer"
                      onClick={() => router.push(`/requests/detail/${request.id}`)}
                    >
                      <div className="flex-1">
                        <h3 className="text-sm font-medium text-gray-900">{request.type}</h3>
                        <p className="text-sm text-gray-500">
                          {new Date(request.createdAt).toLocaleDateString('fr-FR', {
                            day: 'numeric',
                            month: 'short',
                            year: 'numeric'
                          })}
                        </p>
                      </div>
                      <div>
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(request.status)}`}>
                          {getStatusLabel(request.status)}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-6">
                  <FileText className="mx-auto h-12 w-12 text-gray-400" />
                  <p className="mt-2 text-sm text-gray-500">Aucune requête récente</p>
                  <Button
                    variant="primary"
                    className="mt-4 bg-blue-600 text-white"
                    onClick={() => router.push('/student/requests')}
                  >
                    Faire une demande
                  </Button>
                </div>
              )}
            </div>
          </Card>
        </div>
      </div>

      {/* Available Resources (Sample) */}
      <div className="mt-8">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold text-gray-900">Ressources disponibles</h2>
          <Button variant="primary" onClick={() => router.push('/resources')}>
            Voir toutes les ressources
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {availableResources.slice(0, 3).map(resource => (
            <Card key={resource.id} className="hover:shadow-md transition-shadow">
              <div className="p-6">
                <h3 className="text-lg font-medium text-gray-900">{resource.name}</h3>
                <p className="mt-1 text-sm text-gray-500">{resource.description}</p>
                <div className="mt-4">
                  <Button
                    variant="primary"
                    size="sm"
                    className="bg-blue-600 text-white"
                    onClick={() => router.push(`/resources/${resource.id}`)}
                  >
                    Voir détails
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}