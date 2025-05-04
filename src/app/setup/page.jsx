'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { db, auth } from '@/lib/firebase';
import { doc, setDoc, getDoc, serverTimestamp } from 'firebase/firestore';
import { createUserWithEmailAndPassword, updateProfile } from 'firebase/auth';
import { ROLES, PERMISSIONS, ROLE_PERMISSIONS } from '@/lib/auth-permissions';

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
        role: ROLES.SUPERADMIN,
        permissions: ROLE_PERMISSIONS[ROLES.SUPERADMIN],
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
          permissions: [
            PERMISSIONS.MANAGE_USERS,
            PERMISSIONS.MANAGE_SERVICES,
            PERMISSIONS.VIEW_ALL_REQUESTS,
            PERMISSIONS.APPROVE_REQUESTS,
            PERMISSIONS.GENERATE_REPORTS
          ],
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
          permissions: [
            PERMISSIONS.VIEW_ALL_REQUESTS,
            PERMISSIONS.APPROVE_REQUESTS,
            PERMISSIONS.MANAGE_RESOURCES
          ],
          canReceiveRequests: true,
          email: '',
          isActive: true,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp()
        },
        {
          id: 'ressources',
          name: 'Service des Ressources',
          description: 'Gestion des salles et du matériel',
          headId: '',
          members: [],
          permissions: [
            PERMISSIONS.MANAGE_RESOURCES,
            PERMISSIONS.MANAGE_RESERVATIONS,
            PERMISSIONS.VIEW_BOOKINGS
          ],
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

      // Create basic request types
      const defaultRequestTypes = [
        {
          id: 'publication-note',
          title: 'Demande de publication de note',
          category: 'scolarite',
          description: 'Demande de publication d\'une note manquante',
          template: '',
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
          template: '',
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
    return null;
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-lg w-full space-y-8 bg-white dark:bg-gray-800 p-8 rounded-lg shadow-lg">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Configuration du Système</h1>
          <p className="mt-2 text-gray-600 dark:text-gray-400">
            {step === 1 && "Configurez votre institution"}
            {step === 2 && "Créez un compte super-administrateur"}
            {step === 3 && "Configuration terminée avec succès"}
          </p>
        </div>

        {/* Progress Steps */}
        <div className="flex justify-center items-center space-x-4 my-8">
          {[1, 2, 3].map((num) => (
            <div key={num} className="flex items-center">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center ${
                  step === num
                    ? 'bg-blue-600 text-white'
                    : step > num
                    ? 'bg-green-600 text-white'
                    : 'bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-400'
                }`}
              >
                {step > num ? (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                  </svg>
                ) : (
                  num
                )}
              </div>
              {num < 3 && (
                <div
                  className={`w-12 h-1 ${
                    step > num ? 'bg-green-600' : 'bg-gray-200 dark:bg-gray-700'
                  }`}
                />
              )}
            </div>
          ))}
        </div>

        {error && (
          <div className="mb-4 p-4 bg-red-50 dark:bg-red-900 text-red-700 dark:text-red-200 rounded-md">
            {error}
          </div>
        )}

        {step === 1 && (
          <form onSubmit={handleSubmitInstitution} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Nom de l'institution <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm
                           focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                value={institutionName}
                onChange={(e) => setInstitutionName(e.target.value)}
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Email de contact <span className="text-red-500">*</span>
              </label>
              <input
                type="email"
                className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm
                           focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                value={institutionEmail}
                onChange={(e) => setInstitutionEmail(e.target.value)}
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Logo (URL)
              </label>
              <input
                type="text"
                className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm
                           focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                value={institutionLogo}
                onChange={(e) => setInstitutionLogo(e.target.value)}
              />
            </div>

            <button
              type="submit"
              className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md
                       shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700
                       focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Suivant
            </button>
          </form>
        )}

        {step === 2 && (
          <form onSubmit={handleSubmitAdmin} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Nom complet <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm
                           focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                value={adminName}
                onChange={(e) => setAdminName(e.target.value)}
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Email <span className="text-red-500">*</span>
              </label>
              <input
                type="email"
                className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm
                           focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                value={adminEmail}
                onChange={(e) => setAdminEmail(e.target.value)}
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Mot de passe <span className="text-red-500">*</span>
              </label>
              <input
                type="password"
                className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm
                           focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                value={adminPassword}
                onChange={(e) => setAdminPassword(e.target.value)}
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Confirmer le mot de passe <span className="text-red-500">*</span>
              </label>
              <input
                type="password"
                className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm
                           focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
              />
            </div>

            <button
              type="submit"
              className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md
                       shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700
                       focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              disabled={loading}
            >
              {loading ? 'Configuration en cours...' : 'Terminer la configuration'}
            </button>
          </form>
        )}

        {step === 3 && (
          <div className="text-center">
            <div className="mb-6 text-green-500">
              <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
              </svg>
              <p className="text-xl font-semibold mt-2 text-gray-900 dark:text-white">Configuration terminée avec succès !</p>
            </div>
            <p className="mb-6 text-gray-600 dark:text-gray-400">
              Vous pouvez maintenant accéder au système et commencer à l'utiliser.
            </p>
            <button
              onClick={handleComplete}
              className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md
                       shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700
                       focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Aller à la page d'accueil
            </button>
          </div>
        )}
      </div>
    </div>
  );
}