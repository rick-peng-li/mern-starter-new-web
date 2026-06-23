import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { fetchCurrentUser, login as loginRequest, register as registerRequest } from '../lib/api.js';
import { clearStoredToken, getStoredToken, setStoredToken } from '../lib/session.js';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => getStoredToken());
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(Boolean(getStoredToken()));

  useEffect(() => {
    let cancelled = false;

    async function loadUser() {
      if (!token) {
        setUser(null);
        setIsLoading(false);
        return;
      }

      setIsLoading(true);

      try {
        const response = await fetchCurrentUser();
        if (!cancelled) {
          setUser(response.user);
        }
      } catch (error) {
        if (!cancelled) {
          clearStoredToken();
          setToken('');
          setUser(null);
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    }

    loadUser();

    return () => {
      cancelled = true;
    };
  }, [token]);

  async function login(credentials) {
    const response = await loginRequest(credentials);
    setStoredToken(response.token);
    setToken(response.token);
    setUser(response.user);
    return response.user;
  }

  async function register(payload) {
    const response = await registerRequest(payload);
    setStoredToken(response.token);
    setToken(response.token);
    setUser(response.user);
    return response.user;
  }

  function logout() {
    clearStoredToken();
    setToken('');
    setUser(null);
  }

  const value = useMemo(
    () => ({
      token,
      user,
      isLoading,
      isAuthenticated: Boolean(token && user),
      login,
      register,
      logout,
    }),
    [token, user, isLoading]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error('useAuth must be used within AuthProvider.');
  }

  return context;
}
