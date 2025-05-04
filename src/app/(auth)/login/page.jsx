'use client';

import Link from 'next/link';
import AuthLayout from '@/components/layout/AuthLayout';
import LoginForm from '@/components/forms/LoginForm';

export default function LoginPage() {
  return (
    <AuthLayout
      title="Connexion"
      subtitle="Accédez à votre espace personnel"
    >
      <LoginForm />
      <div className="mt-6 text-center">
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Pas encore de compte ?{' '}
          <Link href="/register" className="font-medium text-blue-600 hover:text-blue-500">
            S'inscrire
          </Link>
        </p>
      </div>
    </AuthLayout>
  );
}