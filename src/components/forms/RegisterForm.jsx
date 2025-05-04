'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createUserWithEmailAndPassword, updateProfile } from 'firebase/auth';
import { auth, db } from '@/lib/firebase';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { Eye, EyeOff, UserPlus } from 'lucide-react';
import { ROLES, ROLE_PERMISSIONS } from '@/lib/auth-permissions';
import { useTheme } from '@/contexts/ThemeContext';
import Button from '@/components/common/Button';
import Input from '@/components/common/Input';

export default function RegisterForm() {
  const router = useRouter();
  const { colors } = useTheme();
  const [formData, setFormData] = useState({
    displayName: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: ROLES.STUDENT,
    matricule: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // Validate form
    if (formData.password !== formData.confirmPassword) {
      setError('Les mots de passe ne correspondent pas');
      return;
    }

    if (formData.password.length < 6) {
      setError('Le mot de passe doit contenir au moins 6 caractères');
      return;
    }

    setLoading(true);

    try {
      // Create user in Firebase Auth
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        formData.email,
        formData.password
      );

      const user = userCredential.user;

      // Update profile with display name
      await updateProfile(user, {
        displayName: formData.displayName,
      });

      // Create user document in Firestore
      const userData = {
        id: user.uid,
        email: formData.email,
        displayName: formData.displayName,
        role: formData.role,
        permissions: ROLE_PERMISSIONS[formData.role],
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        isActive: true,
      };

      // Add matricule for students
      if (formData.role === ROLES.STUDENT && formData.matricule) {
        userData.matricule = formData.matricule;
      }

      await setDoc(doc(db, 'users', user.uid), userData);

      // Redirect to login
      router.push('/login');
    } catch (error) {
      console.error('Registration error:', error);
      if (error.code === 'auth/email-already-in-use') {
        setError('Cette adresse email est déjà utilisée');
      } else {
        setError('Une erreur est survenue lors de l\'inscription');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <Input
        label="Nom complet"
        name="displayName"
        type="text"
        required
        value={formData.displayName}
        onChange={handleChange}
        placeholder="Jean Dupont"
      />

      <Input
        label="Email"
        name="email"
        type="email"
        required
        value={formData.email}
        onChange={handleChange}
        placeholder="jean@exemple.com"
      />

      <div>
        <label htmlFor="role" className="block text-sm font-medium mb-1" style={{ color: colors.text.primary }}>
          Type de compte
        </label>
        <select
          id="role"
          name="role"
          value={formData.role}
          onChange={handleChange}
          className="block w-full px-3 py-2 border rounded-md"
          style={{
            backgroundColor: colors.background.primary,
            borderColor: colors.border,
            color: colors.text.primary,
          }}
        >
          <option value={ROLES.STUDENT}>Étudiant</option>
          <option value={ROLES.TEACHER}>Enseignant</option>
        </select>
      </div>

      {formData.role === ROLES.STUDENT && (
        <Input
          label="Matricule"
          name="matricule"
          type="text"
          value={formData.matricule}
          onChange={handleChange}
          placeholder="Ex: 2023/2024-001"
        />
      )}

      <div>
        <label htmlFor="password" className="block text-sm font-medium mb-1" style={{ color: colors.text.primary }}>
          Mot de passe
        </label>
        <div className="relative">
          <input
            id="password"
            name="password"
            type={showPassword ? 'text' : 'password'}
            required
            value={formData.password}
            onChange={handleChange}
            className="w-full px-3 py-2 border rounded-md"
            style={{
              backgroundColor: colors.background.primary,
              borderColor: colors.border,
              color: colors.text.primary,
            }}
            placeholder="••••••••"
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute inset-y-0 right-0 pr-3 flex items-center"
          >
            {showPassword ? (
              <EyeOff className="h-5 w-5" style={{ color: colors.text.tertiary }} />
            ) : (
              <Eye className="h-5 w-5" style={{ color: colors.text.tertiary }} />
            )}
          </button>
        </div>
      </div>

      <Input
        label="Confirmer le mot de passe"
        name="confirmPassword"
        type="password"
        required
        value={formData.confirmPassword}
        onChange={handleChange}
        placeholder="••••••••"
      />

      {error && (
        <div className="rounded-md p-4" style={{ backgroundColor: '#FEE2E2', color: '#991B1B' }}>
          <div className="flex">
            <div className="ml-3">
              <h3 className="text-sm font-medium">{error}</h3>
            </div>
          </div>
        </div>
      )}

      <Button
        type="submit"
        disabled={loading}
        className="w-full flex justify-center items-center"
        style={{ backgroundColor: colors.primary }}
      >
        {loading ? (
          <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
        ) : (
          <UserPlus className="h-5 w-5 mr-2" />
        )}
        {loading ? 'Inscription en cours...' : 'S\'inscrire'}
      </Button>
    </form>
  );
}