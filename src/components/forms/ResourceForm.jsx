export function ResourceForm({ initialData, onSubmit, onCancel }) {
    const { colors } = useTheme();
    const [formData, setFormData] = useState({
      name: '',
      code: '',
      description: '',
      category: '',
      capacity: '',
      location: '',
      features: '',
      imageUrl: '',
      status: 'available',
      isActive: true,
    });
    const [loading, setLoading] = useState(false);

    useEffect(() => {
      if (initialData) {
        setFormData(initialData);
      }
    }, [initialData]);

    const handleChange = (e) => {
      const { name, value, type, checked } = e.target;
      setFormData(prev => ({
        ...prev,
        [name]: type === 'checkbox' ? checked : value,
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

    const categoryOptions = [
      { value: 'salle', label: 'Salle' },
      { value: 'materiel', label: 'Matériel' },
      { value: 'equipement', label: 'Équipement' },
      { value: 'vehicule', label: 'Véhicule' },
    ];

    return (
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label="Nom de la ressource"
          name="name"
          value={formData.name}
          onChange={handleChange}
          required
        />

        <Input
          label="Code"
          name="code"
          value={formData.code}
          onChange={handleChange}
          required
        />

        <Input
          label="Description"
          name="description"
          value={formData.description}
          onChange={handleChange}
        />

        <Select
          label="Catégorie"
          name="category"
          value={formData.category}
          onChange={handleChange}
          options={categoryOptions}
          required
        />

        <Input
          label="Capacité"
          name="capacity"
          type="number"
          value={formData.capacity}
          onChange={handleChange}
        />

        <Input
          label="Localisation"
          name="location"
          value={formData.location}
          onChange={handleChange}
        />

        <Input
          label="Équipements (séparés par des virgules)"
          name="features"
          value={formData.features}
          onChange={handleChange}
        />

        <Input
          label="URL de l'image"
          name="imageUrl"
          value={formData.imageUrl}
          onChange={handleChange}
        />

        <div className="flex items-center">
          <input
            type="checkbox"
            name="isActive"
            checked={formData.isActive}
            onChange={handleChange}
            className="mr-2"
          />
          <label className="text-sm" style={{ color: colors.text.primary }}>
            Ressource active
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