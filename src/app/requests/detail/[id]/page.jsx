'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { useRequests } from '@/hooks/useRequests';
import { useTheme } from '@/contexts/ThemeContext';
import Card from '@/components/common/Card';
import Button from '@/components/common/Button';
import WorkflowViewer from '@/components/dashboard/WorkflowViewer';

export default function RequestDetailsPage({ params }) {
  const router = useRouter();
  const { user } = useAuth();
  const { getRequest, processRequest, loading } = useRequests();
  const { colors, isDarkMode } = useTheme();
  const [request, setRequest] = useState(null);
  const [showCommentForm, setShowCommentForm] = useState(false);
  const [comment, setComment] = useState('');

  useEffect(() => {
    const fetchRequest = async () => {
      try {
        const requestData = await getRequest(params.id);
        setRequest(requestData);
      } catch (error) {
        console.error('Error fetching request:', error);
      }
    };

    if (params.id) {
      fetchRequest();
    }
  }, [params.id]);

  const getStatusColor = (status) => {
    switch (status) {
      case 'approved':
        return '#10B981'; // green
      case 'rejected':
        return '#EF4444'; // red
      case 'in_progress':
        return '#3B82F6'; // blue
      case 'pending':
        return '#F59E0B'; // yellow
      default:
        return colors.text.tertiary;
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

  const getPriorityLabel = (priority) => {
    const priorityLabels = {
      high: 'Haute',
      medium: 'Moyenne',
      low: 'Basse',
    };
    return priorityLabels[priority] || priority;
  };

  const handleAddComment = async () => {
    if (!comment.trim()) return;

    try {
      await processRequest(request.id, 'comment', comment);
      setComment('');
      setShowCommentForm(false);
      // Recharger la requête
      const updatedRequest = await getRequest(request.id);
      setRequest(updatedRequest);
    } catch (error) {
      console.error('Error adding comment:', error);
    }
  };

  if (loading || !request) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: colors.background.primary }}>
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-6" style={{ backgroundColor: colors.background.secondary }}>
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <Button
            variant="secondary"
            onClick={() => router.back()}
            style={{ borderColor: colors.border }}
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Retour
          </Button>
          <h1 className="text-2xl font-bold" style={{ color: colors.text.primary }}>
            Détails de la requête #{request.id.slice(0, 8)}
          </h1>
        </div>

        {/* Request Overview */}
        <Card className="mb-6">
          <div className="p-6">
            <div className="flex justify-between items-start mb-6">
              <div>
                <h3 className="text-lg font-semibold" style={{ color: colors.text.primary }}>
                  {request.type}
                </h3>
                <p className="text-sm mt-1" style={{ color: colors.text.secondary }}>
                  Demandé par {request.userName} • {new Date(request.createdAt).toLocaleDateString('fr-FR', {
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </p>
              </div>
              <div className="flex items-center space-x-3">
                <span
                  className="px-3 py-1 rounded-full text-sm font-medium"
                  style={{
                    backgroundColor: `${getStatusColor(request.status)}20`,
                    color: getStatusColor(request.status)
                  }}
                >
                  {getStatusLabel(request.status)}
                </span>
                <span
                  className={`px-3 py-1 rounded-full text-sm font-medium ${
                    request.priority === 'high'
                      ? 'bg-red-100 text-red-800 dark:bg-red-800 dark:text-red-100'
                      : request.priority === 'medium'
                      ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-800 dark:text-yellow-100'
                      : 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-100'
                  }`}
                >
                  {getPriorityLabel(request.priority)}
                </span>
              </div>
            </div>

            {/* Request Details */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div>
                <h4 className="text-sm font-medium mb-2" style={{ color: colors.text.primary }}>
                  Description
                </h4>
                <div
                  className="p-4 rounded-lg"
                  style={{
                    backgroundColor: isDarkMode ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.05)',
                    color: colors.text.secondary
                  }}
                >
                  {request.description || 'Aucune description fournie'}
                </div>
              </div>
              <div>
                <h4 className="text-sm font-medium mb-2" style={{ color: colors.text.primary }}>
                  Informations
                </h4>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span style={{ color: colors.text.tertiary }}>Catégorie</span>
                    <span style={{ color: colors.text.primary }}>{request.category}</span>
                  </div>
                  <div className="flex justify-between">
                    <span style={{ color: colors.text.tertiary }}>Service responsable</span>
                    <span style={{ color: colors.text.primary }}>{request.serviceName}</span>
                  </div>
                  <div className="flex justify-between">
                    <span style={{ color: colors.text.tertiary }}>Temps estimé</span>
                    <span style={{ color: colors.text.primary }}>{request.estimatedProcessTime} jours</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Actions for authorized users */}
            {request.canProcess && (
              <div className="border-t pt-4" style={{ borderColor: colors.border }}>
                <div className="flex space-x-3">
                  {request.status === 'pending' && (
                    <>
                      <Button
                        variant="primary"
                        onClick={() => processRequest(request.id, 'approve')}
                        style={{ backgroundColor: '#10B981', color: '#FFFFFF' }}
                      >
                        Approuver
                      </Button>
                      <Button
                        variant="danger"
                        onClick={() => processRequest(request.id, 'reject')}
                      >
                        Rejeter
                      </Button>
                      <Button
                        variant="secondary"
                        onClick={() => setShowCommentForm(!showCommentForm)}
                        style={{ borderColor: colors.border }}
                      >
                        Ajouter un commentaire
                      </Button>
                    </>
                  )}
                </div>
              </div>
            )}
          </div>
        </Card>

        {/* Comment Form */}
        {showCommentForm && (
          <Card className="mb-6">
            <div className="p-6">
              <h4 className="text-sm font-medium mb-3" style={{ color: colors.text.primary }}>
                Ajouter un commentaire
              </h4>
              <textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                className="w-full p-3 rounded-lg border mb-3"
                style={{
                  backgroundColor: colors.background.primary,
                  borderColor: colors.border,
                  color: colors.text.primary
                }}
                rows="3"
                placeholder="Écrivez votre commentaire..."
              />
              <div className="flex justify-end space-x-3">
                <Button
                  variant="secondary"
                  onClick={() => setShowCommentForm(false)}
                  style={{ borderColor: colors.border }}
                >
                  Annuler
                </Button>
                <Button
                  variant="primary"
                  onClick={handleAddComment}
                  style={{ backgroundColor: colors.primary }}
                  className="text-white"
                >
                  Publier
                </Button>
              </div>
            </div>
          </Card>
        )}

        {/* Workflow Timeline */}
        <Card className="mb-6">
          <div className="p-6">
            <h4 className="text-sm font-medium mb-6" style={{ color: colors.text.primary }}>
              Suivi du workflow
            </h4>
            <WorkflowViewer request={request} />
          </div>
        </Card>

        {/* Attachments */}
        {request.attachments && request.attachments.length > 0 && (
          <Card className="mb-6">
            <div className="p-6">
              <h4 className="text-sm font-medium mb-6" style={{ color: colors.text.primary }}>
                Pièces jointes
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {request.attachments.map((attachment, index) => (
                  <div
                    key={index}
                    className="flex items-center p-3 rounded-lg border"
                    style={{ borderColor: colors.border }}
                  >
                    <svg className="w-5 h-5 mr-3" style={{ color: colors.text.tertiary }} fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z" clipRule="evenodd" />
                    </svg>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate" style={{ color: colors.text.primary }}>
                        {attachment.name}
                      </p>
                      <p className="text-xs" style={{ color: colors.text.tertiary }}>
                        {(attachment.size / 1024).toFixed(1)} KB
                      </p>
                    </div>
                    <Button
                      size="sm"
                      variant="secondary"
                      onClick={() => window.open(attachment.url, '_blank')}
                      style={{ marginLeft: '8px' }}
                    >
                      Télécharger
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          </Card>
        )}
      </div>
    </div>
  );
}