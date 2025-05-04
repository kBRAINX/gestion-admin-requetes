'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import useAuth from '@/hooks/useAuth';
import { useTheme } from '@/contexts/ThemeContext';
import { useRequests } from '@/hooks/useRequests';
import Card from '@/components/common/Card';
import Button from '@/components/common/Button';
import Input from '@/components/common/Input';
import FileUploader from '@/components/common/FileUploader';

export default function RequestFormPage({ params }) {
  const router = useRouter();
  const { user } = useAuth();
  const { colors, isDarkMode } = useTheme();
  const { createRequest } = useRequests();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({});
  const [attachments, setAttachments] = useState([]);
  const [previewOpen, setPreviewOpen] = useState(false);

  const requestTemplates = {
    'publication-note': {
      title: 'Demande de publication de note',
      requiredFields: ['courseCode', 'department'],
      template: (data) => `
        <div class="request-template">
          <div class="header">
            <div class="sender-info">
              <p>${user?.displayName || formData.name}</p>
              <p>${user?.matricule || formData.matricule}</p>
              <p>${data.department}</p>
            </div>
            <div class="recipient-info">
              <p>À Monsieur le Responsable de UE ${data.courseCode}</p>
            </div>
          </div>
          <div class="subject">
            <p>OBJET : Demande de publication de la note de CC(SN) ${data.courseCode}</p>
          </div>
          <div class="content">
            <p>Monsieur,</p>
            <p>J'ai l'honneur de venir très respectueusement auprès de votre haute bienveillance solliciter une demande de publication de ma note de CC ${data.courseCode}.</p>
            <p>En effet, je suis étudiant(e) inscrit(e) en ${data.department}, ayant assisté à tous les examens, après publication des notes de CC(SN), j'ai eu à vérifier avec ardeur, et constater que mon nom n'a pas été affiché, c'est pourquoi je m'incline auprès de vous, dans lequel vous avez le pouvoir de l'afficher, de plus, espérant que mon problème aura une solution.</p>
            <p>Dans l'attente d'une suite favorable, Veuillez agréer Monsieur, mes expressions les plus profondes du cœur.</p>
          </div>
          <div class="attachments">
            <p>PIÈCES JOINTES :</p>
            <p>-Photocopie de reçu de paiement de pension.</p>
          </div>
          <div class="signature">
            <p>${new Date().toLocaleDateString('fr-FR')}</p>
            <p>Signature</p>
          </div>
        </div>
      `,
    },
    'rectification-matricule': {
      title: 'Demande de rectification de matricule',
      requiredFields: ['courseCode', 'department', 'wrongMatricule', 'correctMatricule'],
      template: (data) => `
        <div class="request-template">
          <div class="header">
            <div class="sender-info">
              <p>${user?.displayName || formData.name}</p>
              <p>${data.wrongMatricule}</p>
              <p>${data.department}</p>
            </div>
            <div class="recipient-info">
              <p>À Monsieur le Responsable de UE ${data.courseCode}</p>
            </div>
          </div>
          <div class="subject">
            <p>OBJET : Demande de rectification de mon matricule, au lieu de ${data.wrongMatricule}, c'est ${data.correctMatricule}</p>
          </div>
          <div class="content">
            <p>Monsieur,</p>
            <p>J'ai l'honneur de venir très respectueusement auprès de votre haute bienveillance solliciter une demande de rectification de mon matricule.</p>
            <p>En effet, je suis étudiant(e) inscrit(e) en ${data.department}, ayant assisté à tous les examens de CC, après publication des notes, j'ai eu à vérifier avec ardeur, et constater que mon matricule a été rédigé avec erreur, c'est pourquoi je m'incline auprès de vous, dans lequel vous avez le pouvoir de le rectifier, de plus, espérant que mon problème aura une solution.</p>
            <p>Dans l'attente d'une suite favorable, Veuillez agréer Monsieur, mes expressions les plus profondes du cœur.</p>
          </div>
          <div class="attachments">
            <p>PIÈCES JOINTES :</p>
            <p>-Photocopie de reçu de paiement de pension.</p>
          </div>
          <div class="signature">
            <p>${new Date().toLocaleDateString('fr-FR')}</p>
            <p>Signature</p>
          </div>
        </div>
      `,
    },
    // Ajoutez ici les autres templates...
  };

  const currentTemplate = requestTemplates[params.type];

  useEffect(() => {
    if (!currentTemplate) {
      router.push(`/requests/${params.category}`);
    }

    // Initialize form with user data
    setFormData({
      name: user?.displayName || '',
      matricule: user?.matricule || '',
      email: user?.email || '',
    });
  }, [currentTemplate, user]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleFileUpload = (e) => {
    const files = Array.from(e.target.files);
    setAttachments(prev => [...prev, ...files]);
  };

  const removeAttachment = (index) => {
    setAttachments(prev => prev.filter((_, i) => i !== index));
  };

  const generatePreview = () => {
    if (!currentTemplate) return '';
    return currentTemplate.template(formData);
  };

  const validateForm = () => {
    const errors = [];

    currentTemplate.requiredFields.forEach(field => {
      if (!formData[field]) {
        errors.push(`${field} est requis`);
      }
    });

    if (currentTemplate.requiredAttachments && attachments.length === 0) {
      errors.push('Les pièces jointes sont requises');
    }

    return errors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const errors = validateForm();
    if (errors.length > 0) {
      setError(errors.join(', '));
      return;
    }

    setLoading(true);
    setError('');

    try {
      await createRequest({
        type: currentTemplate.title,
        category: params.category,
        formData,
        attachments,
        template: generatePreview(),
      });

      router.push('/student/history');
    } catch (err) {
      setError('Erreur lors de la soumission de la requête');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (!currentTemplate) {
    return null;
  }

  return (
    <div className="min-h-screen p-6" style={{ backgroundColor: colors.background.secondary }}>
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <Button
            variant="secondary"
            onClick={() => router.push(`/requests/${params.category}`)}
            style={{ borderColor: colors.border }}
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Retour
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Form */}
          <div>
            <Card>
              <div className="p-6">
                <h1 className="text-2xl font-bold mb-6" style={{ color: colors.text.primary }}>
                  {currentTemplate.title}
                </h1>

                {error && (
                  <div className="mb-4 p-3 rounded-md" style={{ backgroundColor: '#FEE2E2', color: '#991B1B' }}>
                    {error}
                  </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                  <Input
                    label="Nom complet"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    required
                  />

                  <Input
                    label="Matricule"
                    name="matricule"
                    value={formData.matricule}
                    onChange={handleInputChange}
                    required
                  />

                  {currentTemplate.requiredFields.includes('courseCode') && (
                    <Input
                      label="Code UE"
                      name="courseCode"
                      value={formData.courseCode || ''}
                      onChange={handleInputChange}
                      required
                    />
                  )}

                  {currentTemplate.requiredFields.includes('department') && (
                    <Input
                      label="Département"
                      name="department"
                      value={formData.department || ''}
                      onChange={handleInputChange}
                      required
                    />
                  )}

                  {currentTemplate.requiredFields.includes('wrongMatricule') && (
                    <Input
                      label="Matricule erroné"
                      name="wrongMatricule"
                      value={formData.wrongMatricule || ''}
                      onChange={handleInputChange}
                      required
                    />
                  )}

                  {currentTemplate.requiredFields.includes('correctMatricule') && (
                    <Input
                      label="Matricule correct"
                      name="correctMatricule"
                      value={formData.correctMatricule || ''}
                      onChange={handleInputChange}
                      required
                    />
                  )}

                  {/* File Upload */}
                  <div>
                    <label className="block text-sm font-medium mb-2" style={{ color: colors.text.primary }}>
                      Pièces jointes
                    </label>
                    <FileUploader onChange={handleFileUpload} />

                    {attachments.length > 0 && (
                      <div className="mt-3 space-y-2">
                        {attachments.map((file, index) => (
                          <div key={index} className="flex items-center justify-between p-2 rounded" style={{ backgroundColor: isDarkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)' }}>
                            <span className="text-sm" style={{ color: colors.text.primary }}>{file.name}</span>
                            <button
                              type="button"
                              onClick={() => removeAttachment(index)}
                              className="text-red-600 hover:text-red-800"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                              </svg>
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="flex justify-between pt-4">
                    <Button
                      type="button"
                      variant="secondary"
                      onClick={() => setPreviewOpen(!previewOpen)}
                      style={{ borderColor: colors.border }}
                    >
                      Prévisualiser
                    </Button>
                    <Button
                      type="submit"
                      disabled={loading}
                      style={{ backgroundColor: colors.primary }}
                      className="text-white"
                    >
                      {loading ? 'Envoi en cours...' : 'Soumettre'}
                    </Button>
                  </div>
                </form>
              </div>
            </Card>
          </div>

          {/* Preview */}
          <div className={`${previewOpen ? 'block' : 'hidden'} lg:block`}>
            <Card>
              <div className="p-6">
                <h2 className="text-lg font-semibold mb-4" style={{ color: colors.text.primary }}>
                  Aperçu de la lettre
                </h2>
                <div
                  className="prose max-w-none p-4 rounded border overflow-auto"
                  style={{
                    backgroundColor: isDarkMode ? '#1E293B' : '#FFFFFF',
                    borderColor: colors.border,
                    color: colors.text.primary,
                    maxHeight: '600px'
                  }}
                  dangerouslySetInnerHTML={{ __html: generatePreview() }}
                />
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}