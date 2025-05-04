'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import useAuth from '@/hooks/useAuth';
import { ROLES } from '@/lib/auth-permissions';
import { db } from '@/lib/firebase';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import Card from '@/components/common/Card';
import Button from '@/components/common/Button';
import Input from '@/components/common/Input';

export default function StudentRequestsPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [requestTypes, setRequestTypes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeCategory, setActiveCategory] = useState('all');

  useEffect(() => {
    if (!user) {
      router.push('/login');
      return;
    }

    if (user.role !== ROLES.STUDENT) {
      router.push('/dashboard');
    }
  }, [user, router]);

  useEffect(() => {
    const q = query(collection(db, 'requestTypes'), where('isActive', '==', true));
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const types = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      }));
      setRequestTypes(types);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const categories = [
    { id: 'all', label: 'Toutes' },
    { id: 'scolarite', label: 'Scolarité' },
    { id: 'administrative', label: 'Administrative' },
    { id: 'ressources', label: 'Ressources' },
    { id: 'maintenance', label: 'Maintenance' },
  ];

  const filteredRequestTypes = requestTypes.filter(type => {
    const matchesSearch = type.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          type.description?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = activeCategory === 'all' || type.category === activeCategory;
    return matchesSearch && matchesCategory;
  });

  const groupedRequestTypes = filteredRequestTypes.reduce((acc, type) => {
    const category = type.category || 'other';
    if (!acc[category]) {
      acc[category] = [];
    }
    acc[category].push(type);
    return acc;
  }, {});

  const handleRequestType = (requestType) => {
    router.push(`/requests/${requestType.category}/${requestType.id}`);
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
        <div className="flex items-center justify-between mb-8">
            <Button
            variant="primary"
            onClick={() => router.back()}
            >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Retour
            </Button>
        </div>
      <h1 className="text-3xl font-bold text-gray-900 mb-8">
        Faire une demande
      </h1>

      {/* Search and Filters */}
      <div className="mb-8 flex flex-col sm:flex-row gap-4">
        <div className="flex-1">
          <Input
            type="text"
            placeholder="Rechercher un type de demande..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="flex gap-2 overflow-x-auto pb-2">
          {categories.map(category => (
            <Button
              key={category.id}
              variant={activeCategory === category.id ? 'primary' : 'secondary'}
              className={activeCategory === category.id ? 'bg-blue-600 text-white' : ''}
              onClick={() => setActiveCategory(category.id)}
            >
              {category.label}
            </Button>
          ))}
        </div>
      </div>

      {/* Request Types by Category */}
      {Object.entries(groupedRequestTypes).map(([category, types]) => (
        <div key={category} className="mb-12">
          <h2 className="text-2xl font-semibold text-gray-900 mb-6 capitalize">
            {categories.find(c => c.id === category)?.label || category}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {types.map(type => (
              <Card
                key={type.id}
                className="hover:shadow-lg transition-shadow cursor-pointer"
                onClick={() => handleRequestType(type)}
              >
                <div className="p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    {type.title}
                  </h3>
                  <p className="text-gray-600 mb-4">
                    {type.description}
                  </p>
                  <div className="flex items-center text-sm text-gray-500 mb-4">
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span>Traitement: {type.estimatedProcessTime} jours</span>
                  </div>
                  {type.requiredFields && type.requiredFields.length > 0 && (
                    <div className="mb-4">
                      <p className="text-sm font-medium text-gray-700 mb-1">Informations requises:</p>
                      <ul className="text-sm text-gray-600 space-y-1">
                        {type.requiredFields.slice(0, 3).map((field, index) => (
                          <li key={index} className="flex items-center">
                            <svg className="w-3 h-3 mr-2 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                            </svg>
                            {field}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                  <Button
                    variant="primary"
                    className="bg-blue-600 text-white w-full"
                  >
                    Faire cette demande
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        </div>
      ))}

      {filteredRequestTypes.length === 0 && (
        <div className="text-center py-12">
          <svg className="w-12 h-12 mx-auto text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Aucun type de demande trouvé
          </h3>
          <p className="text-gray-600">
            Essayez de modifier vos filtres ou votre recherche
          </p>
        </div>
      )}
    </div>
  );
}