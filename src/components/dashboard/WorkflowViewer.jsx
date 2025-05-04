'use client';

import React from 'react';
import { CheckCircle, XCircle, Clock, ArrowRight, AlertCircle } from 'lucide-react';

export default function WorkflowViewer({ request }) {
  const getWorkflowSteps = () => {
    if (!request?.workflow) return [];

    const allSteps = [];

    // Étape de soumission
    allSteps.push({
      id: 'submitted',
      label: 'Requête soumise',
      status: 'completed',
      timestamp: request.createdAt,
      user: request.userName,
      service: 'Système'
    });

    // Étapes intermédiaires
    if (request.workflowHistory?.length > 0) {
      request.workflowHistory.forEach((step, index) => {
        allSteps.push({
          id: step.id,
          label: step.action === 'transfer' ? `Transférée à ${step.serviceName}` :
                 step.action === 'approve' ? `Approuvée par ${step.serviceName}` :
                 step.action === 'reject' ? `Rejetée par ${step.serviceName}` :
                 step.action,
          status: 'completed',
          timestamp: step.timestamp,
          user: step.userName,
          service: step.serviceName,
          comment: step.comment
        });
      });
    }

    // Étape actuelle
    if (request.status === 'in_progress' && request.currentServiceId) {
      allSteps.push({
        id: 'current',
        label: `En attente de traitement`,
        status: 'current',
        timestamp: null,
        service: request.currentServiceName || request.currentServiceId,
        comment: 'En attente de traitement'
      });
    }

    // Étape finale
    if (request.status === 'approved' || request.status === 'rejected') {
      allSteps.push({
        id: 'final',
        label: request.status === 'approved' ? 'Requête approuvée' : 'Requête rejetée',
        status: 'completed',
        timestamp: request.completedAt,
        user: request.finalProcessedBy,
        service: request.finalServiceName,
        comment: request.finalComment
      });
    }

    return allSteps;
  };

  const getStepIcon = (status) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-6 w-6 text-green-500" />;
      case 'current':
        return <Clock className="h-6 w-6 text-blue-500" />;
      case 'pending':
        return <AlertCircle className="h-6 w-6 text-yellow-500" />;
      case 'rejected':
        return <XCircle className="h-6 w-6 text-red-500" />;
      default:
        return <div className="h-6 w-6 rounded-full border-2 border-gray-300" />;
    }
  };

  const steps = getWorkflowSteps();

  return (
    <div className="flow-root">
      <ul className="-mb-8">
        {steps.map((step, stepIdx) => (
          <li key={step.id}>
            <div className="relative pb-8">
              {stepIdx !== steps.length - 1 ? (
                <span
                  className="absolute top-6 left-3 -ml-px h-full w-0.5 bg-gray-200"
                  aria-hidden="true"
                />
              ) : null}
              <div className="relative flex space-x-3">
                <div>
                  {getStepIcon(step.status)}
                </div>
                <div className="min-w-0 flex-1 pt-1.5">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-900">
                        {step.label}
                      </p>
                      <p className="text-sm text-gray-500">
                        {step.service}
                      </p>
                    </div>
                    {step.timestamp && (
                      <div className="text-sm text-gray-500">
                        {new Date(step.timestamp).toLocaleDateString('fr-FR', {
                          day: 'numeric',
                          month: 'short',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </div>
                    )}
                  </div>
                  {step.user && (
                    <p className="mt-1 text-sm text-gray-500">
                      Par: {step.user}
                    </p>
                  )}
                  {step.comment && (
                    <div className="mt-2 p-3 bg-gray-50 rounded-lg text-sm text-gray-700">
                      {step.comment}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}