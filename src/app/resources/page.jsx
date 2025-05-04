'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useResources } from '@/hooks/useResources';
import Card from '@/components/common/Card';
import Button from '@/components/common/Button';

export default function ResourcesListPage() {
  const router = useRouter();
  const { resources, loading } = useResources();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  const categories = [
    { value: 'all', label: 'Toutes les catégories' },
    { value: 'salle', label: 'Salles' },
    { value: 'materiel', label: 'Matériel' },
    { value: 'equipement', label: 'Équipements' },
  ];

  const availableResources = resources.filter(resource =>
    resource.isActive && ['available', 'reserved'].includes(resource.status)
  );

  const filteredResources = availableResources.filter(resource => {
    const matchesSearch = resource.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          resource.description?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || resource.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const handleViewDetails = (resource) => {
    router.push(`/resources/${resource.id}`);
  };

  const handleBookResource = (resource) => {
    router.push(`/resources/${resource.id}?book=true`);
  };

  const getCategoryIcon = (category) => {
    switch (category) {
      case 'salle':
        return <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>;
      case 'materiel':
        return <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" /></svg>;
      case 'equipement':
        return <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z" /></svg>;
      default:
        return <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" /></svg>;
    }
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      available: {
        bg: 'bg-green-100',
        text: 'text-green-800',
        label: 'Disponible'
      },
      reserved: {
        bg: 'bg-yellow-100',
        text: 'text-yellow-800',
        label: 'Partiellement réservé'
      },
      maintenance: {
        bg: 'bg-red-100',
        text: 'text-red-800',
        label: 'Maintenance'
      }
    };

    const config = statusConfig[status] || statusConfig.available;
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${config.bg} ${config.text}`}>
        {config.label}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-6 bg-gray-50">
      <div className="max-w-7xl mx-auto">
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
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            Ressources
          </h1>
          <p className="mt-2 text-gray-600">
            Consultez la disponibilité des ressources et effectuez vos réservations
          </p>
        </div>

        {/* Filters */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="md:col-span-2">
            <input
              type="text"
              placeholder="Rechercher une ressource..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-3"
            />
          </div>
          <div>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-3"
            >
              {categories.map(category => (
                <option key={category.value} value={category.value}>
                  {category.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Resources Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredResources.map(resource => (
            <Card key={resource.id} className="hover:shadow-lg transition-shadow">
              <div className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <div>
                  <h3 className="text-lg font-semibold text-gray-900">
                     {resource.name}
                   </h3>
                   <p className="text-sm text-gray-500 mt-1">
                     Code: {resource.code}
                   </p>
                 </div>
                 {getStatusBadge(resource.status)}
               </div>

               <div className="flex items-center mb-4">
                 <div className="flex-shrink-0 mr-3 text-blue-600">
                   {getCategoryIcon(resource.category)}
                 </div>
                 <span className="text-sm font-medium text-gray-900">
                   {categories.find(c => c.value === resource.category)?.label || resource.category}
                 </span>
               </div>

               <p className="text-gray-600 mb-4 text-sm line-clamp-2">
                 {resource.description || 'Aucune description disponible'}
               </p>

               <div className="space-y-2 mb-6">
                 {resource.capacity && (
                   <div className="flex items-center text-sm">
                     <svg className="w-4 h-4 mr-2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                       <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                     </svg>
                     <span className="text-gray-600">Capacité: {resource.capacity}</span>
                   </div>
                 )}
                 {resource.location && (
                   <div className="flex items-center text-sm">
                     <svg className="w-4 h-4 mr-2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                       <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                       <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                     </svg>
                     <span className="text-gray-600">{resource.location}</span>
                   </div>
                 )}
               </div>

               <div className="flex justify-between">
                 <Button
                   variant="secondary"
                   size="sm"
                   onClick={() => handleViewDetails(resource)}
                 >
                   Voir détails
                 </Button>
                 {resource.status === 'available' && (
                   <Button
                     variant="primary"
                     size="sm"
                     onClick={() => handleBookResource(resource)}
                     className="bg-blue-600 text-white"
                   >
                     Réserver
                   </Button>
                 )}
               </div>
             </div>
           </Card>
         ))}
       </div>

       {filteredResources.length === 0 && (
         <Card className="mt-8">
           <div className="p-8 text-center">
             <svg
               className="mx-auto h-12 w-12 text-gray-400 mb-4"
               fill="none"
               stroke="currentColor"
               viewBox="0 0 24 24"
             >
               <path
                 strokeLinecap="round"
                 strokeLinejoin="round"
                 strokeWidth={1.5}
                 d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
               />
             </svg>
             <h3 className="text-sm font-medium text-gray-900 mb-2">
               Aucune ressource trouvée
             </h3>
             <p className="text-sm text-gray-500">
               Essayez de modifier vos filtres de recherche
             </p>
           </div>
         </Card>
       )}
     </div>
   </div>
 );
}