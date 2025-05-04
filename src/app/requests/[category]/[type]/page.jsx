'use client';

import { use, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { db } from '@/lib/firebase';
import { doc, getDoc, addDoc, collection, serverTimestamp } from 'firebase/firestore';
import useAuth from '@/hooks/useAuth';

export default function RequestTypePage({ params }) {
  const router = useRouter();
  const { user } = useAuth();
  const unwrappedParams = use(params);

  const [requestType, setRequestType] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({});
  const [attachments, setAttachments] = useState([]);
  const [previewOpen, setPreviewOpen] = useState(false);

  useEffect(() => {
    const fetchRequestType = async () => {
      try {
        const requestTypeDoc = await getDoc(doc(db, 'requestTypes', unwrappedParams.type));
        if (!requestTypeDoc.exists()) {
          setError('Type de requête non trouvé');
          return;
        }

        const requestTypeData = requestTypeDoc.data();
        setRequestType(requestTypeData);

        // Initialize form with user data
        setFormData({
          name: user?.displayName || '',
          matricule: user?.matricule || '',
          email: user?.email || '',
          department: user?.department || '',
        });
      } catch (err) {
        console.error('Error fetching request type:', err);
        setError('Erreur lors du chargement des informations');
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      fetchRequestType();
    }
  }, [unwrappedParams.type, user]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const generatePreview = () => {
    if (!requestType) {
      return '<div class="text-gray-500">Aperçu de la lettre indisponible</div>';
    }

    // Template par défaut si aucun template n'est fourni
    const defaultTemplate = `
      <div style="max-width: 800px; margin: 0 auto; padding: 40px; font-family: 'Times New Roman', serif; font-size: 16px; line-height: 1.8; color: #000;">
        <div style="text-align: right; margin-bottom: 40px;">
          <div style="margin-bottom: 10px;">{{name}}</div>
          <div style="margin-bottom: 10px;">{{matricule}}</div>
          <div style="margin-bottom: 10px;">{{email}}</div>
          <div style="margin-bottom: 10px;">{{city}}, le {{date}}</div>
        </div>

        <div style="margin-bottom: 30px;">
          <div style="margin-bottom: 10px;">À Monsieur/Madame,</div>
          <div style="margin-bottom: 10px;">Le Responsable de {{department}}</div>
          <div style="margin-bottom: 10px;">{{institutionName}}</div>
        </div>

        <div style="text-decoration: underline; margin-bottom: 30px;">
          <strong>Objet :</strong> {{title}}
        </div>

        <div style="margin-bottom: 30px;">
          Monsieur/Madame,
        </div>

        <div style="margin-bottom: 30px; text-align: justify;">
          J'ai l'honneur de venir très respectueusement auprès de votre haute bienveillance
          soumettre la présente demande concernant {{purpose}}.
        </div>

        <div style="margin-bottom: 30px; text-align: justify;">
          {{bodyText}}
        </div>

        <div style="margin-bottom: 30px; text-align: justify;">
          Dans l'attente d'une suite favorable à ma requête, je vous prie d'agréer,
          Monsieur/Madame, l'expression de mes salutations distinguées.
        </div>

        <div style="margin-top: 50px; margin-bottom: 40px;">
          <div style="margin-bottom: 10px;"><strong>Pièces jointes :</strong></div>
          {{attachments}}
        </div>

        <div style="text-align: right; margin-top: 50px;">
          <div>{{signature}}</div>
        </div>
      </div>
    `;

    let template = requestType.template || defaultTemplate;

    const data = {
      ...formData,
      date: new Date().toLocaleDateString('fr-FR', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      }),
      city: 'Douala', // Ajoutez la ville appropriée
      institutionName: 'IUC', // Récupérez depuis les settings si disponible
      userName: user?.displayName || formData.name,
      userEmail: user?.email || formData.email,
      title: requestType.title,
      purpose: requestType.title,
      bodyText: 'Contenu de la demande approprié selon le type.',
      signature: user?.displayName || formData.name,
      attachments: attachments.length > 0
        ? attachments.map((file, index) => `<div>- ${file.name}</div>`).join('')
        : '<div>- Aucune pièce jointe</div>'
    };

    // Replace placeholders
    Object.keys(data).forEach(key => {
      const regex = new RegExp(`{{${key}}}`, 'g');
      template = template.replace(regex, data[key] || '');
    });

    // Cleanup empty placeholders
    template = template.replace(/{{[^}]+}}/g, '');

    return template;
  };

  const handleFileUpload = (e) => {
    const files = Array.from(e.target.files);
    setAttachments(prev => [...prev, ...files]);
  };

  const removeAttachment = (index) => {
    setAttachments(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate required fields
    const missingFields = [];
    requestType.requiredFields?.forEach(field => {
      if (!formData[field]) {
        missingFields.push(field);
      }
    });

    if (missingFields.length > 0) {
      setError(`Champs requis manquants: ${missingFields.join(', ')}`);
      return;
    }

    if (requestType.attachmentsRequired && attachments.length === 0) {
      setError('Les pièces jointes sont requises');
      return;
    }

    setSubmitting(true);
    setError('');

    try {
      // Ensure workflow is properly set
      const workflow = requestType.workflow && requestType.workflow.length > 0
        ? requestType.workflow
        : [{ serviceId: 'administration', order: 1 }]; // Default workflow

      // Create request
      const requestData = {
        typeId: unwrappedParams.type,
        type: requestType.title,
        category: unwrappedParams.category,
        userId: user.uid,
        userName: user.displayName,
        userEmail: user.email,
        status: 'pending',
        priority: 'normal',
        workflow: workflow,
        currentWorkflowStep: 0,
        currentServiceId: workflow[0]?.serviceId || 'administration', // Safe access
        formData: formData,
        attachments: [], // Will be uploaded separately
        template: generatePreview(),
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        estimatedProcessTime: requestType.estimatedProcessTime || 5
      };

      // Add to Firestore
      const docRef = await addDoc(collection(db, 'requests'), requestData);

      router.push('/student/history');
    } catch (err) {
      console.error('Error submitting request:', err);
      setError('Erreur lors de la soumission de la requête');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="flex items-center space-x-3">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-600"></div>
          <span className="text-gray-700">Chargement en cours...</span>
        </div>
      </div>
    );
  }

  if (!requestType) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="text-center">
          <div className="mb-4">
            <svg className="mx-auto h-16 w-16 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Type de requête non trouvé</h2>
          <p className="text-gray-600 mb-6">Le type de requête demandé n'existe pas ou a été supprimé.</p>
          <button
            onClick={() => router.push(`/requests/${unwrappedParams.category}`)}
            className="btn-primary"
          >
            Retour à la catégorie
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white py-8 lg:py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => router.push(`/requests/${unwrappedParams.category}`)}
            className="inline-flex items-center text-gray-600 hover:text-blue-600 transition-colors mb-4"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Retour à la catégorie
          </button>
          <h1 className="text-3xl font-bold text-gray-900">{requestType.title}</h1>
          <p className="mt-2 text-lg text-gray-600">{requestType.description}</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Form Section */}
          <div>
            <div className="bg-white rounded-lg shadow-lg border border-gray-200 p-6 lg:p-8">
              {error && (
                <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 text-red-700">
                  <div className="flex">
                    <div className="flex-shrink-0">
                      <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <div className="ml-3">
                      <p className="text-sm">{error}</p>
                    </div>
                  </div>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  {/* Name Field */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Nom complet <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name || ''}
                      onChange={handleInputChange}
                      required
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 transition-colors"
                      placeholder="Votre nom complet"
                    />
                  </div>

                  {/* Matricule Field */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Matricule <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="matricule"
                      value={formData.matricule || ''}
                      onChange={handleInputChange}
                      required
                      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 transition-colors"
                      placeholder="Votre matricule"
                    />
                  </div>
                </div>

                {/* Email Field */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Email <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email || ''}
                    onChange={handleInputChange}
                    required
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 transition-colors"
                    placeholder="votre@email.com"
                  />
                </div>

                {/* Dynamic Fields */}
                {requestType.requiredFields?.map(field => (
                  field !== 'name' && field !== 'matricule' && field !== 'email' && (
                    <div key={field}>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        {field.charAt(0).toUpperCase() + field.slice(1).replace(/([A-Z])/g, ' $1')} <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        name={field}
                        value={formData[field] || ''}
                        onChange={handleInputChange}
                        required
                        className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 transition-colors"
                        placeholder={`Entrez votre ${field}`}
                      />
                    </div>
                  )
                ))}

                {/* File Upload */}
                {requestType.attachmentsRequired && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Pièces jointes {requestType.attachmentsRequired && <span className="text-red-500">*</span>}
                    </label>
                    <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md hover:border-blue-400 transition-colors">
                      <div className="space-y-1 text-center">
                        <svg className="mx-auto h-12 w-12 text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 48 48" aria-hidden="true">
                          <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                        <div className="flex text-sm text-gray-600">
                          <label className="relative cursor-pointer bg-white rounded-md font-medium text-blue-600 hover:text-blue-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-blue-500">
                            <span>Télécharger un fichier</span>
                            <input
                              type="file"
                              multiple
                              onChange={handleFileUpload}
                              className="sr-only"
                              accept=".pdf,.doc,.docx"
                            />
                          </label>
                          <p className="pl-1">ou glisser-déposer</p>
                        </div>
                        <p className="text-xs text-gray-500">
                          PDF, DOC ou DOCX jusqu'à 10MB
                        </p>
                      </div>
                    </div>

                    {attachments.length > 0 && (
                      <div className="mt-4 space-y-2">
                        {attachments.map((file, index) => (
                          <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-md border border-gray-200">
                            <div className="flex items-center">
                              <svg className="w-6 h-6 text-gray-400 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                              </svg>
                              <span className="text-sm text-gray-700">{file.name}</span>
                            </div>
                            <button
                              type="button"
                              onClick={() => removeAttachment(index)}
                              className="text-red-600 hover:text-red-800 focus:outline-none"
                            >
                              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                              </svg>
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                <div className="flex flex-col sm:flex-row sm:justify-between gap-4 mt-8">
                  <button
                    type="button"
                    onClick={() => setPreviewOpen(!previewOpen)}
                    className="lg:hidden inline-flex items-center justify-center px-4 py-2 border border-blue-600 rounded-md shadow-sm text-sm font-medium text-blue-600 bg-white hover:bg-blue-50 transition-colors"
                  >
                    {previewOpen ? 'Masquer l\'aperçu' : 'Voir l\'aperçu'}
                  </button>

                  <button
                    type="submit"
                    disabled={submitting}
                    className="inline-flex items-center justify-center px-6 py-3 border border-transparent rounded-md shadow-sm text-base font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors sm:ml-auto"
                  >
                    {submitting ? (
                      <>
                        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Envoi en cours...
                      </>
                    ) : (
                      'Soumettre la demande'
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>

          {/* Preview Section */}
          <div className={`${previewOpen ? 'block' : 'hidden'} lg:block`}>
            <div className="bg-white rounded-lg shadow-lg border border-gray-200 sticky top-8">
            <div className="border-b border-gray-200 p-6">
                <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold text-gray-900">Aperçu de la lettre</h3>
                <button
                    type="button"
                    onClick={() => setPreviewOpen(!previewOpen)}
                    className="lg:hidden inline-flex items-center text-sm text-gray-600 hover:text-blue-600"
                >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                </button>
                </div>
            </div>
            <div className="p-6 h-[600px] overflow-y-auto">
                <div
                className="bg-white border border-gray-300 shadow-md"
                style={{ minHeight: '800px' }}
                >
                <div
                    className="p-10"
                    dangerouslySetInnerHTML={{ __html: generatePreview() }}
                />
                </div>
            </div>
            </div>
        </div>
        </div>
      </div>
    </div>
  );
}