export function UserForm({ initialData, onSubmit, onCancel }) {
    const { colors } = useTheme();
    const [formData, setFormData] = useState({
      displayName: '',
      email: '',
      role: '',
      matricule: '',
      department: '',
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

    const roleOptions = [
      { value: 'student', label: 'Étudiant' },
      { value: 'teacher', label: 'Enseignant' },
      { value: 'service_member', label: 'Membre de service' },
      { value: 'service_head', label: 'Chef de service' },
      { value: 'admin', label: 'Administrateur' },
      { value: 'superadmin', label: 'Super Admin' },
    ];

    return (
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label="Nom complet"
          name="displayName"
          value={formData.displayName}
          onChange={handleChange}
          required
        />

        <Input
          label="Email"
          name="email"
          type="email"
          value={formData.email}
          onChange={handleChange}
          required
        />

        <Select
          label="Rôle"
          name="role"
          value={formData.role}
          onChange={handleChange}
          options={roleOptions}
          required
        />

        {(formData.role === 'student' || formData.role === 'teacher') && (
          <>
            <Input
              label="Matricule"
              name="matricule"
              value={formData.matricule}
              onChange={handleChange}
            />
            <Input
              label="Département"
              name="department"
              value={formData.department}
              onChange={handleChange}
            />
          </>
        )}

        <div className="flex items-center">
          <input
            type="checkbox"
            name="isActive"
            checked={formData.isActive}
            onChange={handleChange}
            className="mr-2"
          />
          <label className="text-sm" style={{ color: colors.text.primary }}>
            Utilisateur actif
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