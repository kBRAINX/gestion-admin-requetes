import { useContext, useCallback } from 'react';
import AuthContext from '@/contexts/AuthContext';
import { loginUser, registerUser, logoutUser, resetPassword, loginWithGoogle } from '@/services/authService';

/**
 * Custom hook to access auth context and wrap service calls
 */
export default function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');

  const { user, setUser, loading, setLoading, error, setError } = context;

  const login = useCallback(async (email, password) => {
    setError(null);
    setLoading(true);
    try {
      const u = await loginUser(email, password);
      setUser(u);
      return u;
    } catch (err) {
      setError(err.message || 'Erreur de connexion');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [setError, setLoading, setUser]);

  const loginGoogle = useCallback(async () => {
    setError(null);
    setLoading(true);
    try {
      const u = await loginWithGoogle();
      setUser(u);
      return u;
    } catch (err) {
      setError(err.message || 'Erreur Google');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [setError, setLoading, setUser]);

  const register = useCallback(async (email, password, displayName) => {
    setError(null);
    setLoading(true);
    try {
      const u = await registerUser(email, password, displayName);
      setUser(u);
      return u;
    } catch (err) {
      setError(err.message || 'Erreur inscription');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [setError, setLoading, setUser]);

  const logout = useCallback(async () => {
    setError(null);
    setLoading(true);
    try {
      await logoutUser();
      setUser(null);
    } catch (err) {
      setError(err.message || 'Erreur déconnexion');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [setError, setLoading, setUser]);

  const forgotPassword = useCallback(async (email) => {
    setError(null);
    try {
      await resetPassword(email);
    } catch (err) {
      setError(err.message || 'Erreur réinitialisation');
      throw err;
    }
  }, [setError]);

  return { user, loading, error, login, loginWithGoogle: loginGoogle, register, logout, forgotPassword };
}
