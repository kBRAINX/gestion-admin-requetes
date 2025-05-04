'use client';

import React from 'react';
import Modal from '@/components/common/Modal';
import WorkflowViewer from '@/components/dashboard/WorkflowViewer';
import Button from '@/components/common/Button';
import { Download, CheckCircle, XCircle, Clock } from 'lucide-react';

export default function RequestDetailModal({ isOpen, onClose, request }) {
  if (!request) return null;

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
        <div className="border-b border-gray-200 pb-4">
          <div className="flex justify-between items-start">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">
                {request.type}
              </h3>
              <p className="text-sm text-gray-500">
                ID: {request.id}
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(request.status)}`}>
                {getStatusLabel(request.status)}
              </span>
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                request.priority === 'high'
                  ? 'bg-red-100 text-red-800'
                  : request.priority === 'medium'
                  ? 'bg-yellow-100 text-yellow-800'
                  : 'bg-gray-100 text-gray-800'
              }`}>
                {getPriorityLabel(request.priority)}
              </span>
            </div>
          </div>
        </div>

        {/* Request Information */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h4 className="text-sm font-medium text-gray-900 mb-3">
              Informations de base
            </h4>
            <div className="space-y-3">
              <div>
                <label className="text-sm text-gray-500">Demandeur</label>
                <p className="font-medium text-gray-900">{request.userName}</p>
              </div>
              <div>
                <label className="text-sm text-gray-500">Email</label>
                <p className="font-medium text-gray-900">{request.userEmail}</p>
              </div>
              <div>
                <label className="text-sm text-gray-500">Date de soumission</label>
                <p className="font-medium text-gray-900">
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
            <h4 className="text-sm font-medium text-gray-900 mb-3">
              Détails de la requête
            </h4>
            <div className="space-y-3">
              <div>
                <label className="text-sm text-gray-500">Catégorie</label>
                <p className="font-medium text-gray-900">{request.category}</p>
              </div>
              <div>
                <label className="text-sm text-gray-500">Service concerné</label>
                <p className="font-medium text-gray-900">{request.serviceName}</p>
              </div>
              <div>
                <label className="text-sm text-gray-500">Temps estimé</label>
                <p className="font-medium text-gray-900">
                  {request.estimatedProcessTime} jours
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Request Description */}
        <div>
          <h4 className="text-sm font-medium text-gray-900 mb-3">
            Description
          </h4>
          <div className="p-4 bg-gray-50 rounded-lg text-gray-700 whitespace-pre-wrap">
            {request.description || 'Aucune description fournie'}
          </div>
        </div>

        {/* Attachments */}
        {request.attachments && request.attachments.length > 0 && (
          <div>
            <h4 className="text-sm font-medium text-gray-900 mb-3">
              Pièces jointes
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {request.attachments.map((attachment, index) => (
                <div
                  key={index}
                  className="flex items-center p-3 border border-gray-200 rounded-lg"
                >
                  <Download className="h-5 w-5 text-gray-400 mr-3" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {attachment.name}
                    </p>
                    <p className="text-xs text-gray-500">
                      {(attachment.size / 1024).toFixed(1)} KB
                    </p>
                  </div>
                  <Button
                    size="sm"
                    variant="secondary"
                    onClick={() => window.open(attachment.url, '_blank')}
                    className="ml-4"
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
            <h4 className="text-sm font-medium text-gray-900 mb-3">
              Commentaires
            </h4>
            <div className="space-y-3">
              {request.comments.map((comment, index) => (
                <div
                  key={index}
                  className="p-4 bg-gray-50 rounded-lg"
                >
                  <div className="flex justify-between items-start mb-2">
                    <p className="font-medium text-gray-900">
                      {comment.userName}
                    </p>
                    <p className="text-sm text-gray-500">
                      {new Date(comment.createdAt).toLocaleDateString('fr-FR', {
                        day: 'numeric',
                        month: 'short',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </p>
                  </div>
                  <p className="text-gray-700">{comment.text}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Workflow Timeline */}
        <div>
          <h4 className="text-sm font-medium text-gray-900 mb-3">
            Suivi du workflow
          </h4>
          <WorkflowViewer request={request} />
        </div>

        {/* Actions */}
        <div className="flex justify-end space-x-3 border-t border-gray-200 pt-4">
          <Button
            variant="secondary"
            onClick={onClose}
          >
            Fermer
          </Button>
          {request.status === 'pending' && request.canEdit && (
            <Button
              variant="primary"
              className="bg-blue-600 text-white"
            >
              Modifier la requête
            </Button>
          )}
        </div>
      </div>
    </Modal>
  );
}