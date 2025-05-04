'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import useAuth from '@/hooks/useAuth';
import { useUsers } from '@/hooks/useUsers';
import { useTheme } from '@/contexts/ThemeContext';
import Button from '@/components/common/Button';
import Card from '@/components/common/Card';
import Table from '@/components/common/Table';
import Modal from '@/components/common/Modal';
import UserForm from '@/components/forms/UserForm';
import Select from '@/components/common/Select';
import { PERMISSIONS, ROLES } from '@/lib/auth-permissions';

export default function AdminUsersPage() {
  const router = useRouter();
  const { user, hasPermission } = useAuth();
  const { users, loading, createUser, updateUser, deleteUser } = useUsers();
  const { colors, isDarkMode } = useTheme();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRole, setSelectedRole] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  useEffect(() => {
    if (!user) {
      router.push('/login');
      return;
    }

    if (!hasPermission(PERMISSIONS.MANAGE_USERS)) {
      router.push('/dashboard');
    }
  }, [user, hasPermission, router]);

  const roleOptions = [
    { value: 'all', label: 'Tous les rôles' },
    { value: ROLES.SUPERADMIN, label: 'Super Admin' },
    { value: ROLES.ADMIN, label: 'Admin' },
    { value: ROLES.SERVICE_HEAD, label: 'Chef de Service' },
    { value: ROLES.SERVICE_MEMBER, label: 'Membre de Service' },
    { value: ROLES.TEACHER, label: 'Enseignant' },
    { value: ROLES.STUDENT, label: 'Étudiant' },
  ];

  const columns = [
    {
      key: 'displayName',
      header: 'Nom',
      render: (user) => (
        <div className="flex items-center space-x-3">
          <div className="flex-shrink-0">
            <div
              className="h-8 w-8 rounded-full flex items-center justify-center"
              style={{ backgroundColor: colors.primary, color: '#FFFFFF' }}
            >
              {user.displayName?.[0]?.toUpperCase() || user.email?.[0]?.toUpperCase()}
            </div>
          </div>
          <div>
            <div className="font-medium" style={{ color: colors.text.primary }}>
              {user.displayName}
            </div>
          </div>
        </div>
      ),
    },
    {
      key: 'email',
      header: 'Email',
      render: (user) => (
        <div style={{ color: colors.text.secondary }}>
          {user.email}
        </div>
      ),
    },
    {
      key: 'role',
      header: 'Rôle',
      render: (user) => (
        <span
          className="px-2 py-1 rounded-full text-xs font-medium"
          style={{
            backgroundColor: isDarkMode ? 'rgba(59, 130, 246, 0.2)' : 'rgba(59, 130, 246, 0.1)',
            color: colors.primary,
          }}
        >
          {getRoleLabel(user.role)}
        </span>
      ),
    },
    {
      key: 'status',
      header: 'Statut',
      render: (user) => (
        <span
          className={`px-2 py-1 rounded-full text-xs font-medium ${
            user.isActive
              ? 'bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-100'
              : 'bg-red-100 text-red-800 dark:bg-red-800 dark:text-red-100'
          }`}
        >
          {user.isActive ? 'Actif' : 'Inactif'}
        </span>
      ),
    },
    {
      key: 'matricule',
      header: 'Matricule',
      render: (user) => (
        <div style={{ color: colors.text.primary }}>
          {user.matricule || '-'}
        </div>
      ),
    },
    {
      key: 'actions',
      header: 'Actions',
      render: (user) => (
        <div className="flex space-x-2">
          <Button
            variant="secondary"
            size="sm"
            onClick={() => handleEdit(user)}
            style={{ borderColor: colors.border }}
          >
            Modifier
          </Button>
          {user.id !== user.id && (
            <Button
              variant="danger"
              size="sm"
              onClick={() => handleDelete(user.id)}
            >
              Supprimer
            </Button>
          )}
        </div>
      ),
    },
  ];

  const getRoleLabel = (role) => {
    const option = roleOptions.find(opt => opt.value === role);
    return option ? option.label : role;
  };

  const filteredUsers = users.filter(u => {
    const matchesSearch = u.displayName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          u.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          u.matricule?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = selectedRole === 'all' || u.role === selectedRole;
    return matchesSearch && matchesRole;
  });

  const totalPages = Math.ceil(filteredUsers.length / itemsPerPage);
  const paginatedUsers = filteredUsers.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handleEdit = (user) => {
    setSelectedUser(user);
    setIsModalOpen(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer cet utilisateur ?')) {
      await deleteUser(id);
    }
  };

  const handleSubmit = async (data) => {
    if (selectedUser) {
      await updateUser(selectedUser.id, data);
    } else {
      await createUser(data);
    }
    setIsModalOpen(false);
    setSelectedUser(null);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: colors.background.primary }}>
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-6" style={{ backgroundColor: colors.background.secondary }}>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold" style={{ color: colors.text.primary }}>
          Gestion des Utilisateurs
        </h1>
        <Button
          onClick={() => {
            setSelectedUser(null);
            setIsModalOpen(true);
          }}
          style={{ backgroundColor: colors.primary }}
          className="text-white"
        >
          Nouvel Utilisateur
        </Button>
      </div>

      <Card className="mb-6">
        <div className="p-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <div className="md:col-span-2">
              <input
                type="text"
                placeholder="Rechercher un utilisateur..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full p-2 rounded border"
                style={{
                  backgroundColor: colors.background.primary,
                  borderColor: colors.border,
                  color: colors.text.primary,
                }}
              />
            </div>
            <div>
              <Select
                value={selectedRole}
                onChange={(e) => setSelectedRole(e.target.value)}
                options={roleOptions}
                className="w-full"
              />
            </div>
          </div>

          <Table
            columns={columns}
            data={paginatedUsers}
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
          />
        </div>
      </Card>

      <Modal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedUser(null);
        }}
        title={selectedUser ? "Modifier l'utilisateur" : "Créer un utilisateur"}
      >
        <UserForm
          initialData={selectedUser}
          onSubmit={handleSubmit}
          onCancel={() => {
            setIsModalOpen(false);
            setSelectedUser(null);
          }}
        />
      </Modal>
    </div>
  );
}