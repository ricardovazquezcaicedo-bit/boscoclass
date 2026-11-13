import React, { useState } from 'react';
import {
  User,
  Lock,
  ArrowRight,
  ShieldCheck,
  Sparkles,
  GraduationCap,
  Briefcase,
  Building,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  Sun,
  Moon,
  Coins,
} from 'lucide-react';
import { UserSession, ClassPointUser } from '../types';
import { ClassPointService } from '../services/classPointStorage';

interface ClassPointAuthProps {
  onLoginSuccess: (session: UserSession) => void;
  theme?: 'dark' | 'light';
  onToggleTheme?: () => void;
}

interface VerificationFlow {
  provider: 'google' | 'microsoft';
  email: string;
  name: string;
  role: 'estudiante' | 'profesor' | 'administrador';
  code: string;
  status: 'connecting' | 'input_code' | 'verified';
}

export const ClassPointAuth: React.FC<ClassPointAuthProps> = ({
  onLoginSuccess,
  theme = 'light',
  onToggleTheme,
}) => {
  const [isRegistering, setIsRegistering] = useState(false);
  const [usernameInput, setUsernameInput] = useState('');
  const [passwordInput, setPasswordInput] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Register Form State
  const [regRole, setRegRole] = useState<'estudiante' | 'profesor' | 'administrador'>('estudiante');
  const [regInstitucion, setRegInstitucion] = useState('Colegio San Juan Bosco');
  const [regUsuario, setRegUsuario] = useState('');
  const [regNombre, setRegNombre] = useState('');
  const [regClave, setRegClave] = useState('');
  const [regCorreo, setRegCorreo] = useState('');

  // OAuth Modals & Verification Flow
  const [googleModal, setGoogleModal] = useState(false);
  const [googleEmailInput, setGoogleEmailInput] = useState('');
  const [googleNameInput, setGoogleNameInput] = useState('');

  const [microsoftModal, setMicrosoftModal] = useState(false);
  const [microsoftEmailInput, setMicrosoftEmailInput] = useState('');
  const [microsoftNameInput, setMicrosoftNameInput] = useState('');

  const [verificationFlow, setVerificationFlow] = useState<VerificationFlow | null>(null);
  const [enteredCode, setEnteredCode] = useState('');
  const [verificationError, setVerificationError] = useState('');

  // Handle Standard ClassPoint Login
  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    const cleanUser = usernameInput.trim();
    const cleanPass = passwordInput.trim();

    if (!cleanUser || !cleanPass) {
      setErrorMsg('Ingresa tu usuario y contraseña de ClassPoint.');
      return;
    }

    const authUser = ClassPointService.authenticateUser(cleanUser, cleanPass);
    if (!authUser) {
      setErrorMsg('Usuario o contraseña incorrectos. Revisa los accesos rápidos abajo.');
      return;
    }

    const session: UserSession = {
      id: `cp-${authUser.usuario}-${Date.now()}`,
      name: authUser.nombre,
      username: authUser.usuario,
      email: authUser.email || `${authUser.usuario}@salesianos.edu.co`,
      role: authUser.rol,
      avatar:
        authUser.avatar ||
        `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(
          authUser.nombre
        )}&backgroundColor=176b87`,
      authProvider: 'email',
      academicLevel: 'Bachillerato',
      teachingTone: 'Didáctico y guiado',
      institutionId: 'sanjuanbosco',
      institutionName: authUser.institucion,
      isVerified: true,
      createdAt: Date.now(),
    };

    onLoginSuccess(session);
  };

  // Quick 1-Click Access for Instant Testing
  const handleQuickLogin = (usuario: string, clave: string) => {
    setUsernameInput(usuario);
    setPasswordInput(clave);
    setErrorMsg('');
    const authUser = ClassPointService.authenticateUser(usuario, clave);
    if (authUser) {
      const session: UserSession = {
        id: `cp-${authUser.usuario}-${Date.now()}`,
        name: authUser.nombre,
        username: authUser.usuario,
        email: authUser.email || `${authUser.usuario}@salesianos.edu.co`,
        role: authUser.rol,
        avatar:
          authUser.avatar ||
          `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(
            authUser.nombre
          )}&backgroundColor=176b87`,
        authProvider: 'email',
        academicLevel: 'Bachillerato',
        teachingTone: 'Didáctico y guiado',
        institutionId: 'sanjuanbosco',
        institutionName: authUser.institucion,
        isVerified: true,
        createdAt: Date.now(),
      };
      onLoginSuccess(session);
    }
  };

  // Handle Account Registration
  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    if (!regUsuario.trim() || !regNombre.trim() || !regClave.trim()) {
      setErrorMsg('Por favor completa todos los campos obligatorios.');
      return;
    }

    const newUser: ClassPointUser = {
      usuario: regUsuario.trim().toLowerCase(),
      clave: regClave.trim(),
      nombre: regNombre.trim(),
      rol: regRole,
      institucion: regInstitucion.trim() || 'Colegio San Juan Bosco',
      email: regCorreo.trim() || `${regUsuario.trim()}@salesianos.edu.co`,
    };

    const res = ClassPointService.registerUser(newUser);
    if (!res.success) {
      setErrorMsg(res.message);
      return;
    }

    setSuccessMsg('¡Cuenta de ClassPoint creada con éxito! Ya puedes iniciar sesión.');
    setUsernameInput(newUser.usuario);
    setPasswordInput(newUser.clave);
    setTimeout(() => {
      setIsRegistering(false);
      setSuccessMsg('');
    }, 1500);
  };

  // Start Google Verification
  const handleStartGoogle = (e: React.FormEvent) => {
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
      role: 'estudiante',
      code: generatedCode,
      status: 'connecting',
    });

    setTimeout(() => {
      setVerificationFlow((prev) => (prev ? { ...prev, status: 'input_code' } : null));
    }, 1000);
  };

  // Start Microsoft Verification (@salesianos)
  const handleStartMicrosoft = (e: React.FormEvent) => {
    e.preventDefault();
    let finalEmail = microsoftEmailInput.trim();
    if (!finalEmail) {
      setErrorMsg('Por favor escribe tu correo institucional de Microsoft.');
      return;
    }
    if (!finalEmail.includes('@')) {
      finalEmail = `${finalEmail}@salesianos.edu.co`;
    }

    const lower = finalEmail.toLowerCase();
    if (!lower.includes('salesianos') && !lower.endsWith('@outlook.com') && !lower.endsWith('@hotmail.com')) {
      setErrorMsg('El acceso institucional requiere el dominio @salesianos (ej: estudiante@salesianos.edu.co).');
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
      role: 'estudiante',
      code: generatedCode,
      status: 'connecting',
    });

    setTimeout(() => {
      setVerificationFlow((prev) => (prev ? { ...prev, status: 'input_code' } : null));
    }, 1000);
  };

  // Confirm Verification Code
  const handleConfirmVerification = () => {
    if (!verificationFlow) return;
    if (enteredCode.trim() !== verificationFlow.code) {
      setVerificationError('Código de verificación incorrecto. Revisa el código de 6 dígitos.');
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
        username: verificationFlow.email.split('@')[0],
        email: verificationFlow.email,
        role: verificationFlow.role,
        avatar: `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(
          displayName
        )}&backgroundColor=${isMs ? '0284c7' : '059669'}`,
        authProvider: verificationFlow.provider,
        academicLevel: 'Bachillerato',
        teachingTone: 'Didáctico y guiado',
        institutionId: 'sanjuanbosco',
        institutionName: 'Colegio San Juan Bosco',
        isVerified: true,
        verificationMethod: isMs ? 'Microsoft Entra ID (@salesianos)' : 'Google Workspace Identity',
        createdAt: Date.now(),
      };

      setVerificationFlow(null);
      onLoginSuccess(session);
    }, 1000);
  };

  return (
    <div className="min-h-screen w-full flex flex-col bg-[#f4f8f8] text-[#203b50] relative selection:bg-[#50c6b3]/30">
      
      {/* Top Banner Header */}
      <header className="w-full bg-gradient-to-r from-[#103d5b] via-[#176b87] to-[#258ca0] text-white py-3 px-4 shadow-lg border-b-4 border-[#50c6b3]">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            {/* ClassPoint Dialog Mark */}
            <div className="w-10 h-10 rounded-2xl bg-[#50c6b3] shadow-md grid place-items-center text-[#12344d] font-black shrink-0">
              <svg viewBox="0 0 48 48" className="w-7 h-7 overflow-visible" role="img">
                <path
                  d="M14 8h20a6 6 0 0 1 6 6v14a6 6 0 0 1-6 6H22l-7 6v-6h-1a6 6 0 0 1-6-6V14a6 6 0 0 1 6-6Z"
                  fill="#50c6b3"
                  stroke="#50c6b3"
                  strokeWidth="1.5"
                />
                <path d="M16 17h16M16 24h11" stroke="#12344d" strokeWidth="3" strokeLinecap="round" fill="none" />
                <circle cx="33" cy="29" r="3.2" fill="#fff1b8" />
              </svg>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-black tracking-tight leading-none text-white">
                  Class<span className="text-[#7be2cb]">Point</span>
                </h1>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-[#0d2a3f] text-[#50c6b3] border border-[#50c6b3]/40">
                  + BoscoIA Suite
                </span>
              </div>
              <p className="text-[11px] text-white/80 font-medium">
                Colegio San Juan Bosco · Plataforma Educativa y Tutor Inteligente
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {onToggleTheme && (
              <button
                type="button"
                onClick={onToggleTheme}
                className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-colors text-xs"
                title="Cambiar tema visual"
              >
                {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Main Login Shell */}
      <main className="flex-1 flex items-center justify-center p-4 sm:p-6">
        <div className="w-full max-w-4xl grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
          
          {/* Left Column: Educational Overview & Values */}
          <div className="lg:col-span-6 space-y-5">
            <div className="space-y-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-[#d9f5ef] text-[#176b87] border border-[#9bdccd]">
                <Sparkles className="w-3.5 h-3.5" />
                Acceso Oficial ClassPoint + BoscoIA
              </span>
              <h2 className="text-3xl sm:text-4xl font-black text-[#12344d] leading-tight tracking-tight">
                Demuestra, Valida y <span className="text-[#176b87]">Evoluciona</span>
              </h2>
              <p className="text-sm text-[#586d82] leading-relaxed">
                Ingresa con tu cuenta de ClassPoint para acceder a tus materias, aulas, tareas, calificaciones y al tutor inteligente <strong>BoscoIA</strong> con soporte matemático KaTeX y diagramas científicos.
              </p>
            </div>

            {/* Feature Cards Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="p-3.5 rounded-2xl bg-white border border-[#dce9ef] shadow-xs">
                <div className="w-8 h-8 rounded-xl bg-[#d9f5ef] text-[#176b87] grid place-items-center mb-2 font-bold text-sm">
                  📚
                </div>
                <h3 className="text-xs font-bold text-[#12344d]">Aulas y Calificaciones</h3>
                <p className="text-[11px] text-[#586d82]">
                  Ponderación de 1 a 4 periodos, tareas asignadas y registro de asistencia.
                </p>
              </div>

              <div className="p-3.5 rounded-2xl bg-white border border-[#dce9ef] shadow-xs">
                <div className="w-8 h-8 rounded-xl bg-[#fff2d6] text-[#b45309] grid place-items-center mb-2 font-bold text-sm">
                  🪙
                </div>
                <h3 className="text-xs font-bold text-[#12344d]">Boscoints y Mercado</h3>
                <p className="text-[11px] text-[#586d82]">
                  Gana coints aprendiendo y canjea reconocimientos en la tienda escolar.
                </p>
              </div>

              <div className="p-3.5 rounded-2xl bg-white border border-[#dce9ef] shadow-xs">
                <div className="w-8 h-8 rounded-xl bg-[#e8faf4] text-[#10b981] grid place-items-center mb-2 font-bold text-sm">
                  🤖
                </div>
                <h3 className="text-xs font-bold text-[#12344d]">Tutor BoscoIA</h3>
                <p className="text-[11px] text-[#586d82]">
                  Explicaciones paso a paso, fracciones KaTeX y diagramas biológicos en alta resolución.
                </p>
              </div>

              <div className="p-3.5 rounded-2xl bg-white border border-[#dce9ef] shadow-xs">
                <div className="w-8 h-8 rounded-xl bg-[#e0f2fe] text-[#0284c7] grid place-items-center mb-2 font-bold text-sm">
                  🔒
                </div>
                <h3 className="text-xs font-bold text-[#12344d]">Control Docente</h3>
                <p className="text-[11px] text-[#586d82]">
                  Profesores y directores pueden configurar y bloquear la IA en evaluaciones.
                </p>
              </div>
            </div>

            {/* Quick Access Account Selector */}
            <div className="p-4 rounded-2xl bg-gradient-to-br from-[#176b87]/5 to-[#50c6b3]/10 border border-[#bde5dc]">
              <span className="text-[11px] font-extrabold uppercase tracking-wider text-[#176b87] block mb-2">
                Accesos Rápidos de Demostración:
              </span>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <button
                  type="button"
                  onClick={() => handleQuickLogin('ana', '1234')}
                  className="p-2.5 rounded-xl bg-white hover:bg-[#d9f5ef] border border-[#cfe1e6] text-left transition-all hover:scale-[1.01] shadow-2xs group"
                >
                  <div className="flex items-center gap-2">
                    <span className="w-6 h-6 rounded-lg bg-emerald-100 text-emerald-800 font-bold grid place-items-center text-[11px]">
                      A
                    </span>
                    <div className="min-w-0">
                      <p className="font-bold text-[#12344d] truncate">Ana García</p>
                      <p className="text-[10px] text-emerald-600 font-semibold">Estudiante (1234)</p>
                    </div>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => handleQuickLogin('luis', '5678')}
                  className="p-2.5 rounded-xl bg-white hover:bg-[#d9f5ef] border border-[#cfe1e6] text-left transition-all hover:scale-[1.01] shadow-2xs group"
                >
                  <div className="flex items-center gap-2">
                    <span className="w-6 h-6 rounded-lg bg-teal-100 text-teal-800 font-bold grid place-items-center text-[11px]">
                      L
                    </span>
                    <div className="min-w-0">
                      <p className="font-bold text-[#12344d] truncate">Luis Pérez</p>
                      <p className="text-[10px] text-teal-600 font-semibold">Estudiante (5678)</p>
                    </div>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => handleQuickLogin('profesor', 'admin')}
                  className="p-2.5 rounded-xl bg-white hover:bg-[#d9f5ef] border border-[#cfe1e6] text-left transition-all hover:scale-[1.01] shadow-2xs group"
                >
                  <div className="flex items-center gap-2">
                    <span className="w-6 h-6 rounded-lg bg-blue-100 text-blue-800 font-bold grid place-items-center text-[11px]">
                      P
                    </span>
                    <div className="min-w-0">
                      <p className="font-bold text-[#12344d] truncate">Prof. Ricardo Gómez</p>
                      <p className="text-[10px] text-blue-600 font-semibold">Profesor (admin)</p>
                    </div>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => handleQuickLogin('admin', 'admin')}
                  className="p-2.5 rounded-xl bg-white hover:bg-[#d9f5ef] border border-[#cfe1e6] text-left transition-all hover:scale-[1.01] shadow-2xs group"
                >
                  <div className="flex items-center gap-2">
                    <span className="w-6 h-6 rounded-lg bg-amber-100 text-amber-800 font-bold grid place-items-center text-[11px]">
                      D
                    </span>
                    <div className="min-w-0">
                      <p className="font-bold text-[#12344d] truncate">Director / Admin</p>
                      <p className="text-[10px] text-amber-600 font-semibold">Control Maestro (admin)</p>
                    </div>
                  </div>
                </button>
              </div>
            </div>
          </div>

          {/* Right Column: Authentic ClassPoint Login Form Card */}
          <div className="lg:col-span-6">
            <div className="bg-white rounded-3xl border-t-4 border-[#50c6b3] border-x border-b border-[#cfe1e6] p-6 sm:p-8 shadow-xl relative">
              
              <div className="mb-5">
                <h3 className="text-xl font-extrabold text-[#12344d] flex items-center gap-2">
                  {isRegistering ? 'Crear cuenta en ClassPoint' : 'Iniciar sesión en ClassPoint'}
                </h3>
                <p className="text-xs text-[#586d82] mt-1">
                  {isRegistering
                    ? 'Regístrate como estudiante, profesor o administrador institucional'
                    : 'Ingresa tu usuario institucional de ClassPoint para continuar'}
                </p>
              </div>

              {errorMsg && (
                <div className="mb-4 p-3 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{errorMsg}</span>
                </div>
              )}

              {successMsg && (
                <div className="mb-4 p-3 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 shrink-0" />
                  <span>{successMsg}</span>
                </div>
              )}

              {/* Standard ClassPoint Login Form */}
              {!isRegistering ? (
                <form onSubmit={handleLogin} className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-[#12344d] mb-1">
                      Usuario de ClassPoint
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                        <User className="w-4 h-4" />
                      </div>
                      <input
                        type="text"
                        value={usernameInput}
                        onChange={(e) => setUsernameInput(e.target.value)}
                        placeholder="Ej. admin, profesor, ana, luis..."
                        autoComplete="username"
                        required
                        className="w-full pl-10 pr-3.5 py-2.5 text-xs rounded-xl border border-[#c8d9e5] bg-[#fbfdfe] text-[#12344d] focus:outline-none focus:ring-2 focus:ring-[#50c6b3] focus:border-transparent"
                      />
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="block text-xs font-bold text-[#12344d]">
                        Contraseña
                      </label>
                      <span className="text-[10px] text-slate-400">
                        Por defecto: admin / 1234 / 5678
                      </span>
                    </div>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                        <Lock className="w-4 h-4" />
                      </div>
                      <input
                        type="password"
                        value={passwordInput}
                        onChange={(e) => setPasswordInput(e.target.value)}
                        placeholder="Contraseña de acceso"
                        autoComplete="current-password"
                        required
                        className="w-full pl-10 pr-3.5 py-2.5 text-xs rounded-xl border border-[#c8d9e5] bg-[#fbfdfe] text-[#12344d] focus:outline-none focus:ring-2 focus:ring-[#50c6b3] focus:border-transparent"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="w-full py-3 px-4 rounded-xl font-bold text-xs text-white bg-gradient-to-r from-[#176b87] to-[#258ca0] hover:from-[#135870] hover:to-[#1e7687] shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 active:scale-[0.99]"
                  >
                    <span>Entrar a ClassPoint</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>

                  {/* SSO Dividers */}
                  <div className="relative my-4">
                    <div className="absolute inset-0 flex items-center">
                      <div className="w-full border-t border-slate-200"></div>
                    </div>
                    <div className="relative flex justify-center text-[11px] uppercase">
                      <span className="bg-white px-3 text-slate-400 font-bold">O accede con</span>
                    </div>
                  </div>

                  {/* Google and Microsoft Buttons */}
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setGoogleModal(true)}
                      className="py-2.5 px-3 rounded-xl border border-slate-200 hover:border-slate-300 hover:bg-slate-50 transition-colors flex items-center justify-center gap-2 text-xs font-semibold text-slate-700"
                    >
                      <svg className="w-4 h-4" viewBox="0 0 24 24">
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
                      <span>Google</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setMicrosoftModal(true)}
                      className="py-2.5 px-3 rounded-xl border border-slate-200 hover:border-slate-300 hover:bg-slate-50 transition-colors flex items-center justify-center gap-2 text-xs font-semibold text-slate-700"
                    >
                      <svg className="w-4 h-4" viewBox="0 0 23 23">
                        <path fill="#f35325" d="M1 1h10v10H1z" />
                        <path fill="#81bc06" d="M12 1h10v10H12z" />
                        <path fill="#05a6f0" d="M1 12h10v10H1z" />
                        <path fill="#ffba08" d="M12 12h10v10H12z" />
                      </svg>
                      <span>@salesianos</span>
                    </button>
                  </div>

                  <div className="pt-2 text-center">
                    <button
                      type="button"
                      onClick={() => setIsRegistering(true)}
                      className="text-xs font-semibold text-[#176b87] hover:underline"
                    >
                      ¿No tienes cuenta? Crear nuevo inicio de sesión
                    </button>
                  </div>
                </form>
              ) : (
                /* Registration Form */
                <form onSubmit={handleRegister} className="space-y-3.5">
                  <div className="grid grid-cols-3 gap-2">
                    <button
                      type="button"
                      onClick={() => setRegRole('estudiante')}
                      className={`p-2 rounded-xl text-center border text-xs font-bold transition-all ${
                        regRole === 'estudiante'
                          ? 'bg-[#50c6b3] text-[#12344d] border-[#50c6b3]'
                          : 'bg-slate-50 text-slate-600 border-slate-200'
                      }`}
                    >
                      Estudiante
                    </button>
                    <button
                      type="button"
                      onClick={() => setRegRole('profesor')}
                      className={`p-2 rounded-xl text-center border text-xs font-bold transition-all ${
                        regRole === 'profesor'
                          ? 'bg-[#50c6b3] text-[#12344d] border-[#50c6b3]'
                          : 'bg-slate-50 text-slate-600 border-slate-200'
                      }`}
                    >
                      Profesor
                    </button>
                    <button
                      type="button"
                      onClick={() => setRegRole('administrador')}
                      className={`p-2 rounded-xl text-center border text-xs font-bold transition-all ${
                        regRole === 'administrador'
                          ? 'bg-[#50c6b3] text-[#12344d] border-[#50c6b3]'
                          : 'bg-slate-50 text-slate-600 border-slate-200'
                      }`}
                    >
                      Director
                    </button>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-[#12344d] mb-1">
                      Institución Educativa
                    </label>
                    <input
                      type="text"
                      value={regInstitucion}
                      onChange={(e) => setRegInstitucion(e.target.value)}
                      placeholder="Colegio San Juan Bosco"
                      required
                      className="w-full px-3.5 py-2 text-xs rounded-xl border border-[#c8d9e5] bg-[#fbfdfe]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-[#12344d] mb-1">
                      Nombre Completo
                    </label>
                    <input
                      type="text"
                      value={regNombre}
                      onChange={(e) => setRegNombre(e.target.value)}
                      placeholder="Ej. Mateo Gómez Restrepo"
                      required
                      className="w-full px-3.5 py-2 text-xs rounded-xl border border-[#c8d9e5] bg-[#fbfdfe]"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-xs font-bold text-[#12344d] mb-1">
                        Usuario
                      </label>
                      <input
                        type="text"
                        value={regUsuario}
                        onChange={(e) => setRegUsuario(e.target.value)}
                        placeholder="mateo.gomez"
                        required
                        className="w-full px-3.5 py-2 text-xs rounded-xl border border-[#c8d9e5] bg-[#fbfdfe]"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-[#12344d] mb-1">
                        Contraseña
                      </label>
                      <input
                        type="password"
                        value={regClave}
                        onChange={(e) => setRegClave(e.target.value)}
                        placeholder="Mínimo 4 caracteres"
                        required
                        className="w-full px-3.5 py-2 text-xs rounded-xl border border-[#c8d9e5] bg-[#fbfdfe]"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-[#12344d] mb-1">
                      Correo Electrónico (Opcional)
                    </label>
                    <input
                      type="email"
                      value={regCorreo}
                      onChange={(e) => setRegCorreo(e.target.value)}
                      placeholder="mateo@salesianos.edu.co"
                      className="w-full px-3.5 py-2 text-xs rounded-xl border border-[#c8d9e5] bg-[#fbfdfe]"
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full py-2.5 px-4 rounded-xl font-bold text-xs text-white bg-gradient-to-r from-[#176b87] to-[#258ca0] hover:from-[#135870] hover:to-[#1e7687] shadow-sm transition-all"
                  >
                    Crear Cuenta en ClassPoint
                  </button>

                  <div className="text-center pt-1">
                    <button
                      type="button"
                      onClick={() => setIsRegistering(false)}
                      className="text-xs font-semibold text-slate-500 hover:text-slate-800"
                    >
                      ← Volver a inicio de sesión
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
      </main>

      {/* Google Modal Handshake */}
      {googleModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="w-full max-w-sm bg-white rounded-3xl p-6 shadow-2xl border border-slate-200">
            <h3 className="text-base font-bold text-slate-800 mb-2 flex items-center gap-2">
              <span>Acceso con Google</span>
            </h3>
            <p className="text-xs text-slate-500 mb-4">
              Ingresa tu correo de Google para vincular tu identidad académica.
            </p>
            <form onSubmit={handleStartGoogle} className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Tu Nombre</label>
                <input
                  type="text"
                  value={googleNameInput}
                  onChange={(e) => setGoogleNameInput(e.target.value)}
                  placeholder="Ej. Camila Morales"
                  className="w-full p-2.5 text-xs rounded-xl border border-slate-300"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Correo de Google</label>
                <input
                  type="email"
                  value={googleEmailInput}
                  onChange={(e) => setGoogleEmailInput(e.target.value)}
                  placeholder="estudiante@gmail.com"
                  required
                  className="w-full p-2.5 text-xs rounded-xl border border-slate-300"
                />
              </div>
              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setGoogleModal(false)}
                  className="w-1/2 py-2 text-xs font-semibold border border-slate-300 rounded-xl"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="w-1/2 py-2 text-xs font-bold text-white bg-blue-600 rounded-xl hover:bg-blue-500"
                >
                  Continuar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Microsoft Modal Handshake */}
      {microsoftModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="w-full max-w-sm bg-white rounded-3xl p-6 shadow-2xl border border-slate-200">
            <h3 className="text-base font-bold text-slate-800 mb-2 flex items-center gap-2">
              <span>Acceso Microsoft (@salesianos)</span>
            </h3>
            <p className="text-xs text-slate-500 mb-4">
              Ingresa tu cuenta institucional de la red salesiana para autenticarte.
            </p>
            <form onSubmit={handleStartMicrosoft} className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Tu Nombre</label>
                <input
                  type="text"
                  value={microsoftNameInput}
                  onChange={(e) => setMicrosoftNameInput(e.target.value)}
                  placeholder="Ej. Mateo Gómez"
                  className="w-full p-2.5 text-xs rounded-xl border border-slate-300"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Correo Institucional</label>
                <input
                  type="email"
                  value={microsoftEmailInput}
                  onChange={(e) => setMicrosoftEmailInput(e.target.value)}
                  placeholder="usuario@salesianos.edu.co"
                  required
                  className="w-full p-2.5 text-xs rounded-xl border border-slate-300"
                />
              </div>
              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setMicrosoftModal(false)}
                  className="w-1/2 py-2 text-xs font-semibold border border-slate-300 rounded-xl"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="w-1/2 py-2 text-xs font-bold text-white bg-sky-700 rounded-xl hover:bg-sky-600"
                >
                  Verificar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Verification Code Flow */}
      {verificationFlow && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs">
          <div className="w-full max-w-sm bg-white rounded-3xl p-6 shadow-2xl border border-slate-200">
            <h3 className="text-base font-bold text-slate-800 mb-1">Verificación de Seguridad</h3>
            <p className="text-xs text-slate-500 mb-4">
              Hemos enviado un código a <strong>{verificationFlow.email}</strong>.
            </p>
            {verificationFlow.status === 'connecting' ? (
              <div className="py-6 text-center text-xs font-semibold text-slate-500">
                Conectando con el servidor de autenticación...
              </div>
            ) : verificationFlow.status === 'verified' ? (
              <div className="py-6 text-center text-xs font-bold text-emerald-600">
                ¡Cuenta verificada! Entrando a ClassPoint...
              </div>
            ) : (
              <div className="space-y-3">
                <div className="p-3 bg-slate-50 rounded-xl text-center border">
                  <span className="text-[11px] text-slate-400 block mb-1">Código de demostración generado:</span>
                  <code className="text-lg font-black tracking-widest text-[#176b87]">
                    {verificationFlow.code}
                  </code>
                </div>
                <input
                  type="text"
                  maxLength={6}
                  value={enteredCode}
                  onChange={(e) => setEnteredCode(e.target.value)}
                  placeholder="Escribe el código de 6 dígitos"
                  className="w-full p-3 text-center text-base font-mono tracking-widest rounded-xl border border-slate-300"
                />
                {verificationError && (
                  <p className="text-xs text-rose-600 text-center">{verificationError}</p>
                )}
                <button
                  type="button"
                  onClick={handleConfirmVerification}
                  className="w-full py-2.5 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-500 rounded-xl"
                >
                  Validar y Entrar a ClassPoint
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="w-full py-3 px-4 text-center text-xs text-[#586d82] border-t border-[#dce9ef] bg-white/50">
        ClassPoint — Plataforma Educativa · Integrada con el Carisma Salesiano y BoscoIA Tutor
      </footer>
    </div>
  );
};
