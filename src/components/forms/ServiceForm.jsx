'use client';

import { useState, useEffect } from 'react';
import { useTheme } from '@/contexts/ThemeContext';
import { useServices } from '@/hooks/useServices';
import { useUsers } from '@/hooks/useUsers';
import Button from '@/components/common/Button';
import Input from '@/components/common/Input';
import Select from '@/components/common/Select';
import { PERMISSIONS } from '@/lib/auth-permissions';

export function ServiceForm({ initialData, onSubmit, onCancel }) {
  const { colors } = useTheme();
  const { getUsers } = useUsers();
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    headId: '',
    email: '',
    permissions: [],
    isActive: true,
  });
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchUsers();
    if (initialData) {
      setFormData(initialData);
    }
  }, [initialData]);

  const fetchUsers = async () => {
    const allUsers = await getUsers();
    setUsers(allUsers);
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handlePermissionChange = (e) => {
    const { value, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      permissions: checked
        ? [...prev.permissions, value]
        : prev.permissions.filter(p => p !== value),
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await onSubmit(formData);
    } finally {
      setLoading(false);
    }
  };

  const permissionOptions = Object.entries(PERMISSIONS).map(([key, value]) => ({
    label: key.replace(/_/g, ' '),
    value,
  }));

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Input
        label="Nom du service"
        name="name"
        value={formData.name}
        onChange={handleChange}
        required
      />

      <Input
        label="Description"
        name="description"
        value={formData.description}
        onChange={handleChange}
        required
      />

      <Select
        label="Responsable du service"
        name="headId"
        value={formData.headId}
        onChange={handleChange}
        options={users.map(user => ({
          value: user.id,
          label: user.displayName,
        }))}
      />

      <Input
        label="Email du service"
        name="email"
        type="email"
        value={formData.email}
        onChange={handleChange}
      />

      <div>
        <label className="block text-sm font-medium mb-2" style={{ color: colors.text.primary }}>
          Permissions
        </label>
        <div className="space-y-2 max-h-40 overflow-y-auto p-2 border rounded" style={{ borderColor: colors.border }}>
          {permissionOptions.map(permission => (
            <label key={permission.value} className="flex items-center">
              <input
                type="checkbox"
                name="permissions"
                value={permission.value}
                checked={formData.permissions.includes(permission.value)}
                onChange={handlePermissionChange}
                className="mr-2"
              />
              <span className="text-sm" style={{ color: colors.text.primary }}>
                {permission.label}
              </span>
            </label>
          ))}
        </div>
      </div>

      <div className="flex items-center">
        <input
          type="checkbox"
          name="isActive"
          checked={formData.isActive}
          onChange={handleChange}
          className="mr-2"
        />
        <label className="text-sm" style={{ color: colors.text.primary }}>
          Service actif
        </label>
      </div>

      <div className="flex justify-end space-x-3 pt-4">
        <Button variant="secondary" onClick={onCancel} style={{ borderColor: colors.border }}>
          Annuler
        </Button>
        <Button type="submit" disabled={loading} style={{ backgroundColor: colors.primary }} className="text-white">
          {loading ? 'Enregistrement...' : 'Enregistrer'}
        </Button>
      </div>
    </form>
  );
}