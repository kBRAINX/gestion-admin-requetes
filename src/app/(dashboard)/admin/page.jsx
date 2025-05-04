'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { auth, db } from '@/lib/firebase';
import { doc, getDoc, collection, query, where, onSnapshot } from 'firebase/firestore';
import DashboardLayout from '@/components/layout/DashboardLayout';
import StatsCard from '@/components/dashboard/StatsCard';
import RequestsOverview from '@/components/dashboard/RequestsOverview';
import {
  FileText,
  Building,
  Calendar,
  Users,
  CheckCircle,
  Clock,
  AlertCircle
} from 'lucide-react';

export default function DashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (authUser) => {
      if (!authUser) {
        router.push('/login');
        return;
      }

      try {
        // Get user data from Firestore
        const userDoc = await getDoc(doc(db, 'users', authUser.uid));
        if (!userDoc.exists()) {
          throw new Error('User data not found');
        }

        const userData = userDoc.data();
        setUser(userData);

        // Set up request listener based on user role
        let requestQuery;
        if (['superadmin', 'admin'].includes(userData.role)) {
          // Admin can see all requests
          requestQuery = collection(db, 'requests');
        } else if (['service_head', 'service_member'].includes(userData.role)) {
          // Service members see requests for their service
          requestQuery = query(
            collection(db, 'requests'),
            where('currentService', '==', userData.serviceId)
          );
        } else {
          // Students and employees see only their own requests
          requestQuery = query(
            collection(db, 'requests'),
            where('userId', '==', authUser.uid)
          );
        }

        const unsubscribeRequests = onSnapshot(requestQuery, (snapshot) => {
          const requestData = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
          }));
          setRequests(requestData);
          setLoading(false);
        });

        return () => unsubscribeRequests();
      } catch (error) {
        console.error('Error fetching user data:', error);
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, [router]);

  if (loading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  // Calculate stats
  const stats = {
    pending: requests.filter(r => r.status === 'submitted').length,
    inReview: requests.filter(r => r.status === 'in_review').length,
    approved: requests.filter(r => r.status === 'approved').length,
    total: requests.length,
  };

  return (
    <DashboardLayout user={user}>
      <div className="space-y-6">
        {/* Welcome header */}
        <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            Bienvenue, {user.displayName}
          </h2>
          <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
            Voici un aperçu de votre activité
          </p>
        </div>

        {/* Stats cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatsCard
            title="Demandes totales"
            value={stats.total}
            icon={FileText}
            color="blue"
          />
          <StatsCard
            title="En attente"
            value={stats.pending}
            icon={Clock}
            color="yellow"
          />
          <StatsCard
            title="En cours"
            value={stats.inReview}
            icon={AlertCircle}
            color="blue"
          />
          <StatsCard
            title="Approuvées"
            value={stats.approved}
            icon={CheckCircle}
            color="green"
          />
        </div>

        {/* Main content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Requests overview */}
          <div className="lg:col-span-2">
            <RequestsOverview requests={requests} />
          </div>

          {/* Quick actions */}
          <div className="space-y-6">
            <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                Actions rapides
              </h3>
              <div className="space-y-4">
                <a
                  href="/requests"
                  className="flex items-center p-4 bg-blue-50 dark:bg-blue-900 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-800 transition-colors"
                >
                  <FileText className="h-6 w-6 text-blue-600 dark:text-blue-400 mr-3" />
                  <span className="text-sm font-medium text-blue-700 dark:text-blue-200">
                    Nouvelle demande
                  </span>
                </a>
                <a
                  href="/resources"
                  className="flex items-center p-4 bg-green-50 dark:bg-green-900 rounded-lg hover:bg-green-100 dark:hover:bg-green-800 transition-colors"
                >
                  <Building className="h-6 w-6 text-green-600 dark:text-green-400 mr-3" />
                  <span className="text-sm font-medium text-green-700 dark:text-green-200">
                    Réserver une ressource
                  </span>
                </a>
                <a
                  href="/calendar"
                  className="flex items-center p-4 bg-purple-50 dark:bg-purple-900 rounded-lg hover:bg-purple-100 dark:hover:bg-purple-800 transition-colors"
                >
                  <Calendar className="h-6 w-6 text-purple-600 dark:text-purple-400 mr-3" />
                  <span className="text-sm font-medium text-purple-700 dark:text-purple-200">
                    Voir le calendrier
                  </span>
                </a>
              </div>
            </div>

            {/* Recent activity */}
            <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                Activité récente
              </h3>
              <div className="space-y-4">
                {requests.slice(0, 5).map((request) => (
                  <div key={request.id} className="flex items-center">
                    <div className="flex-shrink-0">
                      <FileText className="h-5 w-5 text-gray-400" />
                    </div>
                    <div className="ml-3 min-w-0 flex-1">
                      <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                        {request.title || request.type}
                      </p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {new Date(request.createdAt?.toDate()).toLocaleDateString('fr-FR')}
                      </p>
                    </div>
                  </div>
                ))}
                {requests.length === 0 && (
                  <p className="text-sm text-gray-500 dark:text-gray-400 text-center">
                    Aucune activité récente
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}