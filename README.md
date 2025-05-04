
# Système d'Administration des Requêtes

Un système complet de gestion des requêtes administratives avec réservation de ressources, développé avec Next.js et Firebase.

## 🚀 Fonctionnalités Principales

### Gestion des Utilisateurs
- Authentification sécurisée
- Contrôle d'accès basé sur les rôles (RBAC)
- Gestion des profils utilisateurs
- Hiérarchie des permissions (Super Admin, Admin, Chef de Service, Membre de Service, Enseignant, Étudiant)

### Workflow des Requêtes
- Soumission de requêtes multi-services
- Suivi en temps réel avec timeline visuelle
- Validation par étapes avec historique
- Notifications par email automatiques
- Génération de lettres et documents PDF

### Gestion des Ressources
- Calendrier interactif avec FullCalendar
- Réservation de salles et matériel
- Visualization des disponibilités
- Système de conflits de réservation

### Administration
- Tableau de bord avec statistiques temps réel
- Gestion des services et départements
- Configuration des types de requêtes
- Rapports et analyses visuels

## 🛠️ Technologies Utilisées

### Frontend
- **Next.js 14** - Framework React
- **Tailwind CSS** - Styling
- **FullCalendar.js** - Gestion des calendriers
- **Chart.js** - Visualisation des données
- **Lucide-react** - Icônes

### Backend
- **Firebase** - Base de données et authentification
- **Cloudinary** - Gestion des médias
- **Firebase Storage** - Stockage des fichiers
- **Nodemailer** - Service d'email

## 📁 Structure du Projet

```
src/
├── app/                    # Routes Next.js
│   ├── (auth)/            # Pages d'authentification
│   ├── (dashboard)/       # Dashboards par rôle
│   ├── admin/             # Pages admin
│   ├── resources/         # Gestion des ressources
│   └── requests/          # Système de requêtes
├── components/            # Composants réutilisables
│   ├── common/            # Composants de base
│   ├── forms/             # Formulaires
│   └── modals/            # Modales
├── hooks/                 # Custom hooks
├── lib/                   # Configurations et utilitaires
├── services/              # Services API
└── contexts/              # Contextes React
```

## 🚦 Installation et Configuration

### Prérequis
- Node.js 18+
- Firebase CLI
- Compte Cloudinary

### Installation

```bash
# Cloner le repository
git clone https://github.com/votre-username/hackverse-genesisSquad.git

# Installer les dépendances
cd hackverse-genesisSquad
npm install

# Configurer les variables d'environnement
cp .env.example .env
```

### Configuration Firebase

1. Créer un projet Firebase
2. Activer Authentication (Email/Password)
3. Créer la base de donneees Firestore nécessaires
4. Copier les credentials dans `.env

```env
NEXT_PUBLIC_FIREBASE_API_KEY=votre_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=votre_auth_domain
NEXT_PUBLIC_FIREBASE_PROJECT_ID=votre_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=votre_storage_bucket
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=votre_messaging_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=votre_app_id

# optionnelle pour des perspective futur
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=votre_cloud_name
NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET=votre_upload_preset
```

### Lancer le projet

```bash
# Développement
npm run dev

# Production
npm run build
npm start
```

## 📚 Documentation des Routes

### Routes Publiques
- `/` - Page d'accueil
- `/login` - Connexion
- `/register` - Inscription
- `/forgot-password` - Réinitialisation

### Routes Protégées
- `/dashboard` - Tableau de bord général
- `/admin/*` - Administration (Super Admin uniquement)
- `/service/*` - Gestion service 
- `/resources/*` - Gestion ressources
- `/requests/*` - Système de requêtes

## 💾 Structure de la Base de Données

### Collections Firestore

1. **users** - Utilisateurs
```typescript
{
  id: string,
  email: string,
  displayName: string,
  role: string,
  matricule: string,
  serviceId: string,
  permissions: string[],
  isActive: boolean
}
```

2. **services** - Services
```typescript
{
  id: string,
  name: string,
  description: string,
  headId: string,
  members: string[],
  permissions: string[],
  isActive: boolean
}
```

3. **requests** - Requêtes
```typescript
{
  id: string,
  type: string,
  category: string,
  userId: string,
  status: string,
  workflow: WorkflowStep[],
  attachments: Attachment[],
  createdAt: Timestamp
}
```

4. **resources** - Ressources
```typescript
{
  id: string,
  name: string,
  type: string,
  capacity: number,
  status: string,
  bookings: Booking[],
  features: string[]
}
```

## 🔐 Permissions et Rôles

### Hiérarchie des Rôles
1. **SUPERADMIN** - Accès total
2. **ADMIN** - Gestion système
3. **SERVICE_HEAD** - Chef de service
4. **SERVICE_MEMBER** - Membre de service
5. **TEACHER** - Enseignant
6. **STUDENT** - Étudiant

### Permissions Principales
- `MANAGE_USERS` - Gestion utilisateurs
- `MANAGE_SERVICES` - Gestion services
- `APPROVE_REQUESTS` - Approbation requêtes
- `MANAGE_RESOURCES` - Gestion ressources
- `VIEW_ANALYTICS` - Accès analyses

## 🔄 Workflow des Requêtes

1. **Soumission** - L'utilisateur crée une requête
2. **Routage** - Assignation au premier service
3. **Traitement** - Validation ou rejet
4. **Transfert** - Si multi-services
5. **Finalisation** - Approbation finale
6. **Notification** - Email de confirmation

## 🎨 Thème et Design

Le système utilise un thème personnalisé avec :
- Couleur principale : `#3B82F6` (blue-600)
- Mode sombre désactivé
- Design responsive
- Composants accessibles

## 🤝 Contribution

1. Fork le projet
2. Créer une branche (`git checkout -b feature/AmazingFeature`)
3. Commit les changements (`git commit -m 'Add AmazingFeature'`)
4. Push sur la branche (`git push origin feature/AmazingFeature`)
5. Ouvrir une Pull Request

## 📝 License

Distribué sous la licence MIT. Voir `LICENSE` pour plus d'informations.
