'use client';

import { useTheme } from '@/contexts/ThemeContext';
import Modal from '@/components/common/Modal';
import WorkflowViewer from '@/components/dashboard/WorkflowViewer';
import Button from '@/components/common/Button';

export default function RequestDetailModal({ isOpen, onClose, request }) {
  const { colors, isDarkMode } = useTheme();

  if (!request) return null;

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

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Détails de la requête"
      maxWidth="4xl"
    >
      <div className="space-y-6">
        {/* Header */}
        <div className="border-b pb-4" style={{ borderColor: colors.border }}>
          <div className="flex justify-between items-start">
            <div>
              <h3 className="text-lg font-semibold" style={{ color: colors.text.primary }}>
                {request.type}
              </h3>
              <p className="text-sm" style={{ color: colors.text.secondary }}>
                ID: {request.id}
              </p>
            </div>
            <div className="flex items-center space-x-4">
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
        </div>

        {/* Request Information */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h4 className="text-sm font-medium mb-3" style={{ color: colors.text.primary }}>
              Informations de base
            </h4>
            <div className="space-y-3">
              <div>
                <label className="text-sm" style={{ color: colors.text.tertiary }}>Demandeur</label>
                <p className="font-medium" style={{ color: colors.text.primary }}>{request.userName}</p>
              </div>
              <div>
                <label className="text-sm" style={{ color: colors.text.tertiary }}>Email</label>
                <p className="font-medium" style={{ color: colors.text.primary }}>{request.userEmail}</p>
              </div>
              <div>
                <label className="text-sm" style={{ color: colors.text.tertiary }}>Date de soumission</label>
                <p className="font-medium" style={{ color: colors.text.primary }}>
                  {new Date(request.createdAt).toLocaleDateString('fr-FR', {
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </p>
              </div>
            </div>
          </div>

          <div>
            <h4 className="text-sm font-medium mb-3" style={{ color: colors.text.primary }}>
              Détails de la requête
            </h4>
            <div className="space-y-3">
              <div>
                <label className="text-sm" style={{ color: colors.text.tertiary }}>Catégorie</label>
                <p className="font-medium" style={{ color: colors.text.primary }}>{request.category}</p>
              </div>
              <div>
                <label className="text-sm" style={{ color: colors.text.tertiary }}>Service concerné</label>
                <p className="font-medium" style={{ color: colors.text.primary }}>{request.serviceName}</p>
              </div>
              <div>
                <label className="text-sm" style={{ color: colors.text.tertiary }}>Temps estimé</label>
                <p className="font-medium" style={{ color: colors.text.primary }}>
                  {request.estimatedProcessTime} jours
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Request Description */}
        <div>
          <h4 className="text-sm font-medium mb-3" style={{ color: colors.text.primary }}>
            Description
          </h4>
          <div
            className="p-4 rounded-lg whitespace-pre-wrap"
            style={{
              backgroundColor: isDarkMode ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.05)',
              color: colors.text.secondary
            }}
          >
            {request.description || 'Aucune description fournie'}
          </div>
        </div>

        {/* Attachments */}
        {request.attachments && request.attachments.length > 0 && (
          <div>
            <h4 className="text-sm font-medium mb-3" style={{ color: colors.text.primary }}>
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
        )}

        {/* Comments */}
        {request.comments && request.comments.length > 0 && (
          <div>
            <h4 className="text-sm font-medium mb-3" style={{ color: colors.text.primary }}>
              Commentaires
            </h4>
            <div className="space-y-3">
              {request.comments.map((comment, index) => (
                <div
                  key={index}
                  className="p-4 rounded-lg"
                  style={{ backgroundColor: isDarkMode ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.05)' }}
                >
                  <div className="flex justify-between items-start mb-2">
                    <p className="font-medium" style={{ color: colors.text.primary }}>
                      {comment.userName}
                    </p>
                    <p className="text-sm" style={{ color: colors.text.tertiary }}>
                      {new Date(comment.createdAt).toLocaleDateString('fr-FR', {
                        day: 'numeric',
                        month: 'short',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </p>
                  </div>
                  <p style={{ color: colors.text.secondary }}>{comment.text}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Workflow Timeline */}
        <div>
          <h4 className="text-sm font-medium mb-3" style={{ color: colors.text.primary }}>
            Suivi du workflow
          </h4>
          <WorkflowViewer request={request} />
        </div>

        {/* Actions */}
        <div className="flex justify-end space-x-3 border-t pt-4" style={{ borderColor: colors.border }}>
          <Button
            variant="secondary"
            onClick={onClose}
            style={{ borderColor: colors.border }}
          >
            Fermer
          </Button>
          {request.status === 'pending' && request.canEdit && (
            <Button
              variant="primary"
              style={{ backgroundColor: colors.primary }}
              className="text-white"
            >
              Modifier la requête
            </Button>
          )}
        </div>
      </div>
    </Modal>
  );
}