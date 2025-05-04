'use client';

import { Loader2 } from 'lucide-react';

const Spinner = ({
  // Props pour personnaliser le comportement
  size = 'md',
  color = 'primary',
  fullScreen = false,
  text = '',
  className = '',
  style = {}
}) => {
  // Tailles prédéfinies
  const sizes = {
    xs: 'w-4 h-4',
    sm: 'w-6 h-6',
    md: 'w-8 h-8',
    lg: 'w-12 h-12',
    xl: 'w-16 h-16'
  };

  // Styles de couleur
  const colorStyles = {
    primary: '#3B82F6',
    secondary: '#10B981',
    white: '#ffffff',
    gray: '#9CA3AF'
  };

  // Obtenir la classe de taille appropriée
  const sizeClass = typeof size === 'string' ? sizes[size] || sizes.md : size;
  
  // Obtenir la couleur
  const spinnerColor = colorStyles[color] || color;

  // Animation personnalisée pour un effet moderne
  const keyframes = `
    @keyframes spin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }
    @keyframes pulse {
      0%, 100% { opacity: 0.2; }
      50% { opacity: 1; }
    }
    @keyframes orbitDots {
      0% { transform: rotate(0deg) translateX(${fullScreen ? '24px' : '12px'}) rotate(0deg); }
      100% { transform: rotate(360deg) translateX(${fullScreen ? '24px' : '12px'}) rotate(-360deg); }
    }
  `;

  // Composant de Loading central
  const SpinnerContent = () => (
    <div className={`relative ${sizeClass}`} style={style}>
      <style dangerouslySetInnerHTML={{ __html: keyframes }} />
      
      {/* Cercle principal qui tourne */}
      <div 
        className="absolute inset-0 border-2 border-current rounded-full animate-spin"
        style={{ 
          borderColor: spinnerColor,
          borderTopColor: 'transparent',
          borderRightColor: 'transparent',
          animation: 'spin 1s linear infinite'
        }}
      />
      
      {/* Petites bulles orbitales */}
      <div className="absolute inset-0">
        {[0, 45, 90, 135, 180, 225, 270, 315].map((rotation, index) => (
          <div
            key={index}
            className="absolute w-full h-full"
            style={{ transform: `rotate(${rotation}deg)` }}
          >
            <div
              className="absolute w-2 h-2 rounded-full"
              style={{
                backgroundColor: spinnerColor,
                top: '50%',
                left: '50%',
                marginTop: '-4px',
                marginLeft: '-4px',
                animation: `orbitDots ${2 + index * 0.1}s linear infinite, pulse ${1.5 + index * 0.1}s ease-in-out infinite`,
                animationDelay: `${index * 0.1}s`
              }}
            />
          </div>
        ))}
      </div>
    </div>
  );

  // Variant full screen
  if (fullScreen) {
    return (
      <div 
        className={`fixed inset-0 z-50 flex flex-col items-center justify-center bg-white/80 backdrop-blur-sm ${className}`}
      >
        <SpinnerContent />
        {text && (
          <p 
            className="mt-4 text-lg font-medium"
            style={{ color: spinnerColor }}
          >
            {text}
          </p>
        )}
      </div>
    );
  }

  // Variant normal
  return (
    <div className={`inline-flex items-center justify-center ${className}`}>
      <SpinnerContent />
      {text && (
        <span 
          className="ml-3 text-sm font-medium"
          style={{ color: spinnerColor }}
        >
          {text}
        </span>
      )}
    </div>
  );
};

// Variant avec bouton
const ButtonSpinner = ({
  loading = false,
  children,
  disabled = false,
  variant = 'primary',
  className = '',
  ...props
}) => {
  const variants = {
    primary: {
      bg: loading || disabled ? '#93C5FD' : '#3B82F6',
      hover: loading || disabled ? '#93C5FD' : '#2563EB',
      text: 'white'
    },
    secondary: {
      bg: loading || disabled ? '#6EE7B7' : '#10B981',
      hover: loading || disabled ? '#6EE7B7' : '#059669',
      text: 'white'
    },
    outline: {
      bg: 'transparent',
      border: loading || disabled ? '#93C5FD' : '#3B82F6',
      text: loading || disabled ? '#93C5FD' : '#3B82F6'
    }
  };

  const variantStyle = variants[variant] || variants.primary;

  return (
    <button
      disabled={loading || disabled}
      className={`
        relative px-5 py-2.5 rounded-lg font-medium transition-all duration-200
        ${loading ? 'cursor-not-allowed' : 'cursor-pointer'}
        ${className}
      `}
      style={{
        backgroundColor: variantStyle.bg,
        borderColor: variantStyle.border,
        color: variantStyle.text,
        ...(variant !== 'outline' && { borderWidth: 0 }),
        ...(variant === 'outline' && { borderWidth: '2px' })
      }}
      {...props}
    >
      <span className={`flex items-center justify-center ${loading ? 'opacity-0' : 'opacity-100'}`}>
        {children}
      </span>
      {loading && (
        <div className="absolute inset-0 flex items-center justify-center">
          <Spinner 
            size="sm" 
            color={variant === 'outline' ? 'primary' : 'white'} 
          />
        </div>
      )}
    </button>
  );
};

// Variant pour la navigation
const PageLoader = ({
  text = "Chargement de la page...",
  progress = 0
}) => {
  return (
    <div className="fixed top-0 left-0 right-0 z-50">
      <div 
        className="h-1 transition-all duration-300"
        style={{
          width: `${progress}%`,
          backgroundColor: '#3B82F6'
        }}
      />
      <div className="p-4 bg-white border-b border-gray-200 shadow-sm">
        <div className="flex items-center justify-center">
          <Spinner size="sm" color="primary" />
          <span className="ml-2 text-sm text-gray-600">{text}</span>
        </div>
      </div>
    </div>
  );
};

// Export des variants
Spinner.Button = ButtonSpinner;
Spinner.Page = PageLoader;

export default Spinner;

/*

Comment utiliser ce composant

########## Usage basique : ##########

// Spinner simple
<Spinner />

// Avec taille personnalisée
<Spinner size="lg" />

// Avec texte
<Spinner text="Chargement en cours..." />

// Avec couleur personnalisée
<Spinner color="secondary" />

// Full screen
<Spinner fullScreen text="Veuillez patienter..." />

########## Spinner pour boutons : ##########

const SubmitButton = () => {
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async () => {
    setIsLoading(true);
    try {
      await submitForm();
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Spinner.Button 
      loading={isLoading}
      onClick={handleSubmit}
      variant="primary"
    >
      Soumettre
    </Spinner.Button>
  );
};

######### Page Loader pour navigation : #########

const Layout = ({ children }) => {
  const router = useRouter();
  const [isNavigating, setIsNavigating] = useState(false);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const handleRouteChangeStart = () => {
      setIsNavigating(true);
      setProgress(0);
    };
    
    const handleRouteChangeComplete = () => {
      setIsNavigating(false);
      setProgress(100);
    };

    router.events.on('routeChangeStart', handleRouteChangeStart);
    router.events.on('routeChangeComplete', handleRouteChangeComplete);

    return () => {
      router.events.off('routeChangeStart', handleRouteChangeStart);
      router.events.off('routeChangeComplete', handleRouteChangeComplete);
    };
  }, [router]);

  if (isNavigating) {
    return <Spinner.Page progress={progress} />;
  }

  return children;
};

########### Utilisation conditionnelle : ###########

const DataFetching = () => {
  const { data, isLoading, error } = useQuery('data', fetchData);

  if (isLoading) {
    return <Spinner fullScreen text="Chargement des données..." />;
  }

  if (error) {
    return <div>Erreur !</div>;
  }

  return <div>{data}</div>;
};

*/