'use client';

import { useState, useEffect } from 'react';
import Input from '@/components/common/Input';
import Button from '@/components/common/Button';
import { ChevronDown, ChevronUp, X } from 'lucide-react';

export default function RequestTypeForm({ initialData, services, onSubmit, onCancel }) {
  const [formData, setFormData] = useState({
    title: '',
    category: '',
    description: '',
    requiredFields: [],
    destinationServices: [],
    workflow: [],
    estimatedProcessTime: 5,
    attachmentsRequired: false,
    requiredAttachmentTypes: [],
    isActive: true,
  });

  const categories = [
    { value: '', label: 'Sélectionnez une catégorie' },
    { value: 'scolarite', label: 'Scolarité' },
    { value: 'administrative', label: 'Administrative' },
    { value: 'ressources', label: 'Ressources' },
    { value: 'maintenance', label: 'Maintenance' },
    { value: 'professor', label: 'Professeur' },
  ];

  const fieldTypes = [
    { value: 'courseCode', label: 'Code UE' },
    { value: 'department', label: 'Département' },
    { value: 'matricule', label: 'Matricule' },
    { value: 'wrongMatricule', label: 'Matricule erroné' },
    { value: 'correctMatricule', label: 'Matricule correct' },
    { value: 'purpose', label: 'Motif' },
    { value: 'reason', label: 'Raison' },
    { value: 'resourceId', label: 'Ressource' },
    { value: 'startTime', label: 'Date/heure début' },
    { value: 'endTime', label: 'Date/heure fin' },
    { value: 'location', label: 'Localisation' },
    { value: 'priority', label: 'Priorité' },
    { value: 'attendees', label: 'Nombre de participants' },
  ];

  const attachmentTypes = [
    { value: 'receipt', label: 'Reçu de paiement' },
    { value: 'id', label: 'Pièce d\'identité' },
    { value: 'transcript', label: 'Relevé de notes' },
    { value: 'motivation-letter', label: 'Lettre de motivation' },
    { value: 'diplomas', label: 'Diplômes' },
    { value: 'photos', label: 'Photos' },
    { value: 'admission-letter', label: 'Lettre d\'admission' },
  ];

  useEffect(() => {
    if (initialData) {
      setFormData({
        ...initialData,
        requiredFields: initialData.requiredFields || [],
        destinationServices: initialData.destinationServices || [],
        workflow: initialData.workflow || [],
        requiredAttachmentTypes: initialData.requiredAttachmentTypes || [],
      });
    }
  }, [initialData]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleArrayChange = (name, value) => {
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const moveWorkflowService = (index, direction) => {
    const newWorkflow = [...formData.workflow];
    const temp = newWorkflow[index];
    newWorkflow[index] = newWorkflow[index + direction];
    newWorkflow[index + direction] = temp;
    setFormData(prev => ({ ...prev, workflow: newWorkflow }));
  };

  const removeWorkflowService = (index) => {
    const newWorkflow = formData.workflow.filter((_, i) => i !== index);
    setFormData(prev => ({ ...prev, workflow: newWorkflow }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="col-span-2">
          <Input
            label="Titre"
            name="title"
            value={formData.title}
            onChange={handleChange}
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Catégorie *
          </label>
          <select
            name="category"
            value={formData.category}
            onChange={handleChange}
            required
            className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
          >
            {categories.map(cat => (
              <option key={cat.value} value={cat.value}>{cat.label}</option>
            ))}
          </select>
        </div>

        <div>
          <Input
            label="Temps de traitement estimé (jours)"
            name="estimatedProcessTime"
            type="number"
            value={formData.estimatedProcessTime}
            onChange={handleChange}
            min="1"
            required
          />
        </div>

        <div className="col-span-2">
          <Input
            label="Description"
            name="description"
            value={formData.description}
            onChange={handleChange}
          />
        </div>
      </div>

      {/* Required Fields */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Champs requis
        </label>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
          {fieldTypes.map(field => (
            <div key={field.value} className="flex items-center">
              <input
                type="checkbox"
                id={`field-${field.value}`}
                checked={formData.requiredFields.includes(field.value)}
                onChange={(e) => {
                  const newFields = e.target.checked
                    ? [...formData.requiredFields, field.value]
                    : formData.requiredFields.filter(f => f !== field.value);
                  handleArrayChange('requiredFields', newFields);
                }}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label htmlFor={`field-${field.value}`} className="ml-2 block text-sm text-gray-700">
                {field.label}
              </label>
            </div>
          ))}
        </div>
      </div>

      {/* Services Workflow */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Workflow (services)
        </label>
        <div className="space-y-2">
          {/* Service Selection */}
          <div className="flex gap-2">
            <select
              onChange={(e) => {
                if (e.target.value && !formData.workflow.includes(e.target.value)) {
                  handleArrayChange('workflow', [...formData.workflow, e.target.value]);
                }
                e.target.value = '';
              }}
              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
            >
              <option value="">Ajouter un service au workflow</option>
              {services.map(service => (
                <option key={service.id} value={service.id}>{service.name}</option>
              ))}
            </select>
          </div>

          {/* Workflow Display */}
          <div className="space-y-2">
            {formData.workflow.map((serviceId, index) => {
              const service = services.find(s => s.id === serviceId);
              return (
                <div key={serviceId} className="flex items-center justify-between p-2 bg-gray-50 rounded-md">
                  <div className="flex items-center">
                    <span className="text-sm text-gray-600 mr-2">
                      {index + 1}.
                    </span>
                    <span className="text-sm font-medium text-gray-900">
                      {service?.name || serviceId}
                    </span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <button
                      type="button"
                      onClick={() => moveWorkflowService(index, -1)}
                      disabled={index === 0}
                      className="p-1 rounded hover:bg-gray-200 disabled:opacity-50"
                    >
                      <ChevronUp className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => moveWorkflowService(index, 1)}
                      disabled={index === formData.workflow.length - 1}
                      className="p-1 rounded hover:bg-gray-200 disabled:opacity-50"
                    >
                      <ChevronDown className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => removeWorkflowService(index)}
                      className="p-1 rounded hover:bg-gray-200 text-red-600"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Attachments */}
      <div>
        <div className="flex items-center mb-2">
          <input
            type="checkbox"
            id="attachmentsRequired"
            name="attachmentsRequired"
            checked={formData.attachmentsRequired}
            onChange={handleChange}
            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
          />
          <label htmlFor="attachmentsRequired" className="ml-2 block text-sm font-medium text-gray-700">
            Pièces jointes requises
          </label>
        </div>

        {formData.attachmentsRequired && (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
            {attachmentTypes.map(type => (
              <div key={type.value} className="flex items-center">
                <input
                  type="checkbox"
                  id={`attachment-${type.value}`}
                  checked={formData.requiredAttachmentTypes.includes(type.value)}
                  onChange={(e) => {
                    const newTypes = e.target.checked
                      ? [...formData.requiredAttachmentTypes, type.value]
                      : formData.requiredAttachmentTypes.filter(t => t !== type.value);
                    handleArrayChange('requiredAttachmentTypes', newTypes);
                  }}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label htmlFor={`attachment-${type.value}`} className="ml-2 block text-sm text-gray-700">
                  {type.label}
                </label>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="flex items-center">
        <input
          type="checkbox"
          id="isActive"
          name="isActive"
          checked={formData.isActive}
          onChange={handleChange}
          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
        />
        <label htmlFor="isActive" className="ml-2 block text-sm text-gray-700">
          Type de requête actif
        </label>
      </div>

      <div className="flex justify-end space-x-3 pt-4">
        <Button variant="secondary" onClick={onCancel}>
          Annuler
        </Button>
        <Button type="submit" className="bg-blue-600 text-white">
          Enregistrer
        </Button>
      </div>
    </form>
  );
}