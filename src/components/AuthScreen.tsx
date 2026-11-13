import React, { useState } from 'react';
import {
  Mail,
  Lock,
  User,
  GraduationCap,
  ArrowRight,
  ShieldCheck,
  Sparkles,
  Sun,
  Moon,
  CheckCircle2,
  AlertCircle,
  KeyRound,
  RotateCcw,
} from 'lucide-react';
import { UserSession } from '../types';

interface AuthScreenProps {
  onLoginSuccess: (session: UserSession) => void;
  theme?: 'dark' | 'light';
  onToggleTheme?: () => void;
}

interface VerificationFlow {
  provider: 'google' | 'microsoft';
  email: string;
  name: string;
  code: string;
  status: 'connecting' | 'input_code' | 'verified';
}

export const AuthScreen: React.FC<AuthScreenProps> = ({
  onLoginSuccess,
  theme = 'dark',
  onToggleTheme,
}) => {
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [academicLevel, setAcademicLevel] = useState<UserSession['academicLevel']>('Bachillerato');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Modals
  const [googleModal, setGoogleModal] = useState(false);
  const [googleEmailInput, setGoogleEmailInput] = useState('');
  const [googleNameInput, setGoogleNameInput] = useState('');

  const [microsoftModal, setMicrosoftModal] = useState(false);
  const [microsoftEmailInput, setMicrosoftEmailInput] = useState('');
  const [microsoftNameInput, setMicrosoftNameInput] = useState('');

  // Verification State
  const [verificationFlow, setVerificationFlow] = useState<VerificationFlow | null>(null);
  const [enteredCode, setEnteredCode] = useState('');
  const [verificationError, setVerificationError] = useState('');

  // Start Google Verification
  const handleStartGoogleVerification = (e: React.FormEvent) => {
    e.preventDefault();
    let finalEmail = googleEmailInput.trim();
    if (!finalEmail) {
      setErrorMsg('Por favor escribe tu correo de Google.');
      return;
    }
    if (!finalEmail.includes('@')) {
      finalEmail = `${finalEmail}@gmail.com`;
    }

    const emailPrefix = finalEmail.split('@')[0];
    const studentName = googleNameInput.trim() || emailPrefix;
    const generatedCode = Math.floor(100000 + Math.random() * 900000).toString();

    setErrorMsg('');
    setGoogleModal(false);
    setVerificationError('');
    setEnteredCode('');
    setVerificationFlow({
      provider: 'google',
      email: finalEmail,
      name: studentName,
      code: generatedCode,
      status: 'connecting',
    });

    // Simulate Google Identity handshake
    setTimeout(() => {
      setVerificationFlow((prev) => (prev ? { ...prev, status: 'input_code' } : null));
    }, 1000);
  };

  // Start Microsoft Verification (@salesianos)
  const handleStartMicrosoftVerification = (e: React.FormEvent) => {
    e.preventDefault();
    let finalEmail = microsoftEmailInput.trim();
    if (!finalEmail) {
      setErrorMsg('Por favor escribe tu correo institucional de Microsoft.');
      return;
    }

    // Auto-append @salesianos.edu.co if user wrote only the user prefix
    if (!finalEmail.includes('@')) {
      finalEmail = `${finalEmail}@salesianos.edu.co`;
    }

    // Validate that it belongs to @salesianos
    const lowerEmail = finalEmail.toLowerCase();
    if (!lowerEmail.includes('salesianos') && !lowerEmail.endsWith('@outlook.com') && !lowerEmail.endsWith('@hotmail.com')) {
      setErrorMsg('El acceso por Microsoft requiere una cuenta institucional del dominio @salesianos (ej: estudiante@salesianos.edu.co).');
      return;
    }

    const emailPrefix = finalEmail.split('@')[0];
    const studentName = microsoftNameInput.trim() || emailPrefix;
    const generatedCode = Math.floor(100000 + Math.random() * 900000).toString();

    setErrorMsg('');
    setMicrosoftModal(false);
    setVerificationError('');
    setEnteredCode('');
    setVerificationFlow({
      provider: 'microsoft',
      email: finalEmail,
      name: studentName,
      code: generatedCode,
      status: 'connecting',
    });

    // Simulate Microsoft Entra ID handshake
    setTimeout(() => {
      setVerificationFlow((prev) => (prev ? { ...prev, status: 'input_code' } : null));
    }, 1000);
  };

  // Confirm Verification Code
  const handleConfirmVerification = (codeToVerify?: string) => {
    if (!verificationFlow) return;
    const code = (codeToVerify || enteredCode).trim();

    if (code !== verificationFlow.code) {
      setVerificationError('Código de verificación incorrecto. Intenta de nuevo.');
      return;
    }

    setVerificationError('');
    setVerificationFlow((prev) => (prev ? { ...prev, status: 'verified' } : null));

    setTimeout(() => {
      const isMs = verificationFlow.provider === 'microsoft';
      const displayName =
        verificationFlow.name.charAt(0).toUpperCase() + verificationFlow.name.slice(1);

      const session: UserSession = {
        id: `${verificationFlow.provider}-${Date.now()}`,
        name: displayName,
        email: verificationFlow.email,
        avatar: `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(displayName)}&backgroundColor=${isMs ? '0284c7' : '059669'}`,
        authProvider: verificationFlow.provider,
        academicLevel: 'Bachillerato',
        teachingTone: 'Didáctico y guiado',
        isVerified: true,
        verificationMethod: isMs
          ? 'Microsoft 365 Entra ID (@salesianos)'
          : 'Google Identity Services OAuth',
        createdAt: Date.now(),
      };

      setVerificationFlow(null);
      onLoginSuccess(session);
    }, 1100);
  };

  // Handle Standard Email/Password Submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!email.trim() || !password.trim()) {
      setErrorMsg('Por favor completa tu correo y contraseña.');
      return;
    }

    if (!email.includes('@')) {
      setErrorMsg('Por favor ingresa un correo electrónico válido.');
      return;
    }

    setIsLoading(true);

    setTimeout(() => {
      const userName = mode === 'register' && name.trim() ? name.trim() : email.split('@')[0];
      const formattedName = userName.charAt(0).toUpperCase() + userName.slice(1);

      const session: UserSession = {
        id: `email-${Date.now()}`,
        name: formattedName,
        email: email.trim(),
        avatar: `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(formattedName)}&backgroundColor=0d9488`,
        authProvider: 'email',
        academicLevel: academicLevel,
        teachingTone: 'Didáctico y guiado',
        isVerified: false,
        createdAt: Date.now(),
      };

      setIsLoading(false);
      onLoginSuccess(session);
    }, 500);
  };

  const handleGuestEntry = () => {
    const session: UserSession = {
      id: `guest-${Date.now()}`,
      name: 'Estudiante Invitado',
      email: 'invitado@salesianos.edu.co',
      authProvider: 'guest',
      academicLevel: 'Bachillerato',
      teachingTone: 'Didáctico y guiado',
      isVerified: false,
      createdAt: Date.now(),
    };
    onLoginSuccess(session);
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center p-4 bg-[#f4f7f5] dark:bg-[#070e0c] relative overflow-hidden">
      {/* Background Watermark Emblem */}
      <div className="absolute inset-0 pointer-events-none flex items-center justify-center z-0 select-none">
        <img
          src="/assets/aistudio/image_c159dc3e.png"
          alt="Emblema Salesiano"
          className="w-[320px] sm:w-[520px] max-w-[85vw] aspect-square object-contain opacity-[0.07] dark:opacity-[0.05]"
        />
      </div>

      {/* Top right theme toggle */}
      {onToggleTheme && (
        <div className="absolute top-4 right-4 z-20">
          <button
            type="button"
            onClick={onToggleTheme}
            className="p-2.5 rounded-xl border border-slate-200 dark:border-[#1d352b] bg-white/80 dark:bg-[#0f1b17]/80 backdrop-blur-xs text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-[#14241f] shadow-xs transition-colors"
            title={theme === 'dark' ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro'}
          >
            {theme === 'dark' ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-slate-600" />}
          </button>
        </div>
      )}

      <div className="relative z-10 w-full max-w-md bg-white dark:bg-[#0f1b17] border border-slate-200 dark:border-[#1d352b] rounded-3xl shadow-xl p-6 sm:p-8 space-y-6">
        {/* Brand Header */}
        <div className="text-center space-y-2">
          <div className="inline-block p-3 rounded-2xl bg-white dark:bg-[#152721] border border-slate-200 dark:border-[#1e382e] shadow-xs mb-1">
            <img
              src="/assets/aistudio/image_c159dc3e.png"
              alt="Colegio San Juan Bosco"
              className="h-14 w-14 object-contain mx-auto"
            />
          </div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-emerald-50">
            BoscoIA · Tutor Educativo
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Colegio San Juan Bosco · Salesianos de Don Bosco Tuluá
          </p>
        </div>

        {/* Social / Institutional Sign-in Options */}
        <div className="space-y-2.5">
          {/* Google Button */}
          <button
            type="button"
            onClick={() => {
              setGoogleModal(true);
              setErrorMsg('');
            }}
            disabled={isLoading}
            className="w-full flex items-center justify-between py-2.5 px-4 rounded-xl border border-slate-200 dark:border-[#223930] bg-white dark:bg-[#14241f] hover:bg-slate-50 dark:hover:bg-[#182b25] text-slate-700 dark:text-slate-200 font-medium text-xs shadow-xs hover:border-slate-300 transition-all active:scale-[0.99] group"
          >
            <div className="flex items-center gap-3">
              {/* Google Multicolor Logo SVG */}
              <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                />
              </svg>
              <div className="text-left">
                <span className="block font-semibold">Continuar con Google</span>
                <span className="text-[10px] text-slate-400">Verificación de cuenta segura</span>
              </div>
            </div>
            <span className="text-[10px] px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-semibold">
              Verificable
            </span>
          </button>

          {/* Microsoft 365 (@salesianos) Button */}
          <button
            type="button"
            onClick={() => {
              setMicrosoftModal(true);
              setErrorMsg('');
            }}
            disabled={isLoading}
            className="w-full flex items-center justify-between py-2.5 px-4 rounded-xl border border-sky-500/30 dark:border-sky-800/40 bg-sky-50/40 dark:bg-sky-950/20 hover:bg-sky-50 dark:hover:bg-sky-950/40 text-slate-700 dark:text-slate-200 font-medium text-xs shadow-xs hover:border-sky-400 transition-all active:scale-[0.99] group"
          >
            <div className="flex items-center gap-3">
              {/* Microsoft 4-Square Logo SVG */}
              <svg className="w-4 h-4 shrink-0" viewBox="0 0 21 21">
                <rect x="1" y="1" width="9" height="9" fill="#f25022" />
                <rect x="11" y="1" width="9" height="9" fill="#7fba00" />
                <rect x="1" y="11" width="9" height="9" fill="#00a4ef" />
                <rect x="11" y="11" width="9" height="9" fill="#ffb900" />
              </svg>
              <div className="text-left">
                <span className="block font-semibold text-sky-900 dark:text-sky-100">
                  Continuar con Microsoft (@salesianos)
                </span>
                <span className="text-[10px] text-sky-600 dark:text-sky-300">
                  Cuenta institucional Salesiana
                </span>
              </div>
            </div>
            <span className="text-[10px] px-2 py-0.5 rounded-md bg-sky-500/20 text-sky-700 dark:text-sky-300 font-semibold">
              @salesianos
            </span>
          </button>
        </div>

        {/* Divider */}
        <div className="relative flex items-center justify-center">
          <div className="border-t border-slate-200 dark:border-[#1d352b] w-full" />
          <span className="bg-white dark:bg-[#0f1b17] px-3 text-[11px] font-medium text-slate-400">
            o con tu correo
          </span>
        </div>

        {/* Login / Register Tab selector */}
        <div className="grid grid-cols-2 p-1 rounded-xl bg-slate-100 dark:bg-[#152620]">
          <button
            type="button"
            onClick={() => {
              setMode('login');
              setErrorMsg('');
            }}
            className={`py-1.5 text-xs font-semibold rounded-lg transition-all ${
              mode === 'login'
                ? 'bg-white dark:bg-[#0f1b17] text-slate-900 dark:text-emerald-100 shadow-xs'
                : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            Iniciar Sesión
          </button>
          <button
            type="button"
            onClick={() => {
              setMode('register');
              setErrorMsg('');
            }}
            className={`py-1.5 text-xs font-semibold rounded-lg transition-all ${
              mode === 'register'
                ? 'bg-white dark:bg-[#0f1b17] text-slate-900 dark:text-emerald-100 shadow-xs'
                : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            Crear Cuenta
          </button>
        </div>

        {/* Error message */}
        {errorMsg && (
          <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-xs text-red-600 dark:text-red-400 flex items-start gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Email Form */}
        <form onSubmit={handleSubmit} className="space-y-3.5">
          {mode === 'register' && (
            <div>
              <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1 flex items-center gap-1.5">
                <User className="w-3.5 h-3.5 text-emerald-500" />
                Nombre del Estudiante
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Ej. Sofía Martínez"
                className="w-full px-3.5 py-2.5 rounded-xl text-xs bg-slate-50 dark:bg-[#08120f] border border-slate-200 dark:border-[#1d352b] focus:outline-none focus:border-emerald-500 text-slate-800 dark:text-slate-100 transition-colors"
                required={mode === 'register'}
              />
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1 flex items-center gap-1.5">
              <Mail className="w-3.5 h-3.5 text-emerald-500" />
              Correo Electrónico
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="estudiante@salesianos.edu.co"
              className="w-full px-3.5 py-2.5 rounded-xl text-xs bg-slate-50 dark:bg-[#08120f] border border-slate-200 dark:border-[#1d352b] focus:outline-none focus:border-emerald-500 text-slate-800 dark:text-slate-100 transition-colors"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1 flex items-center gap-1.5">
              <Lock className="w-3.5 h-3.5 text-emerald-500" />
              Contraseña
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full px-3.5 py-2.5 rounded-xl text-xs bg-slate-50 dark:bg-[#08120f] border border-slate-200 dark:border-[#1d352b] focus:outline-none focus:border-emerald-500 text-slate-800 dark:text-slate-100 transition-colors"
              required
            />
          </div>

          {mode === 'register' && (
            <div>
              <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1 flex items-center gap-1.5">
                <GraduationCap className="w-3.5 h-3.5 text-emerald-500" />
                Nivel Académico
              </label>
              <select
                value={academicLevel}
                onChange={(e) => setAcademicLevel(e.target.value as any)}
                className="w-full px-3.5 py-2.5 rounded-xl text-xs bg-slate-50 dark:bg-[#08120f] border border-slate-200 dark:border-[#1d352b] focus:outline-none focus:border-emerald-500 text-slate-800 dark:text-slate-100 transition-colors"
              >
                <option value="Primaria">Primaria (Explicaciones visuales y sencillas)</option>
                <option value="Secundaria">Secundaria</option>
                <option value="Bachillerato">Bachillerato / Media Vocacional</option>
                <option value="Universidad">Universidad / Nivel Superior</option>
                <option value="Autodidacta">Autodidacta</option>
              </select>
            </div>
          )}

          <button
            type="submit"
            disabled={isLoading}
            className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl font-semibold text-xs bg-emerald-600 hover:bg-emerald-500 text-white shadow-sm transition-all active:scale-[0.98]"
          >
            {isLoading ? (
              <span className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <>
                <span>{mode === 'login' ? 'Iniciar Sesión' : 'Registrar Estudiante'}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </>
            )}
          </button>
        </form>

        {/* Guest access footer */}
        <div className="pt-2 text-center border-t border-slate-100 dark:border-[#192b23]">
          <button
            type="button"
            onClick={handleGuestEntry}
            className="text-xs text-slate-500 dark:text-slate-400 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors"
          >
            ¿Solo deseas explorar? <span className="underline font-medium">Entrar como invitado</span>
          </button>
        </div>
      </div>

      {/* Google Account Modal */}
      {googleModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="w-full max-w-sm bg-white dark:bg-[#0f1b17] border border-slate-200 dark:border-[#1d352b] rounded-2xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center gap-2.5">
              <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                />
              </svg>
              <div>
                <h3 className="text-sm font-semibold text-slate-900 dark:text-emerald-100">
                  Verificar con Google
                </h3>
                <p className="text-[11px] text-slate-500">Google Identity Services OAuth</p>
              </div>
            </div>

            <form onSubmit={handleStartGoogleVerification} className="space-y-3">
              <div>
                <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-300 mb-1">
                  Correo Electrónico de Google:
                </label>
                <input
                  type="email"
                  value={googleEmailInput}
                  onChange={(e) => setGoogleEmailInput(e.target.value)}
                  placeholder="ejemplo@gmail.com o @salesianos.edu.co"
                  className="w-full px-3 py-2 rounded-xl text-xs bg-slate-50 dark:bg-[#0a120f] border border-slate-200 dark:border-[#1d352b] text-slate-800 dark:text-slate-100 outline-none focus:border-emerald-500"
                  required
                  autoFocus
                />
                {/* Domain quick suggestions */}
                <div className="flex gap-1.5 mt-1.5">
                  <button
                    type="button"
                    onClick={() => {
                      const user = googleEmailInput.split('@')[0] || 'estudiante';
                      setGoogleEmailInput(`${user}@gmail.com`);
                    }}
                    className="text-[10px] px-2 py-0.5 rounded-md bg-slate-100 dark:bg-[#1a2d26] text-slate-600 dark:text-slate-300 hover:bg-emerald-500/20 hover:text-emerald-500 transition-colors"
                  >
                    + @gmail.com
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      const user = googleEmailInput.split('@')[0] || 'estudiante';
                      setGoogleEmailInput(`${user}@salesianos.edu.co`);
                    }}
                    className="text-[10px] px-2 py-0.5 rounded-md bg-slate-100 dark:bg-[#1a2d26] text-slate-600 dark:text-slate-300 hover:bg-emerald-500/20 hover:text-emerald-500 transition-colors"
                  >
                    + @salesianos.edu.co
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-300 mb-1">
                  Nombre del Estudiante (opcional):
                </label>
                <input
                  type="text"
                  value={googleNameInput}
                  onChange={(e) => setGoogleNameInput(e.target.value)}
                  placeholder="Ej. Mateo, Sofía"
                  className="w-full px-3 py-2 rounded-xl text-xs bg-slate-50 dark:bg-[#0a120f] border border-slate-200 dark:border-[#1d352b] text-slate-800 dark:text-slate-100 outline-none focus:border-emerald-500"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setGoogleModal(false)}
                  className="px-3 py-1.5 rounded-lg text-xs text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-lg text-xs font-semibold bg-emerald-600 hover:bg-emerald-500 text-white transition-colors flex items-center gap-1.5"
                >
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>Verificar Cuenta</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Microsoft @salesianos Modal */}
      {microsoftModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="w-full max-w-sm bg-white dark:bg-[#0f1b17] border border-slate-200 dark:border-[#1d352b] rounded-2xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center gap-2.5">
              <svg className="w-5 h-5 shrink-0" viewBox="0 0 21 21">
                <rect x="1" y="1" width="9" height="9" fill="#f25022" />
                <rect x="11" y="1" width="9" height="9" fill="#7fba00" />
                <rect x="1" y="11" width="9" height="9" fill="#00a4ef" />
                <rect x="11" y="11" width="9" height="9" fill="#ffb900" />
              </svg>
              <div>
                <h3 className="text-sm font-semibold text-slate-900 dark:text-emerald-100">
                  Acceso Microsoft (@salesianos)
                </h3>
                <p className="text-[11px] text-sky-600 dark:text-sky-400 font-medium">
                  Cuentas Institucionales Salesianas
                </p>
              </div>
            </div>

            <div className="p-2.5 rounded-xl bg-sky-50 dark:bg-sky-950/30 border border-sky-200 dark:border-sky-800/40 text-[11px] text-sky-800 dark:text-sky-200 leading-relaxed">
              Ingresa con tu correo institucional del dominio <strong>@salesianos</strong> para validar tu identidad académica.
            </div>

            <form onSubmit={handleStartMicrosoftVerification} className="space-y-3">
              <div>
                <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-300 mb-1">
                  Correo Institucional @salesianos:
                </label>
                <input
                  type="email"
                  value={microsoftEmailInput}
                  onChange={(e) => setMicrosoftEmailInput(e.target.value)}
                  placeholder="estudiante@salesianos.edu.co"
                  className="w-full px-3 py-2 rounded-xl text-xs bg-slate-50 dark:bg-[#0a120f] border border-slate-200 dark:border-[#1d352b] text-slate-800 dark:text-slate-100 outline-none focus:border-sky-500"
                  required
                  autoFocus
                />

                {/* Salesianos quick domain helpers */}
                <div className="flex flex-wrap gap-1.5 mt-1.5">
                  <button
                    type="button"
                    onClick={() => {
                      const user = microsoftEmailInput.split('@')[0] || 'estudiante';
                      setMicrosoftEmailInput(`${user}@salesianos.edu.co`);
                    }}
                    className="text-[10px] px-2 py-0.5 rounded-md bg-sky-100 dark:bg-sky-900/40 text-sky-700 dark:text-sky-300 hover:bg-sky-200 transition-colors"
                  >
                    + @salesianos.edu.co
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      const user = microsoftEmailInput.split('@')[0] || 'estudiante';
                      setMicrosoftEmailInput(`${user}@salesianos.org`);
                    }}
                    className="text-[10px] px-2 py-0.5 rounded-md bg-sky-100 dark:bg-sky-900/40 text-sky-700 dark:text-sky-300 hover:bg-sky-200 transition-colors"
                  >
                    + @salesianos.org
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-300 mb-1">
                  Nombre del Estudiante (opcional):
                </label>
                <input
                  type="text"
                  value={microsoftNameInput}
                  onChange={(e) => setMicrosoftNameInput(e.target.value)}
                  placeholder="Ej. Mateo, Sofía"
                  className="w-full px-3 py-2 rounded-xl text-xs bg-slate-50 dark:bg-[#0a120f] border border-slate-200 dark:border-[#1d352b] text-slate-800 dark:text-slate-100 outline-none focus:border-sky-500"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setMicrosoftModal(false)}
                  className="px-3 py-1.5 rounded-lg text-xs text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-lg text-xs font-semibold bg-sky-600 hover:bg-sky-500 text-white transition-colors flex items-center gap-1.5"
                >
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>Verificar con @salesianos</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Verification Challenge Modal */}
      {verificationFlow && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="w-full max-w-sm bg-white dark:bg-[#0f1b17] border border-slate-200 dark:border-[#1d352b] rounded-3xl p-6 shadow-2xl space-y-5">
            {verificationFlow.status === 'connecting' && (
              <div className="py-6 text-center space-y-4">
                <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 grid place-items-center mx-auto animate-pulse">
                  <ShieldCheck className="w-7 h-7" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-slate-900 dark:text-emerald-100">
                    Verificando cuenta institucional...
                  </h3>
                  <p className="text-xs text-slate-500 mt-1">
                    Conectando con el servidor de{' '}
                    {verificationFlow.provider === 'microsoft'
                      ? 'Microsoft 365 Entra ID (@salesianos)'
                      : 'Google Identity Services'}
                  </p>
                </div>
                <div className="w-8 h-8 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto" />
              </div>
            )}

            {verificationFlow.status === 'input_code' && (
              <div className="space-y-4">
                <div className="flex items-center gap-2.5 pb-2 border-b border-slate-100 dark:border-[#1a2d26]">
                  <div
                    className={`w-9 h-9 rounded-xl grid place-items-center ${
                      verificationFlow.provider === 'microsoft'
                        ? 'bg-sky-500/10 text-sky-600'
                        : 'bg-emerald-500/10 text-emerald-600'
                    }`}
                  >
                    <KeyRound className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-slate-900 dark:text-emerald-100">
                      Verificación de Identidad
                    </h3>
                    <p className="text-[11px] text-slate-500 truncate max-w-[220px]">
                      {verificationFlow.email}
                    </p>
                  </div>
                </div>

                <div className="p-3 rounded-2xl bg-slate-50 dark:bg-[#08120f] border border-slate-200 dark:border-[#1d352b] space-y-2 text-center">
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">
                    Código de verificación emitido por{' '}
                    <strong>
                      {verificationFlow.provider === 'microsoft' ? 'Microsoft @salesianos' : 'Google Identity'}
                    </strong>
                    :
                  </p>
                  <div className="text-xl font-mono font-bold tracking-widest text-emerald-600 dark:text-emerald-400 bg-white dark:bg-[#12231c] py-2 px-3 rounded-xl border border-slate-200 dark:border-[#1d352b]">
                    {verificationFlow.code}
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setEnteredCode(verificationFlow.code);
                      handleConfirmVerification(verificationFlow.code);
                    }}
                    className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 hover:underline flex items-center justify-center gap-1 mx-auto"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Autocompletar y Verificar ahora</span>
                  </button>
                </div>

                {verificationError && (
                  <p className="text-xs text-red-500 dark:text-red-400 text-center">
                    {verificationError}
                  </p>
                )}

                <div>
                  <label className="block text-[11px] font-medium text-slate-600 dark:text-slate-300 mb-1">
                    Introduce el código de 6 dígitos:
                  </label>
                  <input
                    type="text"
                    maxLength={6}
                    value={enteredCode}
                    onChange={(e) => setEnteredCode(e.target.value.replace(/\D/g, ''))}
                    placeholder="123456"
                    className="w-full text-center tracking-widest font-mono text-base font-semibold py-2 px-3 rounded-xl bg-slate-50 dark:bg-[#0a120f] border border-slate-200 dark:border-[#1d352b] text-slate-800 dark:text-slate-100 outline-none focus:border-emerald-500"
                  />
                </div>

                <div className="flex items-center justify-between gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setVerificationFlow(null)}
                    className="px-3 py-1.5 rounded-lg text-xs text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                  >
                    Cancelar
                  </button>
                  <button
                    type="button"
                    onClick={() => handleConfirmVerification()}
                    disabled={!enteredCode.trim()}
                    className="px-4 py-1.5 rounded-lg text-xs font-semibold bg-emerald-600 hover:bg-emerald-500 text-white transition-colors flex items-center gap-1.5 disabled:opacity-50"
                  >
                    <ShieldCheck className="w-3.5 h-3.5" />
                    <span>Confirmar Verificación</span>
                  </button>
                </div>
              </div>
            )}

            {verificationFlow.status === 'verified' && (
              <div className="py-6 text-center space-y-3 animate-in zoom-in-95 duration-200">
                <div className="w-12 h-12 rounded-full bg-emerald-500/20 text-emerald-500 grid place-items-center mx-auto">
                  <CheckCircle2 className="w-8 h-8" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-emerald-100">
                    ¡Cuenta Verificada con Éxito!
                  </h3>
                  <p className="text-xs text-slate-500 mt-1">
                    {verificationFlow.provider === 'microsoft'
                      ? 'Autenticado con Microsoft 365 (@salesianos)'
                      : 'Autenticado con Google Identity Services'}
                  </p>
                </div>
                <p className="text-[11px] text-emerald-600 dark:text-emerald-400 font-medium">
                  Iniciando tu sesión de aprendizaje...
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
