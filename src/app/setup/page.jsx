'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { db, auth } from '@/lib/firebase';
import { doc, setDoc, getDoc, collection, addDoc, serverTimestamp } from 'firebase/firestore';
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

  const createSystemData = async () => {
    // Create default services
    const services = [
      {
        id: 'administration',
        name: 'Administration Générale',
        description: 'Service principal d\'administration',
        permissions: [
          PERMISSIONS.MANAGE_USERS,
          PERMISSIONS.MANAGE_SERVICES,
          PERMISSIONS.VIEW_ALL_REQUESTS,
          PERMISSIONS.APPROVE_REQUESTS,
          PERMISSIONS.GENERATE_REPORTS
        ],
        isActive: true,
        canReceiveRequests: true,
        email: institutionEmail,
        headId: '',
        members: [],
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      },
      {
        id: 'scolarite',
        name: 'Service de Scolarité',
        description: 'Gestion des dossiers étudiants et des notes',
        permissions: [
          PERMISSIONS.VIEW_ALL_REQUESTS,
          PERMISSIONS.APPROVE_REQUESTS,
          PERMISSIONS.MANAGE_RESOURCES
        ],
        isActive: true,
        canReceiveRequests: true,
        email: institutionEmail,
        headId: '',
        members: [],
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      },
      {
        id: 'ressources',
        name: 'Service des Ressources',
        description: 'Gestion des salles et du matériel',
        permissions: [
          PERMISSIONS.MANAGE_RESOURCES,
          PERMISSIONS.MANAGE_RESERVATIONS,
          PERMISSIONS.VIEW_BOOKINGS,
          PERMISSIONS.MANAGE_RESOURCES,
          PERMISSIONS.APPROVE_REQUESTS
        ],
        isActive: true,
        canReceiveRequests: true,
        email: institutionEmail,
        headId: '',
        members: [],
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      },
      {
        id: 'maintenance',
        name: 'Service de Maintenance',
        description: 'Gestion des réparations et maintenances',
        permissions: [
          PERMISSIONS.VIEW_ALL_REQUESTS,
          PERMISSIONS.APPROVE_REQUESTS,
          PERMISSIONS.MANAGE_RESOURCES
        ],
        isActive: true,
        canReceiveRequests: true,
        email: institutionEmail,
        headId: '',
        members: [],
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      },
      {
        id: 'professeur',
        name: 'Département Enseignants',
        description: 'Service pour les demandes des enseignants',
        permissions: [
          PERMISSIONS.VIEW_ALL_REQUESTS,
          PERMISSIONS.APPROVE_REQUESTS
        ],
        isActive: true,
        canReceiveRequests: true,
        email: institutionEmail,
        headId: '',
        members: [],
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      }
    ];

    // Create request types
    const requestTypes = [
      // Scolarité
      {
        id: 'publication-note',
        title: 'Demande de publication de note',
        category: 'scolarite',
        description: 'Demande de publication d\'une note manquante',
        template: 'publication-note-template',
        requiredFields: ['courseCode', 'department'],
        destinationServices: ['scolarite'],
        finalDestination: 'scolarite',
        estimatedProcessTime: 5,
        attachmentsRequired: true,
        requiredAttachmentTypes: ['receipt'],
        isActive: true,
        createdAt: serverTimestamp()
      },
      {
        id: 'rectification-matricule',
        title: 'Demande de rectification de matricule',
        category: 'scolarite',
        description: 'Correction d\'une erreur dans le numéro de matricule',
        template: 'rectification-matricule-template',
        requiredFields: ['courseCode', 'department', 'wrongMatricule', 'correctMatricule'],
        destinationServices: ['scolarite'],
        finalDestination: 'scolarite',
        estimatedProcessTime: 7,
        attachmentsRequired: true,
        requiredAttachmentTypes: ['receipt'],
        isActive: true,
        createdAt: serverTimestamp()
      },
      {
        id: 'blocage-matricule',
        title: 'Demande de blocage de matricule',
        category: 'scolarite',
        description: 'Demande de blocage temporaire de matricule',
        template: 'blocage-matricule-template',
        requiredFields: ['courseCode', 'department', 'reason'],
        destinationServices: ['scolarite'],
        finalDestination: 'scolarite',
        estimatedProcessTime: 14,
        attachmentsRequired: true,
        requiredAttachmentTypes: ['receipt', 'admission-letter'],
        isActive: true,
        createdAt: serverTimestamp()
      },
      {
        id: 'activation-matricule',
        title: 'Demande d\'activation de matricule',
        category: 'scolarite',
        description: 'Réactivation d\'un matricule bloqué',
        template: 'activation-matricule-template',
        requiredFields: ['courseCode', 'department'],
        destinationServices: ['scolarite'],
        finalDestination: 'scolarite',
        estimatedProcessTime: 7,
        attachmentsRequired: true,
        requiredAttachmentTypes: ['receipt'],
        isActive: true,
        createdAt: serverTimestamp()
      },
      // Administratif
      {
        id: 'certificat',
        title: 'Demande de certificat',
        category: 'administrative',
        description: 'Demander un certificat officiel',
        template: 'certificat-template',
        requiredFields: ['certificateType', 'purpose'],
        destinationServices: ['administration'],
        finalDestination: 'administration',
        estimatedProcessTime: 10,
        attachmentsRequired: true,
        requiredAttachmentTypes: ['id', 'receipt'],
        isActive: true,
        createdAt: serverTimestamp()
      },
      {
        id: 'attestation',
        title: 'Demande d\'attestation',
        category: 'administrative',
        description: 'Obtenir une attestation de scolarité',
        template: 'attestation-template',
        requiredFields: ['purpose'],
        destinationServices: ['scolarite'],
        finalDestination: 'scolarite',
        estimatedProcessTime: 5,
        attachmentsRequired: true,
        requiredAttachmentTypes: ['receipt'],
        isActive: true,
        createdAt: serverTimestamp()
      },
      {
        id: 'changement-filiere',
        title: 'Changement de filière',
        category: 'administrative',
        description: 'Demander un changement d\'orientation',
        template: 'changement-filiere-template',
        requiredFields: ['currentFacility', 'newFacility', 'reason'],
        destinationServices: ['administration', 'scolarite'],
        finalDestination: 'scolarite',
        estimatedProcessTime: 21,
        attachmentsRequired: true,
        requiredAttachmentTypes: ['transcript', 'motivation-letter'],
        isActive: true,
        createdAt: serverTimestamp()
      },
      {
        id: 'validation-acquis',
        title: 'Validation des acquis',
        category: 'administrative',
        description: 'Faire valider vos acquis antérieurs',
        template: 'validation-acquis-template',
        requiredFields: ['previousInstitution', 'documents'],
        destinationServices: ['administration', 'scolarite'],
        finalDestination: 'scolarite',
        estimatedProcessTime: 30,
        attachmentsRequired: true,
        requiredAttachmentTypes: ['diplomas', 'transcript'],
        isActive: true,
        createdAt: serverTimestamp()
      },
      // Ressources
      {
        id: 'reservation-salle',
        title: 'Réservation de salle',
        category: 'ressources',
        description: 'Demande de réservation de salle',
        template: 'reservation-salle-template',
        requiredFields: ['resourceId', 'startTime', 'endTime', 'purpose', 'attendees'],
        destinationServices: ['ressources'],
        finalDestination: 'ressources',
        estimatedProcessTime: 2,
        attachmentsRequired: false,
        isActive: true,
        createdAt: serverTimestamp()
      },
      {
        id: 'reservation-materiel',
        title: 'Réservation de matériel',
        category: 'ressources',
        description: 'Demande de réservation de matériel',
        template: 'reservation-materiel-template',
        requiredFields: ['resourceId', 'startTime', 'endTime', 'purpose'],
        destinationServices: ['ressources'],
        finalDestination: 'ressources',
        estimatedProcessTime: 3,
        attachmentsRequired: false,
        isActive: true,
        createdAt: serverTimestamp()
      },
      // Maintenance
      {
        id: 'reparation-infrastructure',
        title: 'Réparation d\'infrastructure',
        category: 'maintenance',
        description: 'Signaler un problème d\'infrastructure',
        template: 'reparation-infrastructure-template',
        requiredFields: ['location', 'description', 'urgency'],
        destinationServices: ['maintenance'],
        finalDestination: 'maintenance',
        estimatedProcessTime: 15,
        attachmentsRequired: false,
        requiredAttachmentTypes: ['photos'],
        isActive: true,
        createdAt: serverTimestamp()
      },
      {
        id: 'reparation-materiel',
        title: 'Réparation de matériel',
        category: 'maintenance',
        description: 'Demander la réparation d\'équipement',
        template: 'reparation-materiel-template',
        requiredFields: ['resourceId', 'description', 'priority'],
        destinationServices: ['maintenance'],
        finalDestination: 'maintenance',
        estimatedProcessTime: 10,
        attachmentsRequired: false,
        requiredAttachmentTypes: ['description'],
        isActive: true,
        createdAt: serverTimestamp()
      },
      // Professeur
      {
        id: 'consultation-copie',
        title: 'Consultation de copie',
        category: 'professor',
        description: 'Demander la consultation d\'une copie d\'examen',
        template: 'consultation-copie-template',
        requiredFields: ['courseCode', 'examPeriod'],
        destinationServices: ['professeur'],
        finalDestination: 'professeur',
        estimatedProcessTime: 7,
        attachmentsRequired: false,
        requiredAttachmentTypes: ['matricule'],
        isActive: true,
        createdAt: serverTimestamp()
      }
    ];

    // Create resources
    const resources = [
      // Salles
      {
        id: 'salle-amphitheatre-a',
        name: 'Amphithéâtre A',
        code: 'AMP-A-100',
        description: 'Grand amphithéâtre principal avec équipement multimédia',
        category: 'salle',
        capacity: 300,
        location: 'Bâtiment Principal, Rez-de-chaussée',
        features: ['Projecteur', 'Système audio', 'Climatisation', 'Wi-Fi'],
        imageUrl: '',
        status: 'available',
        isActive: true,
        bookings: [],
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      },
      {
        id: 'salle-tp-info-1',
        name: 'Salle TP Informatique 1',
        code: 'TPI-1-01',
        description: 'Salle de TP équipée de 30 postes informatiques',
        category: 'salle',
        capacity: 30,
        location: 'Bâtiment Informatique, 1er étage',
        features: ['30 PC', 'Tableau interactif', 'Climatisation', 'Wi-Fi'],
        imageUrl: '',
        status: 'available',
        isActive: true,
        bookings: [],
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      },
      {
        id: 'salle-reunion-1',
        name: 'Salle de Réunion 1',
        code: 'REU-1-05',
        description: 'Salle de réunion pour petits groupes',
        category: 'salle',
        capacity: 15,
        location: 'Bâtiment Administration, 2e étage',
        features: ['Vidéoprojecteur', 'Écran tactile', 'Visioconférence', 'Climatisation'],
        imageUrl: '',
        status: 'available',
        isActive: true,
        bookings: [],
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      },
      // Matériel
      {
        id: 'mat-projecteur-portable',
        name: 'Projecteur Portable',
        code: 'PRO-P-001',
        description: 'Projecteur portable haute résolution',
        category: 'materiel',
        capacity: 1,
        location: 'Service Ressources',
        features: ['Full HD', 'Connectivité HDMI/VGA', 'Télécommande', 'Sac de transport'],
        imageUrl: '',
        status: 'available',
        isActive: true,
        bookings: [],
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      },
      {
        id: 'mat-camera-pro',
        name: 'Caméra Professionnelle',
        code: 'CAM-P-001',
        description: 'Caméra professionnelle pour événements',
        category: 'materiel',
        capacity: 1,
        location: 'Service Ressources',
        features: ['4K', 'Stabilisation', 'Microphone externe', 'Trépied'],
        imageUrl: '',
        status: 'available',
        isActive: true,
        bookings: [],
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      },
      // Équipements
      {
        id: 'equip-sono-mobile',
        name: 'Système Sonorisation Mobile',
        code: 'SON-M-001',
        description: 'Système de sonorisation portable pour événements',
        category: 'equipement',
        capacity: 1,
        location: 'Service Ressources',
        features: ['Enceintes', 'Microphones', 'Table de mixage', 'Cablage'],
        imageUrl: '',
        status: 'available',
        isActive: true,
        bookings: [],
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      },
      // Véhicules
      {
        id: 'veh-minibus',
        name: 'Minibus Institutionnel',
        code: 'VEH-M-001',
        description: 'Minibus pour transport de groupe',
        category: 'vehicule',
        capacity: 12,
        location: 'Parking Principal',
        features: ['Climatisation', 'GPS', '12 places'],
        imageUrl: '',
        status: 'available',
        isActive: true,
        bookings: [],
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      }
    ];

    // Save all data
    for (const service of services) {
      await setDoc(doc(db, 'services', service.id), service);
    }

    for (const requestType of requestTypes) {
      await setDoc(doc(db, 'requestTypes', requestType.id), requestType);
    }

    for (const resource of resources) {
      await setDoc(doc(db, 'resources', resource.id), resource);
    }

    // Create system counters
    await setDoc(doc(db, 'counters', 'requests'), {
      count: 0,
      lastUpdated: serverTimestamp()
    });

    await setDoc(doc(db, 'counters', 'users'), {
      count: 1, // For the superadmin
      lastUpdated: serverTimestamp()
    });

    return { services, requestTypes, resources };
  };

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
        isActive: true,
        lastLogin: serverTimestamp()
      });

      // Create system data
      await createSystemData();

      // Create default settings
      await setDoc(doc(db, 'settings', 'app'), {
        setupCompleted: true,
        institutionName,
        logo: institutionLogo || '',
        contactEmail: institutionEmail,
        theme: {
          primaryColor: '#2563EB', // bg-blue-600
          secondaryColor: '#FFFFFF',
          darkMode: false
        },
        emailNotifications: true,
        systemLanguage: 'fr',
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });

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
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-lg w-full space-y-8 bg-white p-8 rounded-lg shadow-lg">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900">Configuration du Système</h1>
          <p className="mt-2 text-gray-600">
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
                    : 'bg-gray-200 text-gray-600'
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
                    step > num ? 'bg-green-600' : 'bg-gray-200'
                  }`}
                />
              )}
            </div>
          ))}
        </div>

        {error && (
          <div className="mb-4 p-4 bg-red-50 text-red-700 rounded-md">
            {error}
          </div>
        )}

        {step === 1 && (
          <form onSubmit={handleSubmitInstitution} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Nom de l'institution <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                value={institutionName}
                onChange={(e) => setInstitutionName(e.target.value)}
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Email de contact <span className="text-red-500">*</span>
              </label>
              <input
                type="email"
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                value={institutionEmail}
                onChange={(e) => setInstitutionEmail(e.target.value)}
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Logo (URL)
              </label>
              <input
                type="text"
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
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
              <label className="block text-sm font-medium text-gray-700">
                Nom complet <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                value={adminName}
                onChange={(e) => setAdminName(e.target.value)}
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Email <span className="text-red-500">*</span>
              </label>
              <input
                type="email"
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                value={adminEmail}
                onChange={(e) => setAdminEmail(e.target.value)}
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Mot de passe <span className="text-red-500">*</span>
              </label>
              <input
                type="password"
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                value={adminPassword}
                onChange={(e) => setAdminPassword(e.target.value)}
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Confirmer le mot de passe <span className="text-red-500">*</span>
              </label>
              <input
                type="password"
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
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
              <p className="text-xl font-semibold mt-2 text-gray-900">Configuration terminée avec succès !</p>
            </div>
            <p className="mb-6 text-gray-600">
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