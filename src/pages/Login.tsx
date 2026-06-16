import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import BrandLogo from '../components/BrandLogo';
import { LockIcon } from '../components/icons';
import { useAuth } from '../context/AuthContext';

export default function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const { error: err } = await login(email.trim(), password);
    if (err) { setError(err); setLoading(false); }
    else { navigate('/vistas', { replace: true }); }
  }

  return (
    <div className="min-h-screen bg-surface flex flex-col items-center justify-center p-6">
      <div className="w-full max-w-md">
        <div className="flex justify-center mb-6">
          <BrandLogo />
        </div>

        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8">
          <h1 className="font-serif text-3xl font-bold text-gray-900 text-center">Iniciar Sesión</h1>
          <p className="text-gray-500 text-center text-sm mt-1 mb-6">
            Ingresa tus credenciales para entrar al sistema.
          </p>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg p-3 mb-4 text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-gray-700 font-semibold mb-2 text-sm">Correo electrónico</label>
              <input
                type="email" value={email} onChange={(e) => setEmail(e.target.value)}
                placeholder="tu@correo.com" required autoComplete="email"
                className="bg-stone-50 border border-gray-200 rounded-lg p-3 w-full outline-none focus:border-brand"
              />
            </div>
            <div>
              <label className="block text-gray-700 font-semibold mb-2 text-sm">Contraseña</label>
              <input
                type="password" value={password} onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••" required autoComplete="current-password"
                className="bg-stone-50 border border-gray-200 rounded-lg p-3 w-full outline-none focus:border-brand"
              />
            </div>
            <button
              type="submit" disabled={loading}
              className="w-full flex items-center justify-center gap-2 bg-brand hover:bg-brand-dark disabled:opacity-50 text-white font-bold py-3.5 rounded-lg transition-colors"
            >
              <LockIcon className="w-4 h-4" />
              {loading ? 'Entrando...' : 'Iniciar Sesión'}
            </button>
          </form>

          <p className="text-center text-sm text-gray-500 mt-6">
            ¿No tienes cuenta?{' '}
            <Link to="/register" className="font-semibold text-brand hover:text-brand-dark">
              Regístrate
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
