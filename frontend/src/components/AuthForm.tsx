import { useState, type FormEvent } from 'react';
import { loginUser, registerUser, type HttpFailure } from '../api';
import type { User } from '../types';

interface AuthFormProps {
  onAuthenticated: (user: User) => void;
}

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function AuthForm({ onAuthenticated }: AuthFormProps) {
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleModeChange = (nextMode: 'login' | 'register') => {
    setMode(nextMode);
    setErrorMsg(null);
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    const trimmedEmail = email.trim().toLowerCase();
    const trimmedName = fullName.trim();

    if (mode === 'register') {
      if (trimmedName.length < 2) {
        setErrorMsg('Por favor ingresa tu nombre completo (mínimo 2 caracteres).');
        return;
      }
      if (!EMAIL_REGEX.test(trimmedEmail)) {
        setErrorMsg('Por favor ingresa un correo electrónico válido.');
        return;
      }
      if (password.length < 8) {
        setErrorMsg('La contraseña debe tener al menos 8 caracteres.');
        return;
      }
    } else {
      if (!trimmedEmail || !password) {
        setErrorMsg('Debes ingresar tu correo electrónico y contraseña.');
        return;
      }
    }

    setIsSubmitting(true);
    try {
      if (mode === 'register') {
        const { user } = await registerUser({
          fullName: trimmedName,
          email: trimmedEmail,
          password,
        });
        onAuthenticated(user);
      } else {
        const { user } = await loginUser({
          email: trimmedEmail,
          password,
        });
        onAuthenticated(user);
      }
    } catch (err) {
      const failure = err as HttpFailure;
      setErrorMsg(
        failure?.message ||
          'No se pudo procesar tu solicitud. Verifica tus datos e intenta nuevamente.'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-100 px-4 py-12">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-lg border border-slate-200 overflow-hidden">
        <div className="bg-emerald-700 px-6 py-6 text-white text-center">
          <h1 className="text-2xl font-bold tracking-tight">Pádel Medellín</h1>
          <p className="text-emerald-100 text-sm mt-1">
            Sistema de Reserva de Canchas (Formato 24 Horas)
          </p>
        </div>

        <div className="flex border-b border-slate-200 bg-slate-50">
          <button
            type="button"
            onClick={() => handleModeChange('login')}
            className={`flex-1 py-3 text-sm font-semibold transition-colors ${
              mode === 'login'
                ? 'bg-white text-emerald-700 border-b-2 border-emerald-600'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Iniciar Sesión
          </button>
          <button
            type="button"
            onClick={() => handleModeChange('register')}
            className={`flex-1 py-3 text-sm font-semibold transition-colors ${
              mode === 'register'
                ? 'bg-white text-emerald-700 border-b-2 border-emerald-600'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Crear Cuenta
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4" noValidate>
          {errorMsg && (
            <div
              role="alert"
              className="rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700"
            >
              {errorMsg}
            </div>
          )}

          {mode === 'register' && (
            <div>
              <label
                htmlFor="fullName"
                className="block text-sm font-medium text-slate-700 mb-1"
              >
                Nombre completo
              </label>
              <input
                id="fullName"
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Ej. Camila Restrepo"
                className="w-full rounded-lg border border-slate-300 px-3.5 py-2.5 text-sm focus:border-emerald-600 focus:outline-none focus:ring-2 focus:ring-emerald-600/20"
                required
              />
            </div>
          )}

          <div>
            <label
              htmlFor="email"
              className="block text-sm font-medium text-slate-700 mb-1"
            >
              Correo electrónico
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="jugador@ejemplo.com"
              className="w-full rounded-lg border border-slate-300 px-3.5 py-2.5 text-sm focus:border-emerald-600 focus:outline-none focus:ring-2 focus:ring-emerald-600/20"
              required
            />
          </div>

          <div>
            <label
              htmlFor="password"
              className="block text-sm font-medium text-slate-700 mb-1"
            >
              Contraseña
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder={mode === 'register' ? 'Mínimo 8 caracteres' : 'Tu contraseña'}
              className="w-full rounded-lg border border-slate-300 px-3.5 py-2.5 text-sm focus:border-emerald-600 focus:outline-none focus:ring-2 focus:ring-emerald-600/20"
              required
            />
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full rounded-lg bg-emerald-600 hover:bg-emerald-700 disabled:bg-emerald-400 text-white font-semibold py-2.5 px-4 text-sm transition-colors cursor-pointer"
          >
            {isSubmitting
              ? 'Procesando...'
              : mode === 'login'
              ? 'Ingresar a las Reservas'
              : 'Registrarme e Iniciar Sesión'}
          </button>
        </form>
      </div>
    </div>
  );
}
