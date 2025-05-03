'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { db, auth } from '@/lib/firebase';
import { doc, setDoc, getDoc, serverTimestamp } from 'firebase/firestore';
import { createUserWithEmailAndPassword, updateProfile } from 'firebase/auth';

export default function SetupPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [setupComplete, setSetupComplete] = useState(false);

  // Institution info
  const [institutionName, setInstitutionName] = useState('');
  const [institutionLogo, setInstitutionLogo] = useState('');
  const [institutionEmail, setInstitutionEmail] = useState('');

  // Admin info
  const [adminName, setAdminName] = useState('');
  const [adminEmail, setAdminEmail] = useState('');
  const [adminPassword, setAdminPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // Check if setup is already complete
  useEffect(() => {
    const checkSetup = async () => {
      try {
        const settingsDoc = await getDoc(doc(db, 'settings', 'app'));
        if (settingsDoc.exists() && settingsDoc.data().setupCompleted) {
          setSetupComplete(true);
          router.push('/');
        }
      } catch (err) {
        console.error('Error checking setup status:', err);
      }
    };

    checkSetup();
  }, [router]);

  const handleSubmitInstitution = (e) => {
    e.preventDefault();

    if (!institutionName || !institutionEmail) {
      setError('Veuillez remplir tous les champs obligatoires');
      return;
    }

    setStep(2);
    setError('');
  };

  const handleSubmitAdmin = async (e) => {
    e.preventDefault();

    if (!adminName || !adminEmail || !adminPassword) {
      setError('Veuillez remplir tous les champs obligatoires');
      return;
    }

    if (adminPassword !== confirmPassword) {
      setError('Les mots de passe ne correspondent pas');
      return;
    }

    setLoading(true);
    setError('');

    try {
      // Create super admin user
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        adminEmail,
        adminPassword
      );

      await updateProfile(userCredential.user, {
        displayName: adminName
      });

      // Create user document
      await setDoc(doc(db, 'users', userCredential.user.uid), {
        id: userCredential.user.uid,
        email: adminEmail,
        displayName: adminName,
        role: 'superadmin',
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        isActive: true
      });

      // Create default settings
      await setDoc(doc(db, 'settings', 'app'), {
        setupCompleted: true,
        institutionName,
        logo: institutionLogo || '',
        contactEmail: institutionEmail,
        theme: {
          primaryColor: '#3B82F6',
          secondaryColor: '#10B981',
          darkMode: false
        },
        emailNotifications: true,
        systemLanguage: 'fr',
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });

      // Create basic service structure
      const defaultServices = [
        {
          id: 'administration',
          name: 'Administration Générale',
          description: 'Service principal d\'administration',
          headId: userCredential.user.uid,
          members: [userCredential.user.uid],
          permissions: ['manage_all'],
          canReceiveRequests: true,
          email: institutionEmail,
          isActive: true,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp()
        },
        {
          id: 'scolarite',
          name: 'Service de Scolarité',
          description: 'Gestion des dossiers étudiants et des notes',
          headId: '',
          members: [],
          permissions: ['manage_students', 'manage_grades'],
          canReceiveRequests: true,
          email: '',
          isActive: true,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp()
        }
      ];

      // Batch write services
      for (const service of defaultServices) {
        await setDoc(doc(db, 'services', service.id), service);
      }

      // Create basic request types from templates
      const defaultRequestTypes = [
        {
          id: 'publication-note',
          title: 'Demande de publication de note',
          category: 'scolarite',
          description: 'Demande de publication d\'une note manquante',
          template: `
            <div class="request-template">
              <div class="header">
                <div class="sender-info">
                  <p>{{userName}}</p>
                  <p>{{userMatricule}}</p>
                  <p>{{userDepartment}}</p>
                </div>
                <div class="recipient-info">
                  <p>À Monsieur le Responsable de UE {{courseCode}}</p>
                </div>
              </div>
              <div class="subject">
                <p>OBJET : Demande de publication de la note de CC(SN) {{courseCode}}</p>
              </div>
              <div class="content">
                <p>Monsieur,</p>
                <p>J'ai l'honneur de venir très respectueusement auprès de votre haute bienveillance solliciter une demande de publication de ma note de CC {{courseCode}}.</p>
                <p>En effet, je suis étudiant(e) inscrit(e) en {{department}}, ayant assisté à tous les examens, après publication des notes de CC(SN), j'ai eu à vérifier avec ardeur, et constater que mon nom n'a pas été affiché, c'est pourquoi je m'incline auprès de vous, dans lequel vous avez le pouvoir de l'afficher, de plus, espérant que mon problème aura une solution.</p>
                <p>Dans l'attente d'une suite favorable, Veuillez agréer Monsieur, mes expressions les plus profondes du cœur.</p>
              </div>
              <div class="attachments">
                <p>PIÈCES JOINTES :</p>
                <p>-Photocopie de reçu de paiement de pension.</p>
              </div>
              <div class="signature">
                <p>{{date}}</p>
                <p>Signature</p>
              </div>
            </div>
          `,
          requiredFields: ['courseCode', 'department'],
          destinationServices: ['scolarite'],
          finalDestination: 'scolarite',
          estimatedProcessTime: 5,
          attachmentsRequired: true,
          requiredAttachmentTypes: ['receipt'],
          isActive: true,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp()
        },
        {
          id: 'rectification-matricule',
          title: 'Demande de rectification de matricule',
          category: 'scolarite',
          description: 'Correction d\'une erreur dans le numéro de matricule',
          template: `
            <div class="request-template">
              <div class="header">
                <div class="sender-info">
                  <p>{{userName}}</p>
                  <p>{{userMatricule}}</p>
                  <p>{{userDepartment}}</p>
                </div>
                <div class="recipient-info">
                  <p>À Monsieur le Responsable de UE {{courseCode}}</p>
                </div>
              </div>
              <div class="subject">
                <p>OBJET : Demande de rectification de mon matricule, au lieu de {{wrongMatricule}}, c'est {{correctMatricule}}</p>
              </div>
              <div class="content">
                <p>Monsieur,</p>
                <p>J'ai l'honneur de venir très respectueusement auprès de votre haute bienveillance solliciter une demande de rectification de mon matricule.</p>
                <p>En effet, je suis étudiant(e) inscrit(e) en {{department}}, ayant assisté à tous les examens de CC, après publication des notes, j'ai eu à vérifier avec ardeur, et constater que mon matricule a été rédigé avec erreur, c'est pourquoi je m'incline auprès de vous, dans lequel vous avez le pouvoir de le rectifier, de plus, espérant que mon problème aura une solution.</p>
                <p>Dans l'attente d'une suite favorable, Veuillez agréer Monsieur, mes expressions les plus profondes du cœur.</p>
              </div>
              <div class="attachments">
                <p>PIÈCES JOINTES :</p>
                <p>-Photocopie de reçu de paiement de pension.</p>
              </div>
              <div class="signature">
                <p>{{date}}</p>
                <p>Signature</p>
              </div>
            </div>
          `,
          requiredFields: ['courseCode', 'department', 'wrongMatricule', 'correctMatricule'],
          destinationServices: ['scolarite'],
          finalDestination: 'scolarite',
          estimatedProcessTime: 7,
          attachmentsRequired: true,
          requiredAttachmentTypes: ['receipt'],
          isActive: true,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp()
        }
      ];

      // Batch write request types
      for (const requestType of defaultRequestTypes) {
        await setDoc(doc(db, 'requestTypes', requestType.id), requestType);
      }

      setLoading(false);
      setStep(3);

    } catch (err) {
      console.error('Error during setup:', err);
      setError(err.message);
      setLoading(false);
    }
  };

  const handleComplete = () => {
    router.push('/');
  };

  if (setupComplete) {
    return null; // Cette page ne sera pas rendue si l'installation est déjà complète
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="max-w-md w-full p-8 bg-white rounded-lg shadow-lg">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-gray-800">Configuration du Système</h1>
          <p className="text-gray-600">
            {step === 1 && "Configurez votre institution"}
            {step === 2 && "Créez un compte super-administrateur"}
            {step === 3 && "Configuration terminée avec succès"}
          </p>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-md">
            {error}
          </div>
        )}

        {step === 1 && (
          <form onSubmit={handleSubmitInstitution}>
            <div className="mb-4">
              <label className="block text-gray-700 mb-2" htmlFor="institutionName">
                Nom de l'institution <span className="text-red-500">*</span>
              </label>
              <input
                id="institutionName"
                type="text"
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                value={institutionName}
                onChange={(e) => setInstitutionName(e.target.value)}
                required
              />
            </div>

            <div className="mb-4">
              <label className="block text-gray-700 mb-2" htmlFor="institutionEmail">
                Email de contact <span className="text-red-500">*</span>
              </label>
              <input
                id="institutionEmail"
                type="email"
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                value={institutionEmail}
                onChange={(e) => setInstitutionEmail(e.target.value)}
                required
              />
            </div>

            <div className="mb-6">
              <label className="block text-gray-700 mb-2" htmlFor="institutionLogo">
                Logo (URL)
              </label>
              <input
                id="institutionLogo"
                type="text"
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                value={institutionLogo}
                onChange={(e) => setInstitutionLogo(e.target.value)}
              />
            </div>

            <button
              type="submit"
              className="w-full py-2 px-4 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              Suivant
            </button>
          </form>
        )}

        {step === 2 && (
          <form onSubmit={handleSubmitAdmin}>
            <div className="mb-4">
              <label className="block text-gray-700 mb-2" htmlFor="adminName">
                Nom complet <span className="text-red-500">*</span>
              </label>
              <input
                id="adminName"
                type="text"
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                value={adminName}
                onChange={(e) => setAdminName(e.target.value)}
                required
              />
            </div>

            <div className="mb-4">
              <label className="block text-gray-700 mb-2" htmlFor="adminEmail">
                Email <span className="text-red-500">*</span>
              </label>
              <input
                id="adminEmail"
                type="email"
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                value={adminEmail}
                onChange={(e) => setAdminEmail(e.target.value)}
                required
              />
            </div>

            <div className="mb-4">
              <label className="block text-gray-700 mb-2" htmlFor="adminPassword">
                Mot de passe <span className="text-red-500">*</span>
              </label>
              <input
                id="adminPassword"
                type="password"
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                value={adminPassword}
                onChange={(e) => setAdminPassword(e.target.value)}
                required
              />
            </div>

            <div className="mb-6">
              <label className="block text-gray-700 mb-2" htmlFor="confirmPassword">
                Confirmer le mot de passe <span className="text-red-500">*</span>
              </label>
              <input
                id="confirmPassword"
                type="password"
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
              />
            </div>

            <button
              type="submit"
              className="w-full py-2 px-4 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
              disabled={loading}
            >
              {loading ? 'Configuration en cours...' : 'Terminer la configuration'}
            </button>
          </form>
        )}

        {step === 3 && (
          <div className="text-center">
            <div className="mb-6 text-green-500">
              <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
              </svg>
              <p className="text-xl font-semibold mt-2">Configuration terminée avec succès !</p>
            </div>
            <p className="mb-6 text-gray-600">
              Vous pouvez maintenant accéder au système et commencer à l'utiliser.
            </p>
            <button
              onClick={handleComplete}
              className="w-full py-2 px-4 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              Aller à la page d'accueil
            </button>
          </div>
        )}
      </div>
    </div>
  );
}