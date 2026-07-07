import { createContext, useContext, useEffect, useState } from 'react';
import type { ReactNode } from 'react';
import { loginUser, registerUser, loginWithGoogle } from '../services/api';
import type { AuthUser } from '../services/api';

const STORAGE_KEY = 'fc_auth_user';

type AuthContextType = {
  user: AuthUser | null;
  isAdmin: boolean;
  login: (email: string, password: string) => Promise<{ error: string | null }>;
  loginGoogle: (credential: string) => Promise<{ error: string | null }>;
  register: (name: string, email: string, password: string) => Promise<{ error: string | null }>;
  logout: () => void;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

function readStoredUser(): AuthUser | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as AuthUser) : null;
  } catch {
    return null;
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(() => readStoredUser());

  useEffect(() => {
    if (user) localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
    else localStorage.removeItem(STORAGE_KEY);
  }, [user]);

  async function login(email: string, password: string) {
    const { user: u, error } = await loginUser(email, password);
    if (u) setUser(u);
    return { error };
  }

  async function loginGoogle(credential: string) {
    const { user: u, error } = await loginWithGoogle(credential);
    if (u) setUser(u);
    return { error };
  }

  async function register(name: string, email: string, password: string) {
    const { user: u, error } = await registerUser(name, email, password);
    if (u) setUser(u); // registro exitoso = sesión iniciada
    return { error };
  }

  function logout() {
    setUser(null);
  }

  return (
    <AuthContext.Provider
      value={{ user, isAdmin: user?.role === 'ADMIN', login, loginGoogle, register, logout }}
    >
      {children}
    </AuthContext.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth debe usarse dentro de <AuthProvider>');
  return ctx;
}
