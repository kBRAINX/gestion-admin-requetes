import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';

export function withPermission(WrappedComponent, requiredPermission) {
  return function ProtectedComponent(props) {
    const router = useRouter();
    const { user, hasPermission, loading } = useAuth();

    useEffect(() => {
      if (!loading && (!user || !hasPermission(requiredPermission))) {
        router.push('/unauthorized');
      }
    }, [user, loading, hasPermission, router, requiredPermission]);

    if (loading) {
      return (
        <div className="flex justify-center items-center min-h-screen">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      );
    }

    if (!user || !hasPermission(requiredPermission)) {
      return null;
    }

    return <WrappedComponent {...props} />;
  };
}

// Exemple d'utilisation:
// export default withPermission(MyComponent, PERMISSIONS.MANAGE_USERS);

// Component to display unauthorized access
export function UnauthorizedPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="max-w-md w-full p-8 bg-white rounded-lg shadow-lg text-center">
        <div className="mb-6">
          <svg className="w-16 h-16 mx-auto text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
          </svg>
        </div>
        <h1 className="text-2xl font-bold text-gray-800 mb-4">Accès non autorisé</h1>
        <p className="text-gray-600 mb-6">
          Vous n&apos;avez pas les permissions nécessaires pour accéder à cette page.
        </p>
        <button
          onClick={() => router.push('/')}
          className="py-2 px-4 bg-blue-600 text-white rounded-md hover:bg-blue-700"
        >
          Retour à l&apos;accueil
        </button>
      </div>
    </div>
  );
}