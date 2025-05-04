import { useState } from 'react';
import Link from 'next/link';
import {
  FileText,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  ArrowRight
} from 'lucide-react';

export default function RequestsOverview({ requests = [] }) {
  const [activeTab, setActiveTab] = useState('pending');

  const stats = {
    total: requests.length,
    pending: requests.filter(r => r.status === 'submitted').length,
    inReview: requests.filter(r => r.status === 'in_review').length,
    approved: requests.filter(r => r.status === 'approved').length,
    rejected: requests.filter(r => r.status === 'rejected').length,
  };

  const getStatusColor = (status) => {
    const colors = {
      submitted: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
      in_review: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
      approved: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
      rejected: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
      completed: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200',
    };
    return colors[status] || colors.submitted;
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'submitted':
        return <Clock className="h-5 w-5" />;
      case 'in_review':
        return <AlertCircle className="h-5 w-5" />;
      case 'approved':
        return <CheckCircle className="h-5 w-5" />;
      case 'rejected':
        return <XCircle className="h-5 w-5" />;
      default:
        return <FileText className="h-5 w-5" />;
    }
  };

  const filteredRequests = requests.filter(request => {
    if (activeTab === 'pending') return request.status === 'submitted';
    if (activeTab === 'inReview') return request.status === 'in_review';
    return true;
  });

  return (
    <div className="bg-white dark:bg-gray-800 shadow rounded-lg">
      <div className="p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white">
            État des demandes
          </h3>
          <Link
            href="/dashboard/requests"
            className="inline-flex items-center text-sm font-medium text-blue-600 hover:text-blue-500"
          >
            Voir tout
            <ArrowRight className="ml-2 h-4 w-4" />
          </Link>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
          <div className="text-center">
            <p className="text-sm text-gray-500 dark:text-gray-400">Total</p>
            <p className="text-2xl font-semibold text-gray-900 dark:text-white">{stats.total}</p>
          </div>
          <div className="text-center">
            <p className="text-sm text-gray-500 dark:text-gray-400">En attente</p>
            <p className="text-2xl font-semibold text-yellow-600">{stats.pending}</p>
          </div>
          <div className="text-center">
            <p className="text-sm text-gray-500 dark:text-gray-400">En cours</p>
            <p className="text-2xl font-semibold text-blue-600">{stats.inReview}</p>
          </div>
          <div className="text-center">
            <p className="text-sm text-gray-500 dark:text-gray-400">Approuvées</p>
            <p className="text-2xl font-semibold text-green-600">{stats.approved}</p>
          </div>
          <div className="text-center">
            <p className="text-sm text-gray-500 dark:text-gray-400">Rejetées</p>
            <p className="text-2xl font-semibold text-red-600">{stats.rejected}</p>
          </div>
        </div>

        {/* Tabs */}
        <div className="border-b border-gray-200 dark:border-gray-700 mb-4">
          <nav className="-mb-px flex space-x-8">
            {['pending', 'inReview', 'all'].map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`${
                  activeTab === tab
                    ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                    : 'border-transparent text-gray-500 dark:text-gray-400 hover:border-gray-300 hover:text-gray-700 dark:hover:text-gray-300'
                } whitespace-nowrap border-b-2 py-2 px-1 text-sm font-medium`}
              >
                {tab === 'pending' && 'En attente'}
                {tab === 'inReview' && 'En cours'}
                {tab === 'all' && 'Toutes'}
              </button>
            ))}
          </nav>
        </div>

        {/* Requests list */}
        <div className="space-y-4">
          {filteredRequests.slice(0, 5).map((request) => (
            <div
              key={request.id}
              className="flex items-center p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            >
              <div className="flex-shrink-0 mr-4">
                <div className={`p-2 rounded-lg ${getStatusColor(request.status).split(' ')[0]} ${getStatusColor(request.status).split(' ')[0]}-opacity-10`}>
                  {getStatusIcon(request.status)}
                </div>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                  {request.title || request.type}
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {new Date(request.createdAt?.toDate()).toLocaleDateString('fr-FR', {
                    day: 'numeric',
                    month: 'short',
                    year: 'numeric'
                  })}
                </p>
              </div>
              <div className="ml-4">
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(request.status)}`}>
                  {request.status === 'submitted' && 'En attente'}
                  {request.status === 'in_review' && 'En cours'}
                  {request.status === 'approved' && 'Approuvée'}
                  {request.status === 'rejected' && 'Rejetée'}
                  {request.status === 'completed' && 'Terminée'}
                </span>
              </div>
            </div>
          ))}

          {filteredRequests.length === 0 && (
            <div className="text-center py-8">
              <FileText className="h-12 w-12 text-gray-400 mx-auto mb-2" />
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Aucune demande {activeTab !== 'all' && activeTab === 'pending' ? 'en attente' : activeTab === 'inReview' ? 'en cours' : ''}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}