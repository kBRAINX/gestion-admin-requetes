'use client';

import { useTheme } from '@/contexts/ThemeContext';

export default function WorkflowViewer({ request }) {
  const { colors, isDarkMode } = useTheme();

  // Exemple de workflow pour les requêtes
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
    if (request.workflow?.steps) {
      request.workflow.steps.forEach((step, index) => {
        allSteps.push({
          id: step.id,
          label: step.label,
          status: step.status,
          timestamp: step.timestamp,
          user: step.processedBy,
          service: step.serviceName,
          comment: step.comment
        });
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

  const steps = getWorkflowSteps();

  const getStepIcon = (status) => {
    switch (status) {
      case 'completed':
        return (
          <div className="flex items-center justify-center w-6 h-6 rounded-full" style={{ backgroundColor: '#10B981' }}>
            <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
        );
      case 'in_progress':
        return (
          <div className="flex items-center justify-center w-6 h-6 rounded-full" style={{ backgroundColor: colors.primary }}>
            <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
        );
      case 'pending':
        return (
          <div className="flex items-center justify-center w-6 h-6 rounded-full" style={{ backgroundColor: '#F59E0B' }}>
            <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
        );
      case 'rejected':
        return (
          <div className="flex items-center justify-center w-6 h-6 rounded-full" style={{ backgroundColor: '#EF4444' }}>
            <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </div>
        );
      default:
        return (
          <div className="flex items-center justify-center w-6 h-6 rounded-full" style={{ backgroundColor: colors.text.tertiary }}>
            <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
        );
    }
  };

  return (
    <div className="flow-root">
      <ul className="-mb-8">
        {steps.map((step, stepIdx) => (
          <li key={step.id}>
            <div className="relative pb-8">
              {stepIdx !== steps.length - 1 ? (
                <span
                  className="absolute top-6 left-3 -ml-px h-full w-0.5"
                  style={{ backgroundColor: colors.border }}
                  aria-hidden="true"
                />
              ) : null}
              <div className="relative flex space-x-3">
                <div>
                  {getStepIcon(step.status)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium" style={{ color: colors.text.primary }}>
                        {step.label}
                      </p>
                      <p className="text-sm" style={{ color: colors.text.secondary }}>
                        {step.service}
                      </p>
                    </div>
                    {step.timestamp && (
                      <div className="text-sm text-right" style={{ color: colors.text.tertiary }}>
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
                    <p className="mt-1 text-sm" style={{ color: colors.text.secondary }}>
                      Par: {step.user}
                    </p>
                  )}
                  {step.comment && (
                    <div
                      className="mt-2 p-3 rounded-lg text-sm"
                      style={{
                        backgroundColor: isDarkMode ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.05)',
                        color: colors.text.secondary
                      }}
                    >
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