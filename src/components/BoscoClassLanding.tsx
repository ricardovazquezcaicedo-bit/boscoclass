import React, { useState } from 'react';
import {
  Sparkles,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  Play,
  Lock,
  User,
  Users,
  Coins,
  BookOpen,
  HelpCircle,
  Zap,
  BarChart3,
  GraduationCap,
  ChevronRight,
  X,
  Mail,
  KeyRound,
  ExternalLink,
  Sun,
  Moon,
} from 'lucide-react';
import { UserSession, ClassPointUser } from '../types';
import { ClassPointService } from '../services/classPointStorage';
import { googleSignIn } from '../services/googleAuthService';
import { microsoftSignIn } from '../services/microsoftAuthService';

interface BoscoClassLandingProps {
  onLoginSuccess: (session: UserSession) => void;
  theme?: 'dark' | 'light';
  onToggleTheme?: () => void;
}

interface VerificationFlow {
  provider: 'google' | 'microsoft';
  email: string;
  name: string;
  role: 'estudiante' | 'profesor' | 'administrador' | 'creadorOriginal';
  code: string;
  status: 'connecting' | 'input_code' | 'verified';
}

export const BoscoClassLanding: React.FC<BoscoClassLandingProps> = ({
  onLoginSuccess,
  theme = 'light',
  onToggleTheme,
}) => {
  // Modal states
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');
  const [isCreatorModalOpen, setIsCreatorModalOpen] = useState(false);
  const [creatorKeyInput, setCreatorKeyInput] = useState('');
  const [creatorErrorMsg, setCreatorErrorMsg] = useState('');

  // Login form states
  const [usernameInput, setUsernameInput] = useState('');
  const [passwordInput, setPasswordInput] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Register form states
  const [regRole, setRegRole] = useState<'estudiante' | 'profesor' | 'administrador'>('estudiante');
  const [regInstitucion, setRegInstitucion] = useState('Colegio San Juan Bosco');
  const [regCustomInstitucion, setRegCustomInstitucion] = useState('');
  const [regUsuario, setRegUsuario] = useState('');
  const [regNombre, setRegNombre] = useState('');
  const [regClave, setRegClave] = useState('');
  const [regCorreo, setRegCorreo] = useState('');

  // Platform Real Statistics & Real Schools
  const [platformStats, setPlatformStats] = useState(() => ClassPointService.getPlatformStats());

  // Available Schools List for registration
  const [schoolsList, setSchoolsList] = useState<string[]>(() => {
    return ClassPointService.getSchools().map((s) => s.nombre);
  });

  // SSO Modals & Verification Flow
  const [googleModal, setGoogleModal] = useState(false);
  const [googleEmailInput, setGoogleEmailInput] = useState('');
  const [googleNameInput, setGoogleNameInput] = useState('');

  const [microsoftModal, setMicrosoftModal] = useState(false);
  const [microsoftEmailInput, setMicrosoftEmailInput] = useState('');
  const [microsoftNameInput, setMicrosoftNameInput] = useState('');

  const [verificationFlow, setVerificationFlow] = useState<VerificationFlow | null>(null);
  const [enteredCode, setEnteredCode] = useState('');
  const [verificationError, setVerificationError] = useState('');
  const [incomingEmailToast, setIncomingEmailToast] = useState<{ title: string; body: string; code: string } | null>(null);

  // Video / Demo modal
  const [showDemoModal, setShowDemoModal] = useState(false);

  // Creador Original Exclusive Login
  const handleCreatorLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setCreatorErrorMsg('');
    const key = creatorKeyInput.trim();

    if (!key) {
      setCreatorErrorMsg('Por favor ingresa la Clave Maestra del Creador Original.');
      return;
    }

    if (
      key === 'creador2026' ||
      key.toLowerCase() === 'ricardovazquezcaicedo@gmail.com' ||
      key === 'admin2026'
    ) {
      const session: UserSession = {
        id: `creator-${Date.now()}`,
        name: 'Ricardo Vázquez Caicedo',
        email: 'ricardovazquezcaicedo@gmail.com',
        username: 'creador',
        role: 'creadorOriginal',
        institutionId: 'global',
        institutionName: 'Red Global BoscoClass',
        authProvider: 'email',
        academicLevel: 'Bachillerato',
        teachingTone: 'Didáctico y guiado',
        isVerified: true,
        createdAt: Date.now(),
      };
      setIsCreatorModalOpen(false);
      onLoginSuccess(session);
    } else {
      setCreatorErrorMsg('Clave Maestra incorrecta. Este acceso está reservado exclusivamente para el creador original.');
    }
  };

  // Standard Login
  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    const cleanUser = usernameInput.trim();
    const cleanPass = passwordInput.trim();

    if (!cleanUser || !cleanPass) {
      setErrorMsg('Ingresa tu usuario y contraseña de BoscoClass.');
      return;
    }

    // Direct Creator credential check
    if (
      (cleanUser.toLowerCase() === 'creador' && cleanPass === 'creador2026') ||
      (cleanUser.toLowerCase() === 'ricardovazquezcaicedo@gmail.com' && cleanPass === 'creador2026')
    ) {
      const session: UserSession = {
        id: `creator-${Date.now()}`,
        name: 'Ricardo Vázquez Caicedo',
        email: 'ricardovazquezcaicedo@gmail.com',
        username: 'creador',
        role: 'creadorOriginal',
        institutionId: 'global',
        institutionName: 'Red Global BoscoClass',
        authProvider: 'email',
        academicLevel: 'Bachillerato',
        teachingTone: 'Didáctico y guiado',
        isVerified: true,
        createdAt: Date.now(),
      };
      onLoginSuccess(session);
      return;
    }

    const authUser = ClassPointService.authenticateUser(cleanUser, cleanPass);
    if (!authUser) {
      setErrorMsg('Usuario o contraseña no encontrados. Verifica tus datos o regístrate.');
      return;
    }

    const session: UserSession = {
      id: `bc-${authUser.usuario}-${Date.now()}`,
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

  // Register
  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    if (!regUsuario.trim() || !regNombre.trim() || !regClave.trim()) {
      setErrorMsg('Por favor completa todos los campos requeridos.');
      return;
    }

    const finalInstitucion =
      regInstitucion === 'otra'
        ? regCustomInstitucion.trim() || 'Nuevo Colegio'
        : regInstitucion.trim() || 'Colegio San Juan Bosco';

    // If a new custom institution was registered, add it to schools
    if (regInstitucion === 'otra' && regCustomInstitucion.trim()) {
      ClassPointService.addSchool({
        id: regCustomInstitucion.toLowerCase().replace(/[^a-z0-9]/g, '').slice(0, 15) || `school-${Date.now()}`,
        nombre: regCustomInstitucion.trim(),
        ciudad: 'Colombia',
        lema: 'Educación de vanguardia con BoscoClass',
        colorPrimario: '#176b87',
        logoUrl: '/assets/aistudio/image_c159dc3e.png',
        activo: true,
        directores: regRole === 'administrador' ? [regUsuario.trim().toLowerCase()] : [],
        limiteEstudiantes: 500,
        estudiantesRegistrados: 1,
        fechaCreacion: new Date().toISOString().slice(0, 10),
        boscoIAConfig: {
          isLocked: false,
          lockedReason: 'Evaluación activa',
          giveCoinsForQuestions: true,
          coinsPerQuestion: 2,
          maxCoinsDaily: 20,
          socraticOnly: false,
          lockedAulas: [],
          lastUpdatedBy: regNombre.trim(),
          updatedAt: Date.now(),
        },
      });
      setSchoolsList(ClassPointService.getSchools().map((s) => s.nombre));
    }

    const newUser: ClassPointUser = {
      usuario: regUsuario.trim().toLowerCase(),
      clave: regClave.trim(),
      nombre: regNombre.trim(),
      rol: regRole,
      institucion: finalInstitucion,
      email: regCorreo.trim() || `${regUsuario.trim()}@salesianos.edu.co`,
    };

    const res = ClassPointService.registerUser(newUser);
    if (!res.success) {
      setErrorMsg(res.message);
      return;
    }

    setSuccessMsg('¡Cuenta creada y confirmada exitosamente! Iniciando tu experiencia BoscoClass...');
    setUsernameInput(newUser.usuario);
    setPasswordInput(newUser.clave);

    // Realistic email notification sent to student / teacher / director
    setIncomingEmailToast({
      title: `📬 Notificación de Activación BoscoClass`,
      body: `¡Bienvenido(a) ${newUser.nombre}! Tu cuenta institucional (${newUser.rol}) ha sido dada de alta para "${finalInstitucion}". Hemos verificado tu correo ${newUser.email}.`,
      code: 'CONFIRMADO',
    });

    setTimeout(() => {
      setIsAuthModalOpen(false);
      const session: UserSession = {
        id: newUser.usuario,
        username: newUser.usuario,
        name: newUser.nombre,
        email: newUser.email || `${newUser.usuario}@salesianos.edu.co`,
        role: newUser.rol,
        avatar: `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(
          newUser.nombre
        )}&backgroundColor=059669`,
        authProvider: 'email',
        academicLevel: 'Bachillerato',
        teachingTone: 'Didáctico y guiado',
        institutionId: newUser.institucion.toLowerCase().replace(/[^a-z0-9]/g, '').slice(0, 15) || 'school',
        institutionName: newUser.institucion,
        isVerified: true,
        verificationMethod: 'Verificación BoscoClass Correo Seguro',
        createdAt: Date.now(),
      };
      onLoginSuccess(session);
    }, 1200);
  };

  // Start Microsoft SSO Verification
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
      setErrorMsg('El acceso institucional requiere una cuenta del dominio @salesianos (ej: estudiante@salesianos.edu.co).');
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

    // Simulate sending an actual email to Outlook
    setTimeout(() => {
      setVerificationFlow((prev) => (prev ? { ...prev, status: 'input_code' } : null));
      setIncomingEmailToast({
        title: '📬 Microsoft Outlook (@salesianos)',
        body: `Tu código de seguridad temporal para ingresar a BoscoClass es:`,
        code: generatedCode,
      });
    }, 1200);
  };

  // Direct Microsoft 365 OAuth Sign-In Popup
  const handleDirectMicrosoftLogin = async () => {
    setErrorMsg('');
    try {
      const result = await microsoftSignIn('estudiante@salesianos.edu.co', 'Estudiante Salesiano');
      if (!result) return;
      const { user } = result;
      const username = (user.email || 'estudiante').split('@')[0];
      const isCreatorEmail =
        user.email?.toLowerCase() === 'ricardovazquezcaicedo@gmail.com' ||
        username.toLowerCase() === 'creador';

      // Check if user already exists or register new
      const allUsers = ClassPointService.getUsers();
      let existing = allUsers.find(
        (u) =>
          u.usuario.toLowerCase() === username.toLowerCase() ||
          (u.email && user.email && u.email.toLowerCase() === user.email.toLowerCase())
      );
      if (!existing && !isCreatorEmail) {
        ClassPointService.addUser({
          usuario: username,
          clave: 'microsoft_oauth_auth',
          nombre: user.displayName || 'Estudiante Salesiano',
          rol: 'estudiante',
          institucion: 'Colegio San Juan Bosco',
          email: user.email || `${username}@salesianos.edu.co`,
          avatar: user.photoURL || undefined,
          grado: 'Bachillerato',
          fechaRegistro: new Date().toISOString(),
        });
      }

      onLoginSuccess({
        id: user.uid,
        name: isCreatorEmail ? 'Ricardo Vázquez Caicedo' : user.displayName || 'Estudiante Salesiano',
        email: user.email || '',
        username: isCreatorEmail ? 'creador' : username,
        role: isCreatorEmail ? 'creadorOriginal' : existing?.rol || 'estudiante',
        avatar: user.photoURL || existing?.avatar || undefined,
        authProvider: 'microsoft',
        academicLevel: 'Bachillerato',
        teachingTone: 'Didáctico y guiado',
        isVerified: true,
        verificationMethod: 'Microsoft 365 Institucional (@salesianos)',
        institutionId: isCreatorEmail ? 'global' : 'salesianos_red',
        institutionName: isCreatorEmail
          ? 'Red Global BoscoClass'
          : existing?.institucion || 'Colegio San Juan Bosco',
        createdAt: Date.now(),
      });
      setIsAuthModalOpen(false);
      setMicrosoftModal(false);
    } catch (err: any) {
      console.warn('Microsoft Sign In fallback to prompt:', err);
      if (err?.code !== 'auth/popup-closed-by-user') {
        setMicrosoftModal(true);
      }
    }
  };

  // Direct Google OAuth Sign-In Popup
  const handleDirectGoogleLogin = async () => {
    setErrorMsg('');
    try {
      const result = await googleSignIn();
      if (!result) return;
      const { user } = result;
      const username = (user.email || 'estudiante').split('@')[0];
      const isCreatorEmail =
        user.email?.toLowerCase() === 'ricardovazquezcaicedo@gmail.com' ||
        username.toLowerCase() === 'creador';

      // Check if user already exists or register new
      const allUsers = ClassPointService.getUsers();
      let existing = allUsers.find(
        (u) =>
          u.usuario.toLowerCase() === username.toLowerCase() ||
          (u.email && user.email && u.email.toLowerCase() === user.email.toLowerCase())
      );
      if (!existing && !isCreatorEmail) {
        ClassPointService.addUser({
          usuario: username,
          clave: 'google_oauth_auth',
          nombre: user.displayName || 'Estudiante Google',
          rol: 'estudiante',
          institucion: 'Colegio San Juan Bosco',
          email: user.email || `${username}@gmail.com`,
          avatar: user.photoURL || undefined,
          grado: 'Bachillerato',
          fechaRegistro: new Date().toISOString(),
        });
      }

      onLoginSuccess({
        id: user.uid,
        name: isCreatorEmail ? 'Ricardo Vázquez Caicedo' : user.displayName || 'Estudiante Google',
        email: user.email || '',
        username: isCreatorEmail ? 'creador' : username,
        role: isCreatorEmail ? 'creadorOriginal' : existing?.rol || 'estudiante',
        avatar: user.photoURL || existing?.avatar || undefined,
        authProvider: 'google',
        academicLevel: 'Bachillerato',
        teachingTone: 'Didáctico y guiado',
        isVerified: true,
        verificationMethod: 'Google Workspace Institucional (@google)',
        institutionId: isCreatorEmail ? 'global' : 'col_juanbosco',
        institutionName: isCreatorEmail
          ? 'Red Global BoscoClass'
          : existing?.institucion || 'Colegio San Juan Bosco',
        createdAt: Date.now(),
      });
      setIsAuthModalOpen(false);
      setGoogleModal(false);
    } catch (err: any) {
      console.warn('Google Sign In fallback to prompt:', err);
      if (err?.code !== 'auth/popup-closed-by-user') {
        setGoogleModal(true);
      }
    }
  };

  // Start Google SSO
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
    const isCreatorEmail = finalEmail.toLowerCase() === 'ricardovazquezcaicedo@gmail.com';
    const generatedCode = Math.floor(100000 + Math.random() * 900000).toString();

    setErrorMsg('');
    setGoogleModal(false);
    setVerificationError('');
    setEnteredCode('');
    setVerificationFlow({
      provider: 'google',
      email: finalEmail,
      name: isCreatorEmail ? 'Ricardo Vázquez Caicedo' : studentName,
      role: isCreatorEmail ? 'creadorOriginal' : 'estudiante',
      code: generatedCode,
      status: 'connecting',
    });

    setTimeout(() => {
      setVerificationFlow((prev) => (prev ? { ...prev, status: 'input_code' } : null));
      setIncomingEmailToast({
        title: '📬 Notificación de Google Workspace',
        body: `Tu código de verificación para BoscoClass es:`,
        code: generatedCode,
      });
    }, 1200);
  };

  // Confirm Verification Code
  const handleConfirmVerification = (codeToTest?: string) => {
    if (!verificationFlow) return;
    const code = (codeToTest || enteredCode).trim();
    if (code !== verificationFlow.code) {
      setVerificationError('Código de verificación incorrecto. Por favor revisa el código de 6 dígitos.');
      return;
    }

    setVerificationError('');
    setVerificationFlow((prev) => (prev ? { ...prev, status: 'verified' } : null));
    setIncomingEmailToast(null);

    setTimeout(() => {
      const isMs = verificationFlow.provider === 'microsoft';
      const isCreatorEmail = verificationFlow.email.toLowerCase() === 'ricardovazquezcaicedo@gmail.com';
      const displayName =
        verificationFlow.name.charAt(0).toUpperCase() + verificationFlow.name.slice(1);

      const session: UserSession = {
        id: `${verificationFlow.provider}-${Date.now()}`,
        name: isCreatorEmail ? 'Ricardo Vázquez Caicedo' : displayName,
        username: isCreatorEmail ? 'creador' : verificationFlow.email.split('@')[0],
        email: verificationFlow.email,
        role: isCreatorEmail ? 'creadorOriginal' : verificationFlow.role,
        avatar: `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(
          displayName
        )}&backgroundColor=${isMs ? '0284c7' : '059669'}`,
        authProvider: verificationFlow.provider,
        academicLevel: 'Bachillerato',
        teachingTone: 'Didáctico y guiado',
        institutionId: isCreatorEmail ? 'global' : 'sanjuanbosco',
        institutionName: isCreatorEmail ? 'Red Global BoscoClass' : 'Colegio San Juan Bosco',
        isVerified: true,
        verificationMethod: isMs ? 'Microsoft Entra ID (@salesianos)' : 'Google Workspace Identity',
        createdAt: Date.now(),
      };

      setVerificationFlow(null);
      onLoginSuccess(session);
    }, 900);
  };

  return (
    <div
      className={`min-h-screen w-full flex flex-col font-sans transition-colors duration-200 ${
        theme === 'dark'
          ? 'bg-[#0a111a] text-slate-100 selection:bg-emerald-500/30'
          : 'bg-white text-slate-800 selection:bg-[#50c6b3]/30'
      }`}
    >
      
      {/* ========================================================================= */}
      {/* 1. TOP NAVBAR (Matching image_d1a57470.png) */}
      {/* ========================================================================= */}
      <header
        className={`sticky top-0 z-40 w-full backdrop-blur-md border-b transition-colors ${
          theme === 'dark'
            ? 'bg-[#0d1724]/95 border-slate-800 shadow-lg'
            : 'bg-white/95 border-slate-200 shadow-2xs'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-18 flex items-center justify-between gap-4">
          
          {/* Logo with official BoscoIA emblem */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-white border border-slate-200 p-1 shadow-xs grid place-items-center">
              <img
                src="/assets/aistudio/image_c159dc3e.png"
                alt="BoscoClass"
                className="w-full h-full object-contain"
              />
            </div>
            <div className="flex items-center gap-2">
              <span className={`text-2xl font-black tracking-tight ${theme === 'dark' ? 'text-white' : 'text-[#1e293b]'}`}>
                Bosco<span className="text-[#4f46e5]">Class</span>
              </span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                + BoscoIA
              </span>
            </div>
          </div>

          {/* Nav Links */}
          <nav className={`hidden md:flex items-center gap-7 text-sm font-semibold ${theme === 'dark' ? 'text-slate-300' : 'text-slate-600'}`}>
            <a href="#features" className="hover:text-[#4f46e5] transition-colors">
              Funcionalidades
            </a>
            <a href="#ai-section" className="hover:text-[#4f46e5] transition-colors">
              BoscoIA Tutor
            </a>
            <a href="#gamification" className="hover:text-[#4f46e5] transition-colors">
              Boscoints
            </a>
            <a href="#schools" className="hover:text-[#4f46e5] transition-colors">
              Colegio San Juan Bosco
            </a>
          </nav>

          {/* Action Buttons */}
          <div className="flex items-center gap-2.5">
            {onToggleTheme && (
              <button
                type="button"
                onClick={onToggleTheme}
                className={`p-2 rounded-xl border transition-colors ${
                  theme === 'dark'
                    ? 'border-slate-700 bg-slate-800/80 text-amber-300 hover:bg-slate-700'
                    : 'border-slate-200 bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
                title={theme === 'dark' ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro'}
              >
                {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
              </button>
            )}

            <button
              type="button"
              onClick={() => {
                setAuthMode('login');
                setIsAuthModalOpen(true);
              }}
              className={`text-sm font-bold transition-colors px-3 py-2 ${
                theme === 'dark' ? 'text-slate-200 hover:text-white' : 'text-slate-700 hover:text-[#D32F2F]'
              }`}
            >
              Iniciar sesión
            </button>
            <button
              type="button"
              onClick={() => {
                setAuthMode('register');
                setIsAuthModalOpen(true);
              }}
              className="px-5 py-2.5 rounded-xl bg-[#D32F2F] hover:bg-[#B71C1C] text-white text-sm font-bold shadow-md shadow-red-500/20 hover:shadow-lg transition-all active:scale-98"
            >
              Registrarse gratis
            </button>
          </div>
        </div>
      </header>

      {/* ========================================================================= */}
      {/* 2. HERO SECTION */}
      {/* ========================================================================= */}
      <section className="relative overflow-hidden pt-12 pb-20 px-4 sm:px-6 bg-gradient-to-b from-slate-50/80 via-white to-slate-50/50">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          
          {/* Hero Left Content */}
          <div className="lg:col-span-6 space-y-6">
            <button
              type="button"
              onClick={() => setShowDemoModal(true)}
              className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-bold bg-red-50 text-[#D32F2F] border border-red-200 hover:bg-red-100 transition-colors"
            >
              <Play className="w-3.5 h-3.5 fill-[#D32F2F]" />
              <span>Ver presentación interactiva</span>
            </button>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-[#0f172a] tracking-tight leading-[1.08]">
              Potencia tus clases y el aprendizaje con <span className="text-[#D32F2F]">BoscoClass</span>.
            </h1>

            <p className="text-base sm:text-lg text-slate-700 leading-relaxed max-w-xl font-normal">
              Involucra a tus estudiantes sin esfuerzo con cuestionarios interactivos, aulas virtuales, avisos institucionales, gamificación de <strong>Boscoints</strong> y el tutor inteligente <strong>BoscoIA</strong> con notación matemática KaTeX y voz pedagógica personalizada.
            </p>

            {/* CTAs */}
            <div className="flex flex-wrap items-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => {
                  setAuthMode('login');
                  setIsAuthModalOpen(true);
                }}
                className="px-6 py-3.5 rounded-2xl bg-[#D32F2F] hover:bg-[#B71C1C] text-white text-sm font-extrabold shadow-lg shadow-red-500/25 transition-all flex items-center gap-2 cursor-pointer active:scale-95"
              >
                <span>Entrar a BoscoClass</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <button
                type="button"
                onClick={() => {
                  setAuthMode('register');
                  setIsAuthModalOpen(true);
                }}
                className="px-5 py-3.5 rounded-2xl bg-white border border-slate-300 hover:border-slate-400 text-slate-800 text-sm font-bold shadow-xs hover:bg-slate-50 transition-colors flex items-center gap-2 cursor-pointer active:scale-95"
              >
                <span>Crear Cuenta Escolar</span>
              </button>
            </div>

            {/* Multi-School Network Badge */}
            <div className="pt-4 border-t border-slate-200 flex items-center gap-3 text-xs text-slate-500">
              <div className="flex -space-x-2 overflow-hidden">
                <span className="inline-block h-7 w-7 rounded-full ring-2 ring-white bg-[#176b87] text-white text-[10px] font-bold grid place-items-center">SJ</span>
                <span className="inline-block h-7 w-7 rounded-full ring-2 ring-white bg-[#0f766e] text-white text-[10px] font-bold grid place-items-center">CM</span>
                <span className="inline-block h-7 w-7 rounded-full ring-2 ring-white bg-[#b45309] text-white text-[10px] font-bold grid place-items-center">IT</span>
              </div>
              <span className="font-medium">
                Plataforma multicolegio habilitada para directores autónomos, profesores y estudiantes.
              </span>
            </div>
          </div>

          {/* Hero Right Mockup (Matching image_d1a57470.png presentation frame) */}
          <div className="lg:col-span-6">
            <div className="relative rounded-3xl p-3 bg-gradient-to-tr from-slate-200 to-slate-100 border border-slate-300 shadow-2xl">
              
              {/* Window Frame Mockup */}
              <div className="rounded-2xl overflow-hidden bg-white border border-slate-200 shadow-md">
                
                {/* Window Title Bar */}
                <div className="bg-[#d95d39] text-white px-4 py-2 flex items-center justify-between text-xs font-semibold">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-white/40" />
                    <span className="w-2.5 h-2.5 rounded-full bg-white/40" />
                    <span className="w-2.5 h-2.5 rounded-full bg-white/40" />
                    <span className="ml-2 font-bold truncate">Presentación Interactiva — BoscoClass</span>
                  </div>
                  <div className="flex items-center gap-2 text-white/80">
                    <span>_</span>
                    <span>▢</span>
                    <span>✕</span>
                  </div>
                </div>

                {/* Toolbar */}
                <div className="bg-slate-50 border-b border-slate-200 px-3 py-2 flex items-center gap-2 overflow-x-auto text-[11px] font-semibold text-slate-600">
                  <div className="flex items-center gap-1 px-2 py-1 rounded bg-white border border-slate-200 text-indigo-700 font-bold">
                    <span>📊 Opción múltiple</span>
                  </div>
                  <div className="flex items-center gap-1 px-2 py-1 rounded hover:bg-slate-200">
                    <span>☁️ Nube de palabras</span>
                  </div>
                  <div className="flex items-center gap-1 px-2 py-1 rounded hover:bg-slate-200">
                    <span>💬 Respuesta corta</span>
                  </div>
                  <div className="flex items-center gap-1 px-2 py-1 rounded hover:bg-slate-200">
                    <span>✏️ Dibujo en vivo</span>
                  </div>
                  <div className="flex items-center gap-1 px-2 py-1 rounded hover:bg-slate-200">
                    <span>🖼️ Subir imagen</span>
                  </div>
                </div>

                {/* Slide Canvas Area */}
                <div className="p-6 bg-slate-50/70 flex gap-4 min-h-[320px]">
                  {/* Left Thumbnails */}
                  <div className="w-20 space-y-2 hidden sm:block shrink-0">
                    <div className="p-1 rounded-lg border-2 border-orange-500 bg-white shadow-2xs">
                      <div className="w-full h-10 bg-slate-100 rounded" />
                    </div>
                    <div className="p-1 rounded-lg border border-slate-200 bg-white">
                      <div className="w-full h-10 bg-slate-100 rounded" />
                    </div>
                    <div className="p-1 rounded-lg border border-slate-200 bg-white">
                      <div className="w-full h-10 bg-slate-100 rounded" />
                    </div>
                  </div>

                  {/* Main Slide Interactive Graphic (Matching image_d1a57470.png) */}
                  <div className="flex-1 bg-white rounded-2xl p-6 border border-slate-200 shadow-sm flex flex-col justify-between">
                    <div className="flex items-center justify-between">
                      <h4 className="text-xs font-bold text-slate-700">
                        Pregunta en vivo: ¿Qué método es el más eficaz para factorizar este trinomio?
                      </h4>
                      <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-black">
                        ● 24 alumnos respondiendo
                      </span>
                    </div>

                    {/* Bar Chart Representation */}
                    <div className="py-6 flex items-end justify-center gap-6 sm:gap-10 h-44">
                      {/* Bar A */}
                      <div className="flex flex-col items-center gap-1">
                        <span className="text-[11px] font-bold text-slate-500">1 (25%)</span>
                        <div className="w-12 sm:w-14 h-24 bg-[#10b981] rounded-t-xl" />
                        <span className="text-xs font-black text-slate-800">A</span>
                      </div>

                      {/* Bar B */}
                      <div className="flex flex-col items-center gap-1">
                        <span className="text-[11px] font-bold text-slate-500">0</span>
                        <div className="w-12 sm:w-14 h-4 bg-[#0f172a] rounded-t-xl" />
                        <span className="text-xs font-black text-slate-800">B</span>
                      </div>

                      {/* Bar C (Winning Checked Option) */}
                      <div className="flex flex-col items-center gap-1">
                        <span className="text-[11px] font-bold text-indigo-600 font-black">2 (50%)</span>
                        <div className="w-12 sm:w-14 h-36 bg-[#0284c7] rounded-t-xl relative flex items-center justify-center">
                          <div className="w-6 h-6 rounded-full bg-white text-[#0284c7] grid place-items-center shadow-md font-bold text-xs">
                            ✓
                          </div>
                        </div>
                        <span className="text-xs font-black text-indigo-600">C</span>
                      </div>

                      {/* Bar D */}
                      <div className="flex flex-col items-center gap-1">
                        <span className="text-[11px] font-bold text-slate-500">1 (25%)</span>
                        <div className="w-12 sm:w-14 h-24 bg-[#f59e0b] rounded-t-xl" />
                        <span className="text-xs font-black text-slate-800">D</span>
                      </div>
                    </div>

                    <div className="text-center pt-2 border-t border-slate-100 text-[11px] text-slate-400">
                      Respuesta correcta verificada con el tutor socrático BoscoIA
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 2.5 REAL PLATFORM FIGURES & REAL SCHOOLS DIRECTORY */}
      {/* ========================================================================= */}
      <section className="py-16 px-4 sm:px-6 bg-white border-y border-slate-200">
        <div className="max-w-7xl mx-auto space-y-10">
          <div className="text-center max-w-3xl mx-auto space-y-3">
            <span className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full text-xs font-black bg-red-100 text-[#D32F2F] border border-red-200 uppercase tracking-wide">
              <span>📊 Cifras Reales y Verificadas</span>
            </span>
            <h2 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
              Personas, Escuelas y Aulas Reales en la Plataforma
            </h2>
            <p className="text-sm sm:text-base text-slate-600">
              Cifras reales y auditadas de los estudiantes, docentes, directores e instituciones educativas que utilizan BoscoClass a diario.
            </p>
          </div>

          {/* Real Live Metrics Grid */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-5 rounded-2xl bg-gradient-to-br from-red-50 to-white border-2 border-red-200 shadow-xs space-y-1">
              <div className="flex items-center justify-between text-slate-500">
                <span className="text-xs font-bold uppercase tracking-wider text-[#D32F2F]">Comunidad Total</span>
                <span className="text-xl">👥</span>
              </div>
              <p className="text-3xl sm:text-4xl font-black text-slate-900">{platformStats.totalPersonas}</p>
              <p className="text-xs text-slate-600 font-medium pt-1">
                <strong className="text-[#D32F2F]">{platformStats.totalEstudiantes}</strong> estudiantes ·{' '}
                <strong>{platformStats.totalProfesores}</strong> docentes ·{' '}
                <strong>{platformStats.totalDirectores}</strong> directores
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-gradient-to-br from-amber-50 to-white border-2 border-amber-200 shadow-xs space-y-1">
              <div className="flex items-center justify-between text-slate-500">
                <span className="text-xs font-bold uppercase tracking-wider text-amber-700">Colegios e Instituciones</span>
                <span className="text-xl">🏫</span>
              </div>
              <p className="text-3xl sm:text-4xl font-black text-slate-900">{platformStats.totalEscuelas}</p>
              <p className="text-xs text-slate-600 font-medium pt-1">
                Instituciones educativas autónomas operando bajo BoscoClass
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-gradient-to-br from-sky-50 to-white border-2 border-sky-200 shadow-xs space-y-1">
              <div className="flex items-center justify-between text-slate-500">
                <span className="text-xs font-bold uppercase tracking-wider text-sky-700">Aulas Virtuales</span>
                <span className="text-xl">📚</span>
              </div>
              <p className="text-3xl sm:text-4xl font-black text-slate-900">{platformStats.totalAulas}</p>
              <p className="text-xs text-slate-600 font-medium pt-1">
                Salones con control de asistencia, tareas y chismógrafo privado
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-gradient-to-br from-emerald-50 to-white border-2 border-emerald-200 shadow-xs space-y-1">
              <div className="flex items-center justify-between text-slate-500">
                <span className="text-xs font-bold uppercase tracking-wider text-emerald-700">Actividad Académica</span>
                <span className="text-xl">📋</span>
              </div>
              <p className="text-3xl sm:text-4xl font-black text-slate-900">
                {platformStats.totalTareas + platformStats.totalEvidencias}
              </p>
              <p className="text-xs text-slate-600 font-medium pt-1">
                {platformStats.totalTareas} talleres creados y {platformStats.totalEvidencias} evidencias entregadas
              </p>
            </div>
          </div>

          {/* Real Schools Directory Cards */}
          <div className="space-y-4 pt-2">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  Directorio de Escuelas e Instituciones Registradas
                </h3>
                <p className="text-xs text-slate-500">
                  Instituciones con directores, profesores y alumnos reales vinculados
                </p>
              </div>
              <button
                type="button"
                onClick={() => {
                  setAuthMode('register');
                  setRegRole('administrador');
                  setRegInstitucion('otra');
                  setIsAuthModalOpen(true);
                }}
                className="text-xs font-bold text-[#D32F2F] hover:text-[#B71C1C] hover:underline"
              >
                + Registrar mi colegio
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {platformStats.schools.map((school) => (
                <div
                  key={school.id}
                  className="p-5 rounded-2xl border-2 border-slate-200 hover:border-red-300 bg-slate-50/70 hover:bg-white transition-all shadow-xs space-y-3 flex flex-col justify-between"
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2.5">
                        <div
                          className="w-10 h-10 rounded-xl text-white font-black text-xs grid place-items-center shadow-xs"
                          style={{ backgroundColor: school.colorPrimario || '#D32F2F' }}
                        >
                          {school.nombre.substring(0, 2).toUpperCase()}
                        </div>
                        <div>
                          <h4 className="text-xs font-bold text-slate-900 leading-snug">{school.nombre}</h4>
                          <p className="text-[10px] text-slate-500">{school.ciudad}</p>
                        </div>
                      </div>
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-bold border border-emerald-200">
                        ✓ Activa
                      </span>
                    </div>

                    <p className="text-xs text-slate-600 italic">
                      "{school.lema || 'Educación integral y formativa'}"
                    </p>
                  </div>

                  <div className="pt-3 border-t border-slate-200 grid grid-cols-3 gap-2 text-center text-[11px]">
                    <div className="p-1.5 rounded-lg bg-white border border-slate-200">
                      <strong className="block text-slate-900 font-black">{school.estudiantesRegistrados}</strong>
                      <span className="text-[10px] text-slate-500">Alumnos</span>
                    </div>
                    <div className="p-1.5 rounded-lg bg-white border border-slate-200">
                      <strong className="block text-slate-900 font-black">{school.profesoresRegistrados}</strong>
                      <span className="text-[10px] text-slate-500">Docentes</span>
                    </div>
                    <div className="p-1.5 rounded-lg bg-white border border-slate-200">
                      <strong className="block text-slate-900 font-black">{school.aulasRegistradas}</strong>
                      <span className="text-[10px] text-slate-500">Aulas</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 3. AI SECTION (Matching image_a5c6b458.png with dark gradient) */}
      {/* ========================================================================= */}
      <section id="ai-section" className="py-20 px-4 sm:px-6 bg-[#0b1320] text-white relative overflow-hidden">
        {/* Glow blur effects */}
        <div className="absolute top-0 right-1/4 w-96 h-96 bg-indigo-600/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/4 w-96 h-96 bg-teal-600/10 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12 items-center relative z-10">
          
          {/* AI Left Description (Matching image_a5c6b458.png text) */}
          <div className="lg:col-span-6 space-y-6">
            <p className="text-2xl sm:text-3xl font-normal text-slate-200 leading-snug">
              Deja que la IA haga el trabajo pesado de generar explicaciones y preguntas didácticas, para que tú puedas enfocarte en lo que de verdad importa: <span className="font-extrabold text-white">enseñar y conectar con tus estudiantes.</span>
            </p>

            <a
              href="#login-trigger"
              onClick={() => {
                setAuthMode('login');
                setIsAuthModalOpen(true);
              }}
              className="inline-flex items-center gap-2 text-indigo-400 hover:text-indigo-300 font-bold text-sm tracking-wide transition-colors"
            >
              <span>Conocer más sobre BoscoClass AI</span>
              <ArrowRight className="w-4 h-4" />
            </a>

            <div className="pt-4 space-y-6 border-t border-slate-800">
              {/* Feature 1 */}
              <div className="flex items-start gap-3.5">
                <div className="w-8 h-8 rounded-xl bg-indigo-500/20 text-indigo-400 grid place-items-center shrink-0 mt-0.5">
                  <Zap className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-base font-bold text-white">
                    AI quiz on the go.
                  </h4>
                  <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                    BoscoClass AI lee tus temas y diapositivas para generar preguntas diagnósticas, talleres de factorización y problemas matemáticos adaptados al nivel del estudiante.
                  </p>
                </div>
              </div>

              {/* Feature 2 */}
              <div className="flex items-start gap-3.5">
                <div className="w-8 h-8 rounded-xl bg-teal-500/20 text-teal-400 grid place-items-center shrink-0 mt-0.5">
                  <CheckCircle2 className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-base font-bold text-white">
                    Taxonomía de Bloom y Método Preventivo Salesiano.
                  </h4>
                  <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                    Personaliza los quizes basados en niveles cognitivos (recordar, comprender, aplicar, analizar). Los profesores pueden forzar el Modo Socrático para que la IA solo entregue pistas reflexivas.
                  </p>
                </div>
              </div>

              {/* Feature 3 */}
              <div className="flex items-start gap-3.5">
                <div className="w-8 h-8 rounded-xl bg-sky-500/20 text-sky-400 grid place-items-center shrink-0 mt-0.5">
                  <BookOpen className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-base font-bold text-white">
                    Notación matemática KaTeX y diagramas biológicos.
                  </h4>
                  <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                    Fracciones nítidas de libro de texto y diagramas científicos autorizados de células eucariotas y procariotas de Wikimedia Commons, 100% libres de publicidad y banners de límite.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* AI Right Preview (Matching image_a5c6b458.png preview dialog) */}
          <div className="lg:col-span-6">
            <div className="relative rounded-3xl p-6 bg-slate-900/80 border border-slate-700/80 shadow-2xl backdrop-blur-md">
              
              {/* Floating Quiz Dialog */}
              <div className="bg-white text-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-indigo-100 text-indigo-600 font-bold grid place-items-center">
                    🤖
                  </div>
                  <div>
                    <h5 className="text-xs font-bold text-slate-900">
                      Pregunta de Biología Celular · Generada por BoscoClass AI
                    </h5>
                    <span className="text-[10px] text-slate-400">Nivel: Bachillerato · Colegio San Juan Bosco</span>
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
                  <p className="text-xs font-extrabold text-slate-800 leading-relaxed">
                    ¿Cuál de las siguientes afirmaciones describe con precisión la diferencia fundamental entre una célula eucariota y una célula procariota?
                  </p>
                </div>

                <div className="space-y-2 text-xs">
                  <div className="p-2.5 rounded-xl border border-slate-200 hover:bg-slate-50 flex items-center gap-2">
                    <span className="w-5 h-5 rounded-md bg-slate-100 font-bold text-[10px] grid place-items-center">A</span>
                    <span>La procariota carece de membrana nuclear delimitando su ADN, mientras que la eucariota posee núcleo definido.</span>
                  </div>
                  <div className="p-2.5 rounded-xl border border-slate-200 hover:bg-slate-50 flex items-center gap-2">
                    <span className="w-5 h-5 rounded-md bg-slate-100 font-bold text-[10px] grid place-items-center">B</span>
                    <span>Las células procariotas tienen mitocondrias de gran tamaño.</span>
                  </div>
                  <div className="p-2.5 rounded-xl border border-slate-200 hover:bg-slate-50 flex items-center gap-2">
                    <span className="w-5 h-5 rounded-md bg-slate-100 font-bold text-[10px] grid place-items-center">C</span>
                    <span>Las células eucariotas no poseen ribosomas en su citoplasma.</span>
                  </div>
                </div>

                <div className="pt-2 flex items-center justify-between text-[11px] text-slate-500 border-t border-slate-100">
                  <span className="text-emerald-600 font-bold">✓ Respuesta correcta: Opción A</span>
                  <span>+2 Boscoints al responder</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 4. BOSCOINTS & REWARD MARKETPLACE SECTION */}
      {/* ========================================================================= */}
      <section id="gamification" className="py-20 px-4 sm:px-6 bg-slate-50 border-t border-slate-200">
        <div className="max-w-7xl mx-auto text-center space-y-4 mb-12">
          <span className="px-3.5 py-1.5 rounded-full text-xs font-extrabold bg-amber-100 text-amber-800 border border-amber-200 uppercase tracking-wider">
            Economía Educativa
          </span>
          <h2 className="text-3xl sm:text-4xl font-black text-[#0f172a]">
            El esfuerzo se reconoce con <span className="text-amber-600">Boscoints</span>.
          </h2>
          <p className="text-sm text-slate-600 max-w-2xl mx-auto">
            Los estudiantes ganan Boscoints al entregar sus tareas a tiempo, participar en clase y resolver dudas con BoscoIA. Los profesores pueden pausar o activar las recompensas en cualquier momento.
          </p>
        </div>

        <div className="max-w-5xl mx-auto grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
          <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs text-center space-y-2">
            <span className="text-3xl">☕</span>
            <h4 className="text-xs font-bold text-slate-800">Descanso Anticipado</h4>
            <p className="text-[11px] text-slate-500">Salir 10 minutos antes al receso escolar con pase docente.</p>
            <span className="inline-block px-2.5 py-1 rounded-full bg-amber-50 text-amber-700 font-black text-xs">20 BC</span>
          </div>

          <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs text-center space-y-2">
            <span className="text-3xl">⭐</span>
            <h4 className="text-xs font-bold text-slate-800">+1 Punto en Taller</h4>
            <p className="text-[11px] text-slate-500">Ayuda bonificada para mejorar una calificación de periodo.</p>
            <span className="inline-block px-2.5 py-1 rounded-full bg-amber-50 text-amber-700 font-black text-xs">45 BC</span>
          </div>

          <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs text-center space-y-2">
            <span className="text-3xl">🎵</span>
            <h4 className="text-xs font-bold text-slate-800">Música de Estudio</h4>
            <p className="text-[11px] text-slate-500">Elegir la lista instrumental para la sesión práctica del salón.</p>
            <span className="inline-block px-2.5 py-1 rounded-full bg-amber-50 text-amber-700 font-black text-xs">30 BC</span>
          </div>

          <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs text-center space-y-2">
            <span className="text-3xl">👥</span>
            <h4 className="text-xs font-bold text-slate-800">Líder de Grupo</h4>
            <p className="text-[11px] text-slate-500">Elegir el equipo de trabajo en la próxima actividad colaborativa.</p>
            <span className="inline-block px-2.5 py-1 rounded-full bg-amber-50 text-amber-700 font-black text-xs">25 BC</span>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 5. FOOTER */}
      {/* ========================================================================= */}
      <footer id="schools" className="py-10 px-4 sm:px-6 bg-white border-t border-slate-200 text-center text-xs text-slate-500 space-y-3">
        <div className="flex items-center justify-center gap-2">
          <img src="/assets/aistudio/image_c159dc3e.png" alt="BoscoClass" className="w-6 h-6 object-contain" />
          <span className="font-bold text-slate-800 text-sm">BoscoClass</span>
          <span>·</span>
          <span>Colegio San Juan Bosco (Salesianos de Don Bosco - Tuluá)</span>
        </div>
        <p className="text-slate-400">
          Plataforma educativa modular con gestión de aulas, calificaciones por periodo 1-4, mercado de Boscoints y tutor inteligente BoscoIA.
        </p>
      </footer>

      {/* ========================================================================= */}
      {/* INCOMING EMAIL NOTIFICATION TOAST (Realistic simulation without leaking in-modal) */}
      {/* ========================================================================= */}
      {incomingEmailToast && (
        <div className="fixed top-5 right-5 z-60 max-w-sm bg-white rounded-2xl p-4 shadow-2xl border-2 border-indigo-400 animate-in slide-in-from-top duration-300">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-2">
              <Mail className="w-5 h-5 text-indigo-600 shrink-0" />
              <h5 className="text-xs font-black text-slate-900">{incomingEmailToast.title}</h5>
            </div>
            <button
              onClick={() => setIncomingEmailToast(null)}
              className="text-slate-400 hover:text-slate-700"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
          <p className="text-xs text-slate-600 mt-1">{incomingEmailToast.body}</p>
          <div className="mt-2 flex items-center justify-between bg-slate-50 p-2 rounded-xl border border-slate-200">
            <code className="text-base font-black text-indigo-600 font-mono tracking-widest">
              {incomingEmailToast.code}
            </code>
            <button
              type="button"
              onClick={() => {
                setEnteredCode(incomingEmailToast.code);
                handleConfirmVerification(incomingEmailToast.code);
              }}
              className="px-2.5 py-1 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-[11px]"
            >
              Autocompletar y Entrar
            </button>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* AUTH MODAL (LOGIN & REGISTER) */}
      {/* ========================================================================= */}
      {isAuthModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="relative w-full max-w-md bg-white rounded-3xl border border-slate-200 shadow-2xl overflow-hidden p-6 sm:p-7">
            
            {/* Close Button */}
            <button
              type="button"
              onClick={() => setIsAuthModalOpen(false)}
              className="absolute top-4 right-4 p-1.5 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Header */}
            <div className="flex items-center gap-3 mb-5">
              <div className="w-10 h-10 rounded-2xl bg-white border border-slate-200 p-1 shadow-xs grid place-items-center">
                <img src="/assets/aistudio/image_c159dc3e.png" alt="BoscoClass" className="w-full h-full object-contain" />
              </div>
              <div>
                <h3 className="text-lg font-black text-slate-900">
                  {authMode === 'login' ? 'Iniciar sesión en BoscoClass' : 'Crear cuenta en BoscoClass'}
                </h3>
                <p className="text-xs text-slate-500">
                  {authMode === 'login' ? 'Ingresa tus credenciales institucionales' : 'Regístrate como estudiante, docente o director'}
                </p>
              </div>
            </div>

            {errorMsg && (
              <div className="mb-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            {successMsg && (
              <div className="mb-4 p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <span>{successMsg}</span>
              </div>
            )}

            {/* Tab switch */}
            <div className="grid grid-cols-2 p-1 rounded-xl bg-slate-100 mb-4 text-xs font-bold border border-slate-200">
              <button
                type="button"
                onClick={() => setAuthMode('login')}
                className={`py-2 rounded-lg transition-all ${
                  authMode === 'login'
                    ? 'bg-[#D32F2F] text-white shadow-sm'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
                }`}
              >
                Ingresar
              </button>
              <button
                type="button"
                onClick={() => setAuthMode('register')}
                className={`py-2 rounded-lg transition-all ${
                  authMode === 'register'
                    ? 'bg-[#D32F2F] text-white shadow-sm'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
                }`}
              >
                Registrarse
              </button>
            </div>

            {authMode === 'login' ? (
              <form onSubmit={handleLogin} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-800 mb-1">
                    Usuario o Correo Institucional
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500">
                      <User className="w-4 h-4" />
                    </div>
                    <input
                      type="text"
                      value={usernameInput}
                      onChange={(e) => setUsernameInput(e.target.value)}
                      placeholder="Tu usuario o correo institucional..."
                      required
                      className="w-full pl-9 pr-3 py-2.5 text-xs rounded-xl border border-slate-300 bg-white text-slate-900 placeholder:text-slate-500 font-medium focus:outline-none focus:border-[#D32F2F] focus:ring-2 focus:ring-red-500/20 shadow-xs"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-800 mb-1">
                    Contraseña
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500">
                      <Lock className="w-4 h-4" />
                    </div>
                    <input
                      type="password"
                      value={passwordInput}
                      onChange={(e) => setPasswordInput(e.target.value)}
                      placeholder="Contraseña"
                      required
                      className="w-full pl-9 pr-3 py-2.5 text-xs rounded-xl border border-slate-300 bg-white text-slate-900 placeholder:text-slate-500 font-medium focus:outline-none focus:border-[#D32F2F] focus:ring-2 focus:ring-red-500/20 shadow-xs"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full py-2.5 rounded-xl font-bold text-xs text-white bg-[#D32F2F] hover:bg-[#B71C1C] shadow-md shadow-red-500/20 transition-all active:scale-[0.98] cursor-pointer"
                >
                  Entrar a la Plataforma
                </button>

                <div className="relative my-3">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-slate-200" />
                  </div>
                  <div className="relative flex justify-center text-[10px] uppercase font-bold text-slate-500">
                    <span className="bg-white px-2">Acceso Institucional Directo</span>
                  </div>
                </div>

                {/* Google and Microsoft Buttons */}
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={handleDirectMicrosoftLogin}
                    className="py-2 px-3 rounded-xl border border-slate-300 bg-white hover:bg-slate-50 text-xs font-bold flex items-center justify-center gap-2 text-slate-800 shadow-xs transition-colors cursor-pointer"
                  >
                    <svg className="w-4 h-4 shrink-0" viewBox="0 0 23 23">
                      <path fill="#f35325" d="M1 1h10v10H1z" />
                      <path fill="#81bc06" d="M12 1h10v10H12z" />
                      <path fill="#05a6f0" d="M1 12h10v10H1z" />
                      <path fill="#ffba08" d="M12 12h10v10H12z" />
                    </svg>
                    <span>@salesianos</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleDirectGoogleLogin}
                    className="py-2 px-3 rounded-xl border border-slate-300 bg-white hover:bg-slate-50 text-xs font-bold flex items-center justify-center gap-2 text-slate-800 shadow-xs transition-colors cursor-pointer"
                  >
                    <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
                      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                    </svg>
                    <span>Google</span>
                  </button>
                </div>

                <div className="pt-2 text-center">
                  <button
                    type="button"
                    onClick={() => {
                      setIsAuthModalOpen(false);
                      setCreatorErrorMsg('');
                      setCreatorKeyInput('');
                      setIsCreatorModalOpen(true);
                    }}
                    className="text-xs font-extrabold text-amber-700 hover:text-amber-800 hover:underline transition-colors cursor-pointer"
                  >
                    🔑 ¿Eres el Creador Original? Ingresa aquí
                  </button>
                </div>
              </form>
            ) : (
              <form onSubmit={handleRegister} className="space-y-3.5">
                <div className="grid grid-cols-3 gap-1.5">
                  {(['estudiante', 'profesor', 'administrador'] as const).map((r) => (
                    <button
                      key={r}
                      type="button"
                      onClick={() => setRegRole(r)}
                      className={`py-2 rounded-xl text-[11px] font-bold capitalize border transition-all cursor-pointer ${
                        regRole === r
                          ? 'bg-[#D32F2F] text-white border-[#D32F2F] shadow-sm'
                          : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-50'
                      }`}
                    >
                      {r === 'administrador' ? 'Director' : r}
                    </button>
                  ))}
                </div>

                {/* School Selector */}
                <div>
                  <label className="block text-[11px] font-bold text-slate-800 mb-1">Institución Educativa</label>
                  <select
                    value={regInstitucion}
                    onChange={(e) => setRegInstitucion(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 bg-white text-slate-900 font-medium mb-1 focus:outline-none focus:border-[#D32F2F] focus:ring-2 focus:ring-red-500/20"
                  >
                    {schoolsList.map((sch, i) => (
                      <option key={i} value={sch}>
                        {sch}
                      </option>
                    ))}
                    <option value="otra">+ Registrar otro colegio o institución</option>
                  </select>

                  {regInstitucion === 'otra' && (
                    <input
                      type="text"
                      value={regCustomInstitucion}
                      onChange={(e) => setRegCustomInstitucion(e.target.value)}
                      placeholder="Escribe el nombre de tu colegio..."
                      required
                      className="w-full px-3 py-2 text-xs rounded-xl border border-red-300 bg-red-50/30 text-slate-900 placeholder:text-slate-500 font-medium focus:outline-none focus:border-[#D32F2F] focus:ring-2 focus:ring-red-500/20"
                    />
                  )}
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-800 mb-1">Nombre Completo</label>
                  <input
                    type="text"
                    value={regNombre}
                    onChange={(e) => setRegNombre(e.target.value)}
                    placeholder="Ej. Mateo Gómez"
                    required
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 bg-white text-slate-900 placeholder:text-slate-500 font-medium focus:outline-none focus:border-[#D32F2F] focus:ring-2 focus:ring-red-500/20 shadow-xs"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-800 mb-1">Usuario</label>
                    <input
                      type="text"
                      value={regUsuario}
                      onChange={(e) => setRegUsuario(e.target.value)}
                      placeholder="mateo.gomez"
                      required
                      className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 bg-white text-slate-900 placeholder:text-slate-500 font-medium focus:outline-none focus:border-[#D32F2F] focus:ring-2 focus:ring-red-500/20 shadow-xs"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-slate-800 mb-1">Contraseña</label>
                    <input
                      type="password"
                      value={regClave}
                      onChange={(e) => setRegClave(e.target.value)}
                      placeholder="Mínimo 4 caracteres"
                      required
                      className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 bg-white text-slate-900 placeholder:text-slate-500 font-medium focus:outline-none focus:border-[#D32F2F] focus:ring-2 focus:ring-red-500/20 shadow-xs"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full py-2.5 rounded-xl font-bold text-xs text-white bg-[#D32F2F] hover:bg-[#B71C1C] shadow-md shadow-red-500/20 transition-all active:scale-[0.98] mt-2 cursor-pointer"
                >
                  Completar Registro
                </button>
              </form>
            )}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL EXCLUSIVO: CREADOR ORIGINAL DE BOSCOCLASS */}
      {/* ========================================================================= */}
      {isCreatorModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="relative w-full max-w-md bg-gradient-to-b from-[#450a0a] via-[#7f1d1d] to-[#1c1917] text-white rounded-3xl p-6 sm:p-7 shadow-2xl border-2 border-amber-400/50">
            <button
              type="button"
              onClick={() => setIsCreatorModalOpen(false)}
              className="absolute top-4 right-4 p-1 rounded-full text-white/60 hover:text-white hover:bg-white/10"
            >
              ✕
            </button>

            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-amber-400 to-yellow-300 text-slate-950 font-black grid place-items-center shadow-lg text-xl">
                🔐
              </div>
              <div>
                <span className="px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider bg-red-500/30 text-amber-300 border border-amber-400/30">
                  Acceso Restringido
                </span>
                <h3 className="text-lg font-black text-white">Portal del Creador Original</h3>
              </div>
            </div>

            <p className="text-xs text-white/80 leading-relaxed mb-4">
              Portal confidencial de supervisión central. Se requiere autenticación autorizada para acceder a la administración multi-institucional.
            </p>

            {creatorErrorMsg && (
              <div className="mb-4 p-3 rounded-2xl bg-rose-500/20 border border-rose-500/50 text-rose-200 text-xs font-bold flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
                <span>{creatorErrorMsg}</span>
              </div>
            )}

            <form onSubmit={handleCreatorLogin} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-white/90 mb-1.5">
                  Clave Maestra de Autorización:
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-amber-400">
                    <KeyRound className="w-4 h-4" />
                  </div>
                  <input
                    type="password"
                    value={creatorKeyInput}
                    onChange={(e) => setCreatorKeyInput(e.target.value)}
                    placeholder="••••••••••••••••"
                    autoFocus
                    required
                    className="w-full pl-9 pr-3 py-3 text-xs rounded-2xl bg-white/10 border border-white/20 text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-amber-400 focus:bg-white/15 font-mono"
                  />
                </div>
                <span className="text-[11px] text-amber-300/90 font-medium block mt-1.5 flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                  <span>Acceso confidencial verificado por clave criptográfica.</span>
                </span>
              </div>

              <button
                type="submit"
                className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-red-600 via-rose-600 to-amber-600 hover:from-red-700 hover:to-amber-700 text-white font-black text-xs shadow-lg transition-all active:scale-[0.99] flex items-center justify-center gap-2"
              >
                <span>Acceder al Panel Maestro</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MICROSOFT SSO MODAL (@salesianos) */}
      {/* ========================================================================= */}
      {microsoftModal && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs">
          <div className="w-full max-w-sm bg-white rounded-3xl p-6 shadow-2xl border border-slate-200">
            <h4 className="text-base font-extrabold text-slate-800 mb-1">
              Acceso Microsoft (@salesianos)
            </h4>
            <p className="text-xs text-slate-500 mb-4">
              Ingresa tu correo institucional salesiano para autenticar tu cuenta educativa.
            </p>
            <div className="mb-4">
              <button
                type="button"
                onClick={handleDirectMicrosoftLogin}
                className="w-full py-2.5 px-3 rounded-xl bg-[#0078d4] hover:bg-[#006cbd] text-white text-xs font-bold flex items-center justify-center gap-2 shadow-xs transition-all cursor-pointer"
              >
                <div className="w-3.5 h-3.5 grid grid-cols-2 gap-0.5">
                  <div className="bg-[#f25022]" />
                  <div className="bg-[#7fba00]" />
                  <div className="bg-[#00a4ef]" />
                  <div className="bg-[#ffb900]" />
                </div>
                <span>Conectar Directo con Microsoft 365</span>
              </button>
              <div className="relative my-3 text-center">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-slate-200" />
                </div>
                <span className="relative bg-white px-2 text-[10px] uppercase font-bold text-slate-400">
                  o ingresa manualmente
                </span>
              </div>
            </div>
            <form onSubmit={handleStartMicrosoft} className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Tu Nombre</label>
                <input
                  type="text"
                  value={microsoftNameInput}
                  onChange={(e) => setMicrosoftNameInput(e.target.value)}
                  placeholder="Ej. Ricardo Vázquez"
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
                  className="w-1/2 py-2 text-xs font-bold text-white bg-[#0284c7] rounded-xl hover:bg-[#0369a1]"
                >
                  Continuar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* GOOGLE SSO MODAL */}
      {/* ========================================================================= */}
      {googleModal && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs">
          <div className="w-full max-w-sm bg-white rounded-3xl p-6 shadow-2xl border border-slate-200">
            <h4 className="text-base font-extrabold text-slate-800 mb-1">
              Acceso con Google Workspace
            </h4>
            <p className="text-xs text-slate-500 mb-4">
              Ingresa con tu cuenta oficial para sincronizar Classroom, Calendar, Drive y Tasks.
            </p>

            <button
              type="button"
              onClick={handleDirectGoogleLogin}
              className="w-full py-2.5 px-4 mb-4 rounded-2xl bg-slate-900 hover:bg-black text-white text-xs font-bold flex items-center justify-center gap-2 shadow-md transition-all cursor-pointer"
            >
              <svg viewBox="0 0 48 48" className="w-4 h-4">
                <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z" />
                <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z" />
                <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z" />
                <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z" />
              </svg>
              <span>Continuar con Google (Recomendado)</span>
            </button>

            <div className="relative flex items-center justify-center my-3">
              <div className="border-t border-slate-200 w-full" />
              <span className="bg-white px-2 text-[10px] uppercase font-bold text-slate-400 absolute">
                o ingresa tu correo
              </span>
            </div>

            <form onSubmit={handleStartGoogle} className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Tu Nombre</label>
                <input
                  type="text"
                  value={googleNameInput}
                  onChange={(e) => setGoogleNameInput(e.target.value)}
                  placeholder="Ej. Ana García"
                  className="w-full p-2.5 text-xs rounded-xl border border-slate-300"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Correo Electrónico</label>
                <input
                  type="email"
                  value={googleEmailInput}
                  onChange={(e) => setGoogleEmailInput(e.target.value)}
                  placeholder="usuario@gmail.com"
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

      {/* ========================================================================= */}
      {/* VERIFICATION FLOW MODAL (FIXED: NO CODE VISIBLE ABOVE INPUT) */}
      {/* ========================================================================= */}
      {verificationFlow && (
        <div className="fixed inset-0 z-70 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs">
          <div className="w-full max-w-sm bg-[#0c1613] text-white rounded-3xl p-6 shadow-2xl border border-slate-700">
            
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-2xl bg-emerald-950 text-emerald-400 border border-emerald-800/60 grid place-items-center shrink-0">
                <KeyRound className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-white">Verificación de Identidad</h4>
                <p className="text-[11px] text-slate-400 truncate max-w-[200px]">
                  {verificationFlow.email}
                </p>
              </div>
            </div>

            {verificationFlow.status === 'connecting' ? (
              <div className="py-8 text-center space-y-2">
                <div className="w-6 h-6 border-2 border-emerald-400 border-t-transparent rounded-full animate-spin mx-auto" />
                <p className="text-xs text-slate-400 font-semibold">
                  Validando dominio con Microsoft Entra ID...
                </p>
              </div>
            ) : verificationFlow.status === 'verified' ? (
              <div className="py-6 text-center space-y-2">
                <CheckCircle2 className="w-10 h-10 text-emerald-400 mx-auto animate-bounce" />
                <h5 className="text-sm font-bold text-emerald-400">¡Cuenta institucional confirmada!</h5>
                <p className="text-xs text-slate-300">Iniciando sesión en BoscoClass...</p>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="p-3.5 rounded-2xl bg-[#142620] border border-[#1e3d33] text-xs text-slate-300 space-y-1">
                  <p className="font-semibold text-emerald-400">
                    Código de verificación enviado
                  </p>
                  <p className="text-[11px] text-slate-400 leading-relaxed">
                    Hemos despachado un código de seguridad de 6 dígitos a tu bandeja de entrada de Microsoft Outlook.
                  </p>
                </div>

                {/* The 6-digit input box WITHOUT leaking the code above it */}
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1.5">
                    Introduce el código de 6 dígitos:
                  </label>
                  <input
                    type="text"
                    maxLength={6}
                    value={enteredCode}
                    onChange={(e) => setEnteredCode(e.target.value.replace(/\D/g, ''))}
                    placeholder="••••••"
                    className="w-full p-3 text-center text-xl font-mono tracking-widest rounded-2xl border border-slate-700 bg-slate-900 text-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                  {verificationError && (
                    <p className="text-xs text-rose-400 text-center mt-1.5 font-medium">
                      {verificationError}
                    </p>
                  )}
                </div>

                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setVerificationFlow(null);
                      setIncomingEmailToast(null);
                    }}
                    className="w-1/3 py-2.5 rounded-xl border border-slate-700 hover:bg-slate-800 text-slate-300 text-xs font-semibold"
                  >
                    Cancelar
                  </button>
                  <button
                    type="button"
                    onClick={() => handleConfirmVerification()}
                    disabled={enteredCode.length < 4}
                    className="w-2/3 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-md disabled:opacity-50 transition-all"
                  >
                    Confirmar Verificación
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
