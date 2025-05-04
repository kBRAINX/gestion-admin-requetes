'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import useAuth from '@/hooks/useAuth';
import { PERMISSIONS } from '@/lib/auth-permissions';
import { db } from '@/lib/firebase';
import { doc, getDoc, updateDoc, serverTimestamp } from 'firebase/firestore';
import Card from '@/components/common/Card';
import Button from '@/components/common/Button';
import Input from '@/components/common/Input';

export default function SettingsPage() {
  const router = useRouter();
  const { user, hasPermission } = useAuth();
  const [settings, setSettings] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    if (!user) {
      router.push('/login');
      return;
    }

    if (!hasPermission(PERMISSIONS.MANAGE_SYSTEM)) {
      router.push('/dashboard');
    }
  }, [user, hasPermission, router]);

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const settingsDoc = await getDoc(doc(db, 'settings', 'app'));
        if (settingsDoc.exists()) {
          setSettings(settingsDoc.data());
        }
        setLoading(false);
      } catch (err) {
        console.error('Error fetching settings:', err);
        setError('Erreur lors de la récupération des paramètres');
        setLoading(false);
      }
    };

    fetchSettings();
  }, []);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setSettings(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    setSuccess('');

    try {
      await updateDoc(doc(db, 'settings', 'app'), {
        ...settings,
        updatedAt: serverTimestamp(),
      });
      setSuccess('Paramètres mis à jour avec succès');
    } catch (err) {
      console.error('Error updating settings:', err);
      setError('Erreur lors de la mise à jour des paramètres');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">
        Paramètres du système
      </h1>

      {error && (
        <div className="mb-4 p-4 bg-red-50 text-red-700 rounded-md">
          {error}
        </div>
      )}

      {success && (
        <div className="mb-4 p-4 bg-green-50 text-green-700 rounded-md">
          {success}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        {/* Institution Information */}
        <Card className="mb-6">
          <div className="p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Informations de l'institution</h2>
            <div className="grid grid-cols-1 gap-6">
              <Input
                label="Nom de l'institution"
                name="institutionName"
                value={settings?.institutionName || ''}
                onChange={handleChange}
                required
              />
              <Input
                label="Email de contact"
                name="contactEmail"
                type="email"
                value={settings?.contactEmail || ''}
                onChange={handleChange}
                required
              />
              <Input
                label="URL du logo"
                name="logo"
                value={settings?.logo || ''}
                onChange={handleChange}
              />
            </div>
          </div>
        </Card>

        {/* Email Notifications */}
        <Card className="mb-6">
          <div className="p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Notifications par email</h2>
            <div className="flex items-center mb-4">
              <input
                type="checkbox"
                name="emailNotifications"
                checked={settings?.emailNotifications || false}
                onChange={handleChange}
                className="mr-2"
              />
              <label className="text-sm text-gray-700">
                Activer les notifications par email
              </label>
            </div>
          </div>
        </Card>

        {/* Theme Settings */}
        <Card className="mb-6">
          <div className="p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Paramètres de thème</h2>
            <div className="grid grid-cols-1 gap-6">
              <Input
                label="Couleur primaire"
                name="theme.primaryColor"
                type="color"
                value={settings?.theme?.primaryColor || '#3B82F6'}
                onChange={handleChange}
              />
              <Input
                label="Couleur secondaire"
                name="theme.secondaryColor"
                type="color"
                value={settings?.theme?.secondaryColor || '#10B981'}
                onChange={handleChange}
              />
            </div>
          </div>
        </Card>

        {/* Save Button */}
        <div className="flex justify-end">
          <Button
            type="submit"
            variant="primary"
            className="bg-blue-600 text-white"
            disabled={saving}
          >
            {saving ? 'Enregistrement...' : 'Enregistrer les paramètres'}
          </Button>
        </div>
      </form>
    </div>
  );
}