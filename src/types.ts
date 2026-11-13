export interface ChatAttachment {
  name: string;
  mimeType: string;
  data: string; // Base64 data URL
  size: number;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  files?: ChatAttachment[];
  timestamp: number;
  isStreaming?: boolean;
  error?: boolean;
}

export interface ChatSession {
  id: string;
  title: string;
  createdAt: number;
  updatedAt: number;
  messages: ChatMessage[];
  subject?: string;
}

export interface BoscoIAControlConfig {
  isLocked: boolean;
  lockedReason: string;
  giveCoinsForQuestions: boolean;
  coinsPerQuestion: number;
  maxCoinsDaily: number;
  socraticOnly: boolean;
  lockedAulas: string[];
  lastUpdatedBy?: string;
  updatedAt?: number;
}

export interface UserSession {
  id: string;
  name: string;
  email: string;
  username?: string;
  role?: 'estudiante' | 'profesor' | 'administrador' | 'creadorOriginal';
  avatar?: string;
  authProvider: 'google' | 'microsoft' | 'email' | 'guest';
  academicLevel: 'Primaria' | 'Secundaria' | 'Bachillerato' | 'Universidad' | 'Autodidacta';
  teachingTone: 'Didáctico y guiado' | 'Conciso y directo' | 'Académico riguroso' | 'Socrático (con preguntas guía)';
  isVerified?: boolean;
  verificationMethod?: string;
  institutionId?: string;
  institutionName?: string;
  createdAt: number;
}

export interface UserConfig {
  theme: 'dark' | 'light';
  username: string;
  academicLevel: 'Primaria' | 'Secundaria' | 'Bachillerato' | 'Universidad' | 'Autodidacta';
  teachingTone: 'Didáctico y guiado' | 'Conciso y directo' | 'Académico riguroso' | 'Socrático (con preguntas guía)';
  institutionId: string;
  // Personalización de voz de BoscoIA
  voiceEngine?: 'gemini' | 'browser';
  voiceName?: 'Kore' | 'Puck' | 'Zephyr' | 'Charon' | 'Fenrir' | string;
  voiceSpeed?: number; // 0.85 (Pausado) a 1.25 (Rápido), default 1.0
  voicePitch?: number; // 0.8 a 1.2, default 1.0
}

export interface InstitutionConfig {
  id: string;
  name: string;
  shortName: string;
  tagline: string;
  logoUrl: string;
  primaryColor: string;
  allowedDomains: string[];
  customRubric?: string;
  isCustom?: boolean;
}

export interface Badge {
  id: string;
  title: string;
  description: string;
  icon: string;
  unlocked: boolean;
  unlockedAt?: number;
}

export interface WeeklyQuest {
  id: string;
  title: string;
  target: number;
  progress: number;
  xpReward: number;
  completed: boolean;
}

export interface StudentGamification {
  xp: number;
  level: number;
  levelTitle: string;
  streakDays: number;
  lastActiveDate: string;
  badges: Badge[];
  quests: WeeklyQuest[];
  classCoins?: number;
}

export interface LmsTask {
  id: string;
  title: string;
  course: string;
  teacher: string;
  dueDate: string;
  rubric: string;
  samplePrompt: string;
  status: 'pending' | 'in_progress' | 'submitted';
  grade?: number;
}

// ClassPoint Native Platform Entities
export interface ClassPointUser {
  usuario: string;
  clave: string;
  nombre: string;
  rol: 'estudiante' | 'profesor' | 'administrador' | 'creadorOriginal';
  institucion: string;
  email?: string;
  avatar?: string;
  telefono?: string;
  especialidad?: string;
  materiasAsignadas?: string[];
  grado?: string;
  fechaRegistro?: string;
}

export interface ClassPointAula {
  id: string;
  nombre: string;
  horario: string;
  profesor: string;
  profesorUsuario?: string;
  codigo: string;
  estudiantes: string[];
  materia?: string;
  grado?: string;
  institucion?: string;
  descripcion?: string;
  capacidadMax?: number;
}

export interface ClassPointPlanEstudioUnidad {
  semana: string;
  tema: string;
  descripcion: string;
  competencias?: string;
  recursos?: string;
}

export interface ClassPointPlanEstudio {
  id: string;
  titulo: string;
  materia: string;
  grado: string;
  profesor: string;
  profesorUsuario: string;
  institucion?: string;
  aulaId?: string;
  aulaNombre?: string;
  periodo?: string;
  descripcion: string;
  objetivos: string[];
  unidades: ClassPointPlanEstudioUnidad[];
  visibleParaEstudiantes: boolean; // Teachers decide whether students see this; Directors ALWAYS see it
  aprobadoPorDirector?: boolean;
  retroalimentacionDirector?: string;
  fechaCreacion: string;
  timestamp: number;
}

export interface ClassPointMateria {
  id: string;
  nombre: string;
  profesor: string;
  aulaId?: string;
  institucion?: string;
}

export interface ClassPointCalificacion {
  id?: string;
  usuario: string;
  nombre: string;
  materia: string;
  aulaId?: string;
  tipo: string;
  porcentaje: number;
  nota: string;
  periodo: string;
  institucion?: string;
}

export interface ClassPointTarea {
  id: string;
  usuario: string;
  aulaId?: string;
  materia?: string;
  titulo: string;
  descripcion: string;
  fecha: string;
  estado: 'pendiente' | 'completada' | 'entregada';
  institucion?: string;
  puntosCoins?: number;
}

export interface ClassPointEvidencia {
  id: string;
  usuario: string;
  estudianteNombre?: string;
  tareaId?: string;
  materia?: string;
  profesor?: string;
  titulo: string;
  descripcion?: string;
  archivoNombre: string;
  archivoData?: string;
  archivoTipo?: string;
  enlace?: string;
  estado?: 'pendiente' | 'aprobada' | 'Aprobada' | 'requiere_ajustes' | 'Solicita cambios';
  retroalimentacion?: string;
  puntosCoins?: number;
  institucion?: string;
  fecha?: string;
  timestamp?: number;
}


export interface ClassPointAsistencia {
  id?: string;
  usuario: string;
  fecha: string;
  estado: 'Presente' | 'Tarde' | 'Falta';
  periodo: string;
  institucion?: string;
}

export interface ClassPointProducto {
  id: string;
  nombre: string;
  descripcion: string;
  precio: number;
  institucion?: string;
  icono?: string;
}

export interface ClassPointChisme {
  id: number;
  tipo: 'aula' | 'privado';
  aulaId?: string | null;
  aulaNombre?: string;
  texto: string;
  autor: string;
  autorUsuario: string;
  destinatario: string;
  destinatarioUsuario?: string | null;
  institucion?: string;
  fecha: number;
  fechaTexto: string;
  editado?: boolean;
}

export interface ClassPointAnuncio {
  id: string;
  titulo: string;
  texto: string;
  prioridad?: 'normal' | 'importante' | 'urgente';
  aulaId?: string;
  aulaNombre?: string;
  autor: string;
  autorUsuario?: string;
  rol?: 'profesor' | 'administrador' | 'creadorOriginal' | string;
  institucion?: string;
  fecha: string;
  timestamp?: number;
}

export interface ClassPointBackup {
  version: number;
  fecha: string;
  plataforma?: string;
  datos: Record<string, string>;
}

export const INSTITUTIONS_PRESETS: InstitutionConfig[] = [
  {
    id: 'sanjuanbosco',
    name: 'Colegio San Juan Bosco',
    shortName: 'San Juan Bosco',
    tagline: 'Salesianos de Don Bosco · Tuluá, Valle del Cauca',
    logoUrl: '/assets/aistudio/image_c159dc3e.png',
    primaryColor: '#059669',
    allowedDomains: ['salesianos.edu.co', 'sanjuanbosco.edu.co', 'salesianos.org'],
    customRubric: 'Enfoque preventivo de Don Bosco: educar con amor, razón y religión, guiando con paciencia paso a paso.',
  },
  {
    id: 'classpoint',
    name: 'ClassPoint — Plataforma Educativa',
    shortName: 'ClassPoint',
    tagline: 'Demuestra, Valida y Evoluciona · Gestión Escolar y Tutoría IA',
    logoUrl: 'https://api.dicebear.com/7.x/identicon/svg?seed=ClassPoint&backgroundColor=176b87',
    primaryColor: '#176b87',
    allowedDomains: ['classpoint.edu', 'colegio.edu', 'salesianos.edu.co'],
    customRubric: 'Filosofía ClassPoint: Reconocimiento continuo del esfuerzo, aprendizaje paso a paso, entrega de evidencias auditadas y motivación activa mediante Boscoints e insignias pedagógicas.',
  },
  {
    id: 'salesianos_red',
    name: 'Red de Colegios Salesianos',
    shortName: 'Salesianos Don Bosco',
    tagline: 'Comunidad Educativa Pastoral Salesiana',
    logoUrl: '/assets/aistudio/image_c159dc3e.png',
    primaryColor: '#0284c7',
    allowedDomains: ['salesianos.edu.co', 'salesianos.org', 'salesianos.edu'],
    customRubric: 'Carisma salesiano y excelencia académica integral.',
  },
  {
    id: 'custom_school',
    name: 'Tu Institución Educativa (Marca Blanca)',
    shortName: 'Campus Modular',
    tagline: 'Plataforma Pedagógica Personalizada para Colegios y Universidades',
    logoUrl: 'https://api.dicebear.com/7.x/identicon/svg?seed=EscuelaModular&backgroundColor=0d9488',
    primaryColor: '#0d9488',
    allowedDomains: [],
    customRubric: 'Metodología pedagógica activa centrada en el razonamiento crítico del estudiante.',
    isCustom: true,
  },
];

export const INITIAL_GAMIFICATION: StudentGamification = {
  xp: 380,
  level: 2,
  levelTitle: 'Explorador del Conocimiento',
  streakDays: 3,
  classCoins: 120,
  lastActiveDate: new Date().toISOString().split('T')[0],
  badges: [
    {
      id: 'streak_3',
      title: 'Constancia Escolar',
      description: 'Mantén una racha de estudio activo durante 3 días.',
      icon: '🔥',
      unlocked: true,
      unlockedAt: Date.now() - 86400000,
    },
    {
      id: 'math_wizard',
      title: 'Mente Algebraica',
      description: 'Resuelve problemas con notación matemática de libro de texto.',
      icon: '📐',
      unlocked: true,
      unlockedAt: Date.now() - 43200000,
    },
    {
      id: 'verified_id',
      title: 'Identidad Verificada',
      description: 'Verifica tu cuenta institucional con Google o Microsoft.',
      icon: '🛡️',
      unlocked: true,
      unlockedAt: Date.now() - 172800000,
    },
    {
      id: 'step_solver',
      title: 'Paso a Paso Impecable',
      description: 'Utiliza el botón de pistas antes de resolver un ejercicio.',
      icon: '💡',
      unlocked: false,
    },
    {
      id: 'self_critic',
      title: 'Comprobador Autónomo',
      description: 'Envía tu respuesta para comprobarla con el tutor.',
      icon: '✍️',
      unlocked: false,
    },
    {
      id: 'deep_learner',
      title: 'Razonamiento Crítico',
      description: 'Pide explicaciones con analogías cotidianas.',
      icon: '🔄',
      unlocked: false,
    },
  ],
  quests: [
    {
      id: 'quest_1',
      title: 'Profundiza en 3 conceptos con notación matemática',
      target: 3,
      progress: 2,
      xpReward: 100,
      completed: false,
    },
    {
      id: 'quest_2',
      title: 'Solicita una pista pedagógica del siguiente paso',
      target: 1,
      progress: 1,
      xpReward: 50,
      completed: true,
    },
    {
      id: 'quest_3',
      title: 'Comprueba el resultado de un ejercicio con el tutor',
      target: 1,
      progress: 0,
      xpReward: 75,
      completed: false,
    },
  ],
};

export const INITIAL_LMS_TASKS: LmsTask[] = [
  {
    id: 'task_math_quadratics',
    title: 'Taller 4: Factorización de Trinomios Cuadráticos',
    course: 'Matemáticas y Álgebra - Grado 9°',
    teacher: 'Prof. Ricardo Gómez',
    dueDate: 'Viernes, 11:59 PM',
    rubric: 'Dominio de factorización por factor común y trinomio de la forma ax^2 + bx + c. Explicar cada paso sin saltarse el procedimiento.',
    samplePrompt: 'Tengo que resolver el Taller 4 de Álgebra sobre factorización de trinomios. Guíame paso a paso con el primer ejercicio.',
    status: 'in_progress',
  },
  {
    id: 'task_physics_motion',
    title: 'Guía de Laboratorio: Movimiento Rectilíneo Uniforme',
    course: 'Física Clásica - Grado 10°',
    teacher: 'Lic. Andrés Caicedo',
    dueDate: 'Próximo Lunes',
    rubric: 'Cálculo de velocidad, distancia y tiempo con despeje formal de fórmulas algebraicas y análisis dimensional.',
    samplePrompt: 'Ayúdame a comprender el concepto de Movimiento Rectilíneo Uniforme y las fórmulas con fracciones para la guía de física.',
    status: 'pending',
  },
  {
    id: 'task_spanish_essay',
    title: 'Ensayo Argumentativo: Ética y Tecnología Digital',
    course: 'Lengua Castellana y Humanidades',
    teacher: 'Dra. María Elena Restrepo',
    dueDate: 'En 5 días',
    rubric: 'Tesis clara, argumentos con citas de autoridad, contraargumentos y conclusión reflexiva.',
    samplePrompt: 'Estoy escribiendo mi ensayo sobre ética en la tecnología para Lengua Castellana. Ayúdame a estructurar la tesis y los contraargumentos.',
    status: 'pending',
  },
];

export const DEFAULT_CONFIG: UserConfig = {
  theme: 'dark',
  username: 'Estudiante',
  academicLevel: 'Bachillerato',
  teachingTone: 'Didáctico y guiado',
  institutionId: 'sanjuanbosco',
  voiceEngine: 'gemini',
  voiceName: 'Kore',
  voiceSpeed: 1.0,
  voicePitch: 1.0,
};

// ==========================================
// MULTI-SCHOOL & CREATOR MASTER TYPES
// ==========================================
export interface SchoolEntity {
  id: string;
  nombre: string;
  ciudad: string;
  lema: string;
  colorPrimario: string;
  logoUrl?: string;
  activo: boolean;
  directores: string[]; // usernames or emails of authorized directors
  limiteEstudiantes: number;
  estudiantesRegistrados: number;
  fechaCreacion: string;
  boscoIAConfig: BoscoIAControlConfig;
}

export interface BoscointGrantLog {
  id: string;
  toUsuario: string;
  toNombre: string;
  amount: number;
  grantedBy: string; // name of teacher / director / creator
  grantedByRol: 'profesor' | 'administrador' | 'creadorOriginal';
  reason: string;
  institucion: string;
  timestamp: number;
}

