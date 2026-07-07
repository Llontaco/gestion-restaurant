import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

// Protege el panel de administración: solo el usuario con rol ADMIN puede entrar.
// Si hay sesión pero no es admin, lo mandamos al índice (kiosko); si no hay sesión, al login.
export default function RequireAdmin() {
  const { user, isAdmin } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  if (!isAdmin) return <Navigate to="/vistas" replace />;
  return <Outlet />;
}
