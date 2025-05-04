import { useTheme } from '@/contexts/ThemeContext';
import { Moon, Sun } from 'lucide-react';

export default function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      className="relative inline-flex h-9 w-9 items-center justify-center rounded-full transition-colors duration-200
                 hover:bg-secondary-100 dark:hover:bg-secondary-800
                 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 dark:focus:ring-offset-secondary-900"
      aria-label={theme === 'dark' ? 'Passer en mode clair' : 'Passer en mode sombre'}
    >
      {theme === 'dark' ? (
        <Sun className="h-5 w-5 text-secondary-100" />
      ) : (
        <Moon className="h-5 w-5 text-secondary-600" />
      )}
    </button>
  );
}