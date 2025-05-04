'use client';

import Link from 'next/link';
import AuthLayout from '@/components/layout/AuthLayout';
import RegisterForm from '@/components/forms/RegisterForm';

export default function RegisterPage() {
  return (
    <AuthLayout
      title="Créer un compte"
      subtitle="Rejoignez notre plateforme"
    >
      <RegisterForm />
      <div className="mt-6 text-center">
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Déjà un compte ?{' '}
          <Link href="/login" className="font-medium text-blue-600 hover:text-blue-500">
            Se connecter
          </Link>
        </p>
      </div>
    </AuthLayout>
  );
}