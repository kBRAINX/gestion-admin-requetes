import Image from 'next/image';
import ThemeToggle from '@/components/common/ThemeToggle';
import { FileText, Calendar, Bell, Shield, Monitor, Users } from 'lucide-react';

export default function AuthLayout({ children, title, subtitle }) {
  return (
    <div className="min-h-screen flex bg-light dark:bg-dark">
      {/* Left side - Welcome Section */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-primary-600 to-primary-700 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary-500/90 to-primary-800/90 z-10" />

        {/* Animated background elements */}
        <div className="absolute top-1/4 left-1/4 w-64 h-64 rounded-full bg-white/10 blur-3xl animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 rounded-full bg-white/5 blur-3xl" />

        <div className="relative z-20 flex flex-col justify-center px-12 lg:px-16">
          <h1 className="text-4xl lg:text-5xl font-bold text-white mb-6">
            Bienvenue sur le Portail Administratif
          </h1>
          <p className="text-xl text-white/90 mb-12 max-w-lg">
            Gérez vos demandes administratives et réservations de ressources en toute simplicité.
          </p>

          <div className="grid grid-cols-1 gap-8">
            {[
              {
                icon: FileText,
                title: 'Demandes simplifiées',
                description: 'Suivez vos demandes en temps réel'
              },
              {
                icon: Calendar,
                title: 'Réservations faciles',
                description: 'Réservez des salles et du matériel instantanément'
              },
              {
                icon: Bell,
                title: 'Notifications instantanées',
                description: 'Restez informé à chaque étape'
              },
              {
                icon: Shield,
                title: 'Sécurisé et privé',
                description: 'Vos données sont protégées'
              }
            ].map((feature, index) => (
              <div
                key={index}
                className="flex items-center backdrop-blur-sm bg-white/10 rounded-lg p-4 transition-all hover:bg-white/20"
              >
                <div className="flex-shrink-0 w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center mr-4">
                  <feature.icon className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-white">{feature.title}</h3>
                  <p className="text-white/80">{feature.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right side - Form Section */}
      <div className="w-full lg:w-1/2 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8 xl:px-12 bg-secondary-50 dark:bg-secondary-900">
        <div className="absolute top-4 right-4">
          <ThemeToggle />
        </div>

        <div className="sm:mx-auto sm:w-full sm:max-w-md">
          <div className="bg-white dark:bg-secondary-800 py-8 px-4 shadow-lg dark:shadow-secondary-900/50 sm:rounded-lg sm:px-10">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-secondary-900 dark:text-white">
                {title}
              </h2>
              <p className="mt-2 text-sm text-secondary-600 dark:text-secondary-400">
                {subtitle}
              </p>
            </div>

            {children}
          </div>
        </div>
      </div>
    </div>
  );
}