import { useState, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import BrandLogo from '../components/BrandLogo';
import GoogleSignInButton from '../components/GoogleSignInButton';
import { LockIcon } from '../components/icons';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../theme/ThemeProvider';

export default function Login() {
  const navigate = useNavigate();
  const { login, loginGoogle } = useAuth();
  const { settings } = useTheme();
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

  const handleGoogle = useCallback(async (credential: string) => {
    setError(null);
    setLoading(true);
    const { error: err } = await loginGoogle(credential);
    if (err) { setError(err); setLoading(false); }
    else { navigate('/vistas', { replace: true }); }
  }, [loginGoogle, navigate]);

  return (
    <div className="min-h-screen bg-bg flex">
      {/* Panel de portada (configurable) — solo escritorio */}
      <aside
        className="hidden lg:flex flex-col justify-between w-1/2 p-12 relative overflow-hidden"
        style={{
          background: settings.loginBackgroundUrl
            ? `url(${settings.loginBackgroundUrl}) center/cover no-repeat`
            : 'linear-gradient(135deg, var(--color-primary), var(--color-secondary))',
        }}
      >
        {/* Velo para legibilidad sobre la imagen */}
        <div className="absolute inset-0" style={{ backgroundColor: 'rgba(0,0,0,0.35)' }} />
        <div className="relative z-10">
          <BrandLogo />
        </div>
        <div className="relative z-10 text-white">
          <h2 className="font-serif text-4xl font-bold leading-tight">{settings.restaurantName}</h2>
          {settings.slogan && <p className="mt-3 text-white/80 text-lg max-w-md">{settings.slogan}</p>}
        </div>
      </aside>

      {/* Panel del formulario */}
      <main className="flex-1 flex flex-col items-center justify-center p-6">
        <div className="w-full max-w-md">
          <div className="flex justify-center mb-6 lg:hidden">
            <BrandLogo />
          </div>

          <div className="ui-card shadow-sm p-8">
            <h1 className="font-serif text-3xl font-bold text-text text-center">Iniciar Sesión</h1>
            <p className="text-text-muted text-center text-sm mt-1 mb-6">
              Ingresa tus credenciales para entrar al sistema.
            </p>

            {error && (
              <div className="ui-badge-danger rounded-lg p-3 mb-4 text-sm">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="ui-label">Correo electrónico</label>
                <input
                  type="email" value={email} onChange={(e) => setEmail(e.target.value)}
                  placeholder="tu@correo.com" required autoComplete="email"
                  className="ui-input"
                />
              </div>
              <div>
                <label className="ui-label">Contraseña</label>
                <input
                  type="password" value={password} onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••" required autoComplete="current-password"
                  className="ui-input"
                />
              </div>
              <button type="submit" disabled={loading} className="ui-btn ui-btn-primary w-full py-3.5">
                <LockIcon className="w-4 h-4" />
                {loading ? 'Entrando...' : 'Iniciar Sesión'}
              </button>
            </form>

            {/* Separador + acceso opcional con Google */}
            <div className="flex items-center gap-3 my-6">
              <span className="flex-1 h-px bg-border" />
              <span className="text-xs text-text-muted font-medium">o continúa con</span>
              <span className="flex-1 h-px bg-border" />
            </div>
            <GoogleSignInButton onCredential={handleGoogle} onError={setError} />

            <p className="text-center text-sm text-text-muted mt-6">
              ¿No tienes cuenta?{' '}
              <Link to="/register" className="font-semibold text-primary hover:text-primary-hover">
                Regístrate
              </Link>
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
