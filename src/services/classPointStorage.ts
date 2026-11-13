/**
 * ClassPoint Data Storage & Synchronization Service
 * Provides full compatibility with the ClassPoint platform schema:
 * - Aulas, Materias, Calificaciones (periodos y ponderación)
 * - Tareas, Evidencias, Asistencia
 * - ClassCoins (CC) y Mercado de Recompensas
 * - Insignias y Logros de ClassPoint
 * - El Chismógrafo (tablón escolar)
 * - Importación y exportación de respaldos JSON compatibles con ClassPoint
 */

import {
  ClassPointAula,
  ClassPointMateria,
  ClassPointCalificacion,
  ClassPointTarea,
  ClassPointEvidencia,
  ClassPointAsistencia,
  ClassPointProducto,
  ClassPointChisme,
  ClassPointBackup,
  ClassPointAnuncio,
  ClassPointUser,
  BoscoIAControlConfig,
  LmsTask,
  SchoolEntity,
  BoscointGrantLog,
  ClassPointPlanEstudio,
} from '../types';

const STORAGE_KEYS = {
  AULAS: 'classpoint_aulas',
  MATERIAS: 'classpoint_materias',
  CALIFICACIONES: 'classpoint_calificaciones',
  TAREAS: 'classpoint_tareas',
  EVIDENCIAS: 'classpoint_evidencias',
  ASISTENCIA: 'classpoint_asistencia',
  MONEDAS: 'classpoint_monedas',
  PRODUCTOS: 'classpoint_productos',
  CHISMOGRAFO: 'classpoint_chismografo',
  ANUNCIOS: 'classpoint_anuncios',
  LOGROS: 'classpoint_logros',
  USERS: 'classpoint_users',
  BOSCOIA_CONFIG: 'classpoint_boscoia_control',
  DAILY_AI_COINS: 'classpoint_daily_ai_coins',
  SCHOOLS: 'boscoclass_schools',
  BOSCOINT_GRANTS: 'boscoclass_boscoint_grants',
  PLANES_ESTUDIO: 'boscoclass_planes_estudio',
};

export const DEFAULT_USERS: ClassPointUser[] = [
  {
    usuario: 'creador',
    clave: 'creador2026',
    nombre: 'Ricardo Vázquez Caicedo',
    rol: 'creadorOriginal',
    institucion: 'Red Global BoscoClass',
    email: 'ricardovazquezcaicedo@gmail.com',
    especialidad: 'Arquitecto de Plataforma & Pedagogo en IA',
    telefono: '+57 312 456 7890',
    fechaRegistro: '2026-01-01',
  },
  {
    usuario: 'director',
    clave: 'admin',
    nombre: 'Padre Javier Restrepo S.D.B.',
    rol: 'administrador',
    institucion: 'Colegio San Juan Bosco',
    email: 'director@salesianos.edu.co',
    especialidad: 'Rectoría y Pastoral Juvenil',
    telefono: '+57 310 882 1144',
    fechaRegistro: '2026-01-15',
  },
  {
    usuario: 'claudia.directora',
    clave: 'colegio2026',
    nombre: 'Dra. Claudia Morales',
    rol: 'administrador',
    institucion: 'Colegio Mayor de Los Andes',
    email: 'claudia.morales@colmayor.edu.co',
    especialidad: 'Dirección Académica & Gestión LMS',
    telefono: '+57 315 220 3399',
    fechaRegistro: '2026-02-10',
  },
  {
    usuario: 'profesor',
    clave: 'admin',
    nombre: 'Prof. Ricardo Gómez',
    rol: 'profesor',
    institucion: 'Colegio San Juan Bosco',
    email: 'profesor@salesianos.edu.co',
    especialidad: 'Matemáticas Avanzadas, Álgebra y Cálculo',
    materiasAsignadas: ['Matemáticas y Álgebra', 'Geometría y Trigonometría'],
    telefono: '+57 318 400 5511',
    grado: 'Grados 9° y 10°',
    fechaRegistro: '2026-02-01',
  },
  {
    usuario: 'andres.caicedo',
    clave: 'admin',
    nombre: 'Lic. Andrés Caicedo',
    rol: 'profesor',
    institucion: 'Colegio San Juan Bosco',
    email: 'andres.caicedo@salesianos.edu.co',
    especialidad: 'Física Clásica y Ciencias Naturales',
    materiasAsignadas: ['Ciencias Naturales y Física', 'Laboratorio Experimental'],
    telefono: '+57 314 555 7788',
    grado: 'Grados 10° y 11°',
    fechaRegistro: '2026-02-05',
  },
  {
    usuario: 'maria.restrepo',
    clave: 'admin',
    nombre: 'Dra. María Elena Restrepo',
    rol: 'profesor',
    institucion: 'Colegio San Juan Bosco',
    email: 'maria.restrepo@salesianos.edu.co',
    especialidad: 'Lengua Castellana, Literatura y Filosofía',
    materiasAsignadas: ['Lengua Castellana', 'Comprensión Lectora'],
    telefono: '+57 320 119 4433',
    grado: 'Grados 8° a 11°',
    fechaRegistro: '2026-02-10',
  },
  {
    usuario: 'carlos.mendoza',
    clave: 'admin',
    nombre: 'Ing. Carlos Mendoza',
    rol: 'profesor',
    institucion: 'Colegio San Juan Bosco',
    email: 'carlos.mendoza@salesianos.edu.co',
    especialidad: 'Tecnología, Algoritmia y Robótica',
    materiasAsignadas: ['Informática Educativa', 'Robótica'],
    telefono: '+57 311 990 2211',
    grado: 'Grados 9° y 11°',
    fechaRegistro: '2026-02-12',
  },
  {
    usuario: 'ana',
    clave: '1234',
    nombre: 'Ana García',
    rol: 'estudiante',
    institucion: 'Colegio San Juan Bosco',
    email: 'ana.garcia@salesianos.edu.co',
    grado: 'Grado 9° · Aula 101',
    telefono: '+57 301 234 5678',
    fechaRegistro: '2026-02-15',
  },
  {
    usuario: 'luis',
    clave: '5678',
    nombre: 'Luis Pérez',
    rol: 'estudiante',
    institucion: 'Colegio San Juan Bosco',
    email: 'luis.perez@salesianos.edu.co',
    grado: 'Grado 9° · Aula 101',
    telefono: '+57 302 345 6789',
    fechaRegistro: '2026-02-16',
  },
  {
    usuario: 'valentina',
    clave: '1234',
    nombre: 'Valentina Morales',
    rol: 'estudiante',
    institucion: 'Colegio San Juan Bosco',
    email: 'valentina.morales@salesianos.edu.co',
    grado: 'Grado 10° · Aula 201',
    telefono: '+57 300 987 6543',
    fechaRegistro: '2026-02-20',
  },
  {
    usuario: 'mateo',
    clave: '1234',
    nombre: 'Mateo Gómez',
    rol: 'estudiante',
    institucion: 'Colegio San Juan Bosco',
    email: 'mateo.gomez@salesianos.edu.co',
    grado: 'Grado 11° · Aula 301',
    telefono: '+57 315 456 1234',
    fechaRegistro: '2026-02-22',
  },
];


export const DEFAULT_SCHOOLS: SchoolEntity[] = [
  {
    id: 'sanjuanbosco',
    nombre: 'Colegio San Juan Bosco',
    ciudad: 'Tuluá, Valle del Cauca',
    lema: 'Educando mentes y corazones con amor salesiano',
    colorPrimario: '#176b87',
    logoUrl: '/assets/aistudio/image_c159dc3e.png',
    activo: true,
    directores: ['director', 'admin'],
    limiteEstudiantes: 800,
    estudiantesRegistrados: 340,
    fechaCreacion: '2026-01-15',
    boscoIAConfig: {
      isLocked: false,
      lockedReason: 'Evaluación o examen activo en el salón',
      giveCoinsForQuestions: true,
      coinsPerQuestion: 2,
      maxCoinsDaily: 20,
      socraticOnly: false,
      lockedAulas: [],
      lastUpdatedBy: 'Director Rector',
      updatedAt: Date.now(),
    },
  },
  {
    id: 'colmayor',
    nombre: 'Colegio Mayor de Los Andes',
    ciudad: 'Bogotá D.C., Colombia',
    lema: 'Liderazgo, ciencias y formación humanista',
    colorPrimario: '#0f766e',
    logoUrl: '/assets/aistudio/image_c159dc3e.png',
    activo: true,
    directores: ['claudia.directora'],
    limiteEstudiantes: 650,
    estudiantesRegistrados: 195,
    fechaCreacion: '2026-02-10',
    boscoIAConfig: {
      isLocked: false,
      lockedReason: 'Examen de periodo en curso',
      giveCoinsForQuestions: true,
      coinsPerQuestion: 3,
      maxCoinsDaily: 25,
      socraticOnly: true,
      lockedAulas: [],
      lastUpdatedBy: 'Dra. Claudia Morales',
      updatedAt: Date.now(),
    },
  },
  {
    id: 'institutocentral',
    nombre: 'Instituto Técnico Central',
    ciudad: 'Cali, Colombia',
    lema: 'Innovación técnica, robótica y futuro digital',
    colorPrimario: '#b45309',
    logoUrl: '/assets/aistudio/image_c159dc3e.png',
    activo: true,
    directores: [],
    limiteEstudiantes: 500,
    estudiantesRegistrados: 120,
    fechaCreacion: '2026-03-01',
    boscoIAConfig: {
      isLocked: false,
      lockedReason: 'Evaluación técnica',
      giveCoinsForQuestions: true,
      coinsPerQuestion: 2,
      maxCoinsDaily: 20,
      socraticOnly: false,
      lockedAulas: [],
      lastUpdatedBy: 'Coordinación',
      updatedAt: Date.now(),
    },
  },
];

export const DEFAULT_BOSCOIA_CONFIG: BoscoIAControlConfig = {
  isLocked: false,
  lockedReason: 'Evaluación o examen activo en el salón',
  giveCoinsForQuestions: true,
  coinsPerQuestion: 2,
  maxCoinsDaily: 20,
  socraticOnly: false,
  lockedAulas: [],
  lastUpdatedBy: 'Prof. Ricardo Gómez',
  updatedAt: Date.now(),
};

// Seed initial demo data matching ClassPoint specifications
const INITIAL_AULAS: ClassPointAula[] = [
  {
    id: 'aula-1',
    nombre: 'Aula 101 - Grado 9°',
    horario: 'Lunes a Viernes · 8:00 - 10:00',
    profesor: 'Prof. Ricardo Gómez',
    codigo: 'CP-MATH-01',
    estudiantes: ['ana', 'luis', 'estudiante'],
  },
  {
    id: 'aula-2',
    nombre: 'Laboratorio de Ciencias 3',
    horario: 'Martes y Jueves · 10:30 - 12:00',
    profesor: 'Lic. Andrés Caicedo',
    codigo: 'CP-LABO-02',
    estudiantes: ['ana', 'luis', 'estudiante'],
  },
];

const INITIAL_MATERIAS: ClassPointMateria[] = [
  { id: 'mat-1', nombre: 'Matemáticas y Álgebra', profesor: 'Prof. Ricardo Gómez', aulaId: 'aula-1' },
  { id: 'mat-2', nombre: 'Ciencias Naturales y Física', profesor: 'Lic. Andrés Caicedo', aulaId: 'aula-2' },
  { id: 'mat-3', nombre: 'Lengua Castellana', profesor: 'Dra. María Elena Restrepo', aulaId: 'aula-1' },
];

const INITIAL_CALIFICACIONES: ClassPointCalificacion[] = [
  {
    id: 'cal-1',
    usuario: 'estudiante',
    nombre: 'Estudiante',
    materia: 'Matemáticas y Álgebra',
    aulaId: 'aula-1',
    tipo: 'Taller de Factorización',
    porcentaje: 25,
    nota: '4.8',
    periodo: '1',
  },
  {
    id: 'cal-2',
    usuario: 'estudiante',
    nombre: 'Estudiante',
    materia: 'Ciencias Naturales y Física',
    aulaId: 'aula-2',
    tipo: 'Informe de Laboratorio MRU',
    porcentaje: 20,
    nota: '4.5',
    periodo: '1',
  },
  {
    id: 'cal-3',
    usuario: 'estudiante',
    nombre: 'Estudiante',
    materia: 'Lengua Castellana',
    aulaId: 'aula-1',
    tipo: 'Ensayo Crítico',
    porcentaje: 30,
    nota: '4.6',
    periodo: '1',
  },
];

const INITIAL_TAREAS: ClassPointTarea[] = [
  {
    id: 'tarea-cp-1',
    usuario: 'estudiante',
    aulaId: 'aula-1',
    materia: 'Matemáticas y Álgebra',
    titulo: 'Taller 4: Factorización de Trinomios Cuadráticos',
    descripcion: 'Descomponer en factores primos los trinomios de la forma ax^2 + bx + c y justificar cada paso.',
    fecha: '2026-11-10',
    estado: 'pendiente',
    puntosCoins: 50,
  },
  {
    id: 'tarea-cp-2',
    usuario: 'estudiante',
    aulaId: 'aula-2',
    materia: 'Ciencias Naturales y Física',
    titulo: 'Guía MRU: Análisis Cinemático con Fracciones',
    descripcion: 'Calcular velocidad y distancia resolviendo las fracciones con notación formal.',
    fecha: '2026-11-14',
    estado: 'pendiente',
    puntosCoins: 40,
  },
  {
    id: 'tarea-cp-3',
    usuario: 'estudiante',
    aulaId: 'aula-1',
    materia: 'Lengua Castellana',
    titulo: 'Ensayo Argumentativo: Ética Digital',
    descripcion: 'Redactar tesis y tres argumentos de peso con citas bibliográficas.',
    fecha: '2026-11-18',
    estado: 'completada',
    puntosCoins: 35,
  },
];

export const INITIAL_EVIDENCIAS: ClassPointEvidencia[] = [
  {
    id: 'evi-1',
    usuario: 'ana',
    estudianteNombre: 'Ana García',
    tareaId: 'tarea-cp-1',
    materia: 'Matemáticas y Álgebra',
    profesor: 'Prof. Ricardo Gómez',
    titulo: 'Desarrollo de Factorización por Agrupación y Trinomios',
    descripcion: 'Procedimiento formal en hoja de examen con comprobaciones algebraicas y despejes detallados.',
    archivoNombre: 'Taller_Factorizacion_AnaGarcia_901.pdf',
    archivoTipo: 'application/pdf',
    enlace: 'https://drive.google.com/file/d/demo-factorizacion-ana',
    estado: 'Aprobada',
    retroalimentacion: '¡Excelente desarrollo! Cada trinomio está debidamente verificado paso a paso.',
    puntosCoins: 50,
    institucion: 'Colegio San Juan Bosco',
    fecha: '2026-11-05',
    timestamp: Date.now() - 86400000 * 2,
  },
  {
    id: 'evi-2',
    usuario: 'luis',
    estudianteNombre: 'Luis Pérez',
    tareaId: 'tarea-cp-2',
    materia: 'Ciencias Naturales y Física',
    profesor: 'Lic. Andrés Caicedo',
    titulo: 'Informe de Laboratorio: Cinemática MRU y Gráficas de Velocidad',
    descripcion: 'Tiempos medidos y cálculo de velocidad instantánea con análisis dimensional y fracciones.',
    archivoNombre: 'Informe_MRU_LuisPerez_Fisica.pdf',
    archivoTipo: 'application/pdf',
    enlace: 'https://drive.google.com/file/d/demo-mru-luis',
    estado: 'Aprobada',
    retroalimentacion: 'Cálculos matemáticos exactos y unidades físicas consistentes.',
    puntosCoins: 40,
    institucion: 'Colegio San Juan Bosco',
    fecha: '2026-11-06',
    timestamp: Date.now() - 86400000,
  },
  {
    id: 'evi-3',
    usuario: 'ana',
    estudianteNombre: 'Ana García',
    tareaId: 'tarea-cp-3',
    materia: 'Lengua Castellana',
    profesor: 'Dra. María Elena Restrepo',
    titulo: 'Borrador de Ensayo: Ética y Tecnología en la Educación',
    descripcion: 'Estructura argumentativa con tesis socrática, citas y contraargumentos reflexivos.',
    archivoNombre: 'Ensayo_Etica_IA_AnaGarcia.docx',
    archivoTipo: 'application/docx',
    estado: 'pendiente',
    retroalimentacion: 'Evidencia recibida y asignada para revisión docente.',
    puntosCoins: 35,
    institucion: 'Colegio San Juan Bosco',
    fecha: '2026-11-07',
    timestamp: Date.now() - 3600000 * 4,
  },
  {
    id: 'evi-4',
    usuario: 'estudiante',
    estudianteNombre: 'Estudiante',
    tareaId: 'tarea-cp-1',
    materia: 'Matemáticas y Álgebra',
    profesor: 'Prof. Ricardo Gómez',
    titulo: 'Taller de Práctica Guiada con BoscoIA',
    descripcion: 'Ejercicios de trinomio cuadrado perfecto desarrollados con la asistencia de BoscoIA.',
    archivoNombre: 'Guia_Algebra_Resuelta.pdf',
    archivoTipo: 'application/pdf',
    estado: 'Aprobada',
    retroalimentacion: 'Buen trabajo guiado y comprensión de los conceptos.',
    puntosCoins: 45,
    institucion: 'Colegio San Juan Bosco',
    fecha: '2026-11-06',
    timestamp: Date.now() - 86400000 * 1.5,
  },
];

const INITIAL_PRODUCTOS: ClassPointProducto[] = [
  {
    id: 'descanso',
    nombre: 'Descanso Anticipado',
    descripcion: 'Salir 10 minutos antes al receso con autorización docente.',
    precio: 20,
    icono: '☕',
  },
  {
    id: 'examen',
    nombre: '+1 Punto de Ayuda en Examen',
    descripcion: 'Canjea una bonificación de un punto en un taller o evaluación.',
    precio: 45,
    icono: '⭐',
  },
  {
    id: 'musica',
    nombre: 'Poner Música de Estudio en Taller',
    descripcion: 'Elige la lista de reproducción instrumental durante la clase práctica.',
    precio: 30,
    icono: '🎵',
  },
  {
    id: 'lider_equipo',
    nombre: 'Elegir Equipo de Trabajo',
    descripcion: 'Derecho a formar el grupo en la siguiente actividad colaborativa.',
    precio: 25,
    icono: '👥',
  },
];

const INITIAL_CHISMES: ClassPointChisme[] = [
  {
    id: 1,
    tipo: 'aula',
    aulaId: 'aula-1',
    texto: '¡Hoy en clase de matemáticas logramos factorizar todos los trinomios con la ayuda de BoscoIA! 🚀',
    autor: 'Ana García',
    autorUsuario: 'ana',
    destinatario: 'todo el salón',
    fecha: Date.now() - 3600000,
    fechaTexto: 'Hace 1 hora',
  },
  {
    id: 2,
    tipo: 'aula',
    aulaId: 'aula-2',
    texto: 'Recuerden traer la calculadora para el laboratorio de cinemática del jueves.',
    autor: 'Luis Pérez',
    autorUsuario: 'luis',
    destinatario: 'todo el salón',
    fecha: Date.now() - 7200000,
    fechaTexto: 'Hace 2 horas',
  },
];

const INITIAL_ANUNCIOS: ClassPointAnuncio[] = [
  {
    id: 'anuncio-1',
    titulo: 'Entrega de Informes Académicos y Boletines de Periodo',
    texto: 'Estimada comunidad educativa salesiana: este viernes a las 7:00 AM se llevará a cabo la reunión de acudientes y entrega oficial de valoraciones académicas en el auditorio principal.',
    prioridad: 'importante',
    autor: 'Padre Javier Restrepo S.D.B.',
    autorUsuario: 'director',
    rol: 'administrador',
    institucion: 'Colegio San Juan Bosco',
    aulaId: 'todas',
    aulaNombre: 'Toda la Institución',
    fecha: 'Hoy, 08:30 AM',
    timestamp: Date.now() - 3600000,
  },
  {
    id: 'anuncio-2',
    titulo: 'Feria de Ciencias, Robótica y Factorización 2026',
    texto: 'Inscripciones abiertas para proyectos de modelación matemática con KaTeX, experimentos de física clásica y proyectos robóticos.',
    prioridad: 'normal',
    autor: 'Prof. Ricardo Gómez',
    autorUsuario: 'profesor',
    rol: 'profesor',
    institucion: 'Colegio San Juan Bosco',
    aulaId: 'aula-1',
    aulaNombre: 'Aula 101 - Grado 9°',
    fecha: 'Ayer, 02:15 PM',
    timestamp: Date.now() - 86400000,
  },
  {
    id: 'anuncio-3',
    titulo: 'Plataforma BoscoClass: Tutoría IA Activa y Voces Neurales',
    texto: 'Se ha habilitado la versión actualizada con tutoría socrática inteligente BoscoIA, voces humanas de estudio y generación de ilustraciones didácticas para toda la comunidad.',
    prioridad: 'normal',
    autor: 'Ricardo Vázquez Caicedo',
    autorUsuario: 'creador',
    rol: 'creadorOriginal',
    institucion: 'Red Global BoscoClass',
    aulaId: 'todas',
    aulaNombre: 'Comunidad Global BoscoClass',
    fecha: 'Esta semana',
    timestamp: Date.now() - 172800000,
  },
];

const INITIAL_PLANES_ESTUDIO: ClassPointPlanEstudio[] = [
  {
    id: 'plan-1',
    titulo: 'Plan Curricular: Álgebra Fundamental y Factorización Polinomial',
    materia: 'Matemáticas y Álgebra',
    grado: 'Grado 9°',
    profesor: 'Prof. Ricardo Gómez',
    profesorUsuario: 'profesor',
    institucion: 'Colegio San Juan Bosco',
    aulaId: 'aula-1',
    aulaNombre: 'Aula 101 - Grado 9°',
    periodo: 'Primer Periodo · 2026',
    descripcion: 'Desarrollo del pensamiento algebraico, factorización de trinomios, fracciones algebraicas y modelación matemática con resolución socrática en BoscoIA.',
    objetivos: [
      'Identificar y aplicar los 10 casos clásicos de factorización algebraica.',
      'Simplificar fracciones algebraicas compuestas con procedimientos rigurosos.',
      'Modelar problemas cotidianos mediante ecuaciones lineales de primer grado.',
    ],
    unidades: [
      {
        semana: 'Semanas 1 - 2',
        tema: 'Introducción al Álgebra y Expresiones Monómicas/Polinómicas',
        descripcion: 'Repaso de leyes de exponentes, términos semejantes y operaciones fundamentales.',
        competencias: 'Modelación cuantitativa y simplificación analítica',
        recursos: 'Taller 1 BoscoClass y Guía KaTeX en BoscoIA',
      },
      {
        semana: 'Semanas 3 - 5',
        tema: 'Factorización de Trinomios (x² + bx + c y ax² + bx + c)',
        descripcion: 'Técnicas de aspa simple, factorización por agrupación y binomios conjugados.',
        competencias: 'Razonamiento abstracto y deducción de raíces',
        recursos: 'Ejercicios guiados paso a paso con el tutor inteligente',
      },
      {
        semana: 'Semanas 6 - 8',
        tema: 'Fracciones Algebraicas y Ecuaciones Lineales',
        descripcion: 'Mínimo común múltiplo polinomial y resolución de problemas de aplicación.',
        competencias: 'Resolución de problemas contextualizados',
        recursos: 'Laboratorio de álgebra y rúbrica de evidencias',
      },
    ],
    visibleParaEstudiantes: true, // Visible to students
    aprobadoPorDirector: true,
    retroalimentacionDirector: 'Plan estructurado conforme al plan de estudios institucional.',
    fechaCreacion: '2026-02-01',
    timestamp: Date.now() - 3600000 * 24 * 10,
  },
  {
    id: 'plan-2',
    titulo: 'Plan Curricular: Biología Celular, Fotosíntesis y Genética Mendeliana',
    materia: 'Ciencias Naturales y Física',
    grado: 'Grado 10°',
    profesor: 'Lic. Andrés Caicedo',
    profesorUsuario: 'andres.caicedo',
    institucion: 'Colegio San Juan Bosco',
    aulaId: 'aula-2',
    aulaNombre: 'Laboratorio de Ciencias 3',
    periodo: 'Primer Periodo · 2026',
    descripcion: 'Estructura comparada de células eucariotas vs. procariotas, síntesis de ATP, leyes mendelianas y análisis de esquemas biológicos de alta resolución.',
    objetivos: [
      'Distinguir los organelos celulares y sus funciones vitales en células eucariotas y procariotas.',
      'Comprender el ciclo celular, mitosis, meiosis y replicación del ADN.',
      'Predecir proporciones fenotípicas y genotípicas utilizando cuadros de Punnett.',
    ],
    unidades: [
      {
        semana: 'Semanas 1 - 3',
        tema: 'La Célula: Estructura, Pared Celular y Organelos',
        descripcion: 'Comparativa visual entre bacterias y células animales/vegetales con micrografías.',
        competencias: 'Identificación morfológica y pensamiento científico',
        recursos: 'Ilustraciones didácticas de BoscoIA (/api/educational-image)',
      },
      {
        semana: 'Semanas 4 - 6',
        tema: 'Metabolismo: Respiración Celular y Cloroplastos',
        descripcion: 'Ciclo de Krebs, fosforilación oxidativa y fase lumínica de la fotosíntesis.',
        competencias: 'Análisis de transformaciones energéticas en sistemas vivos',
        recursos: 'Simulaciones virtuales y preguntas socráticas',
      },
    ],
    visibleParaEstudiantes: true, // Visible to students
    aprobadoPorDirector: true,
    retroalimentacionDirector: 'Excelente integración de recursos visuales generados por IA.',
    fechaCreacion: '2026-02-05',
    timestamp: Date.now() - 3600000 * 24 * 7,
  },
  {
    id: 'plan-3',
    titulo: 'Borrador Pedagógico: Evaluaciones Avanzadas y Rúbricas de Recuperación',
    materia: 'Matemáticas y Álgebra',
    grado: 'Grado 9°',
    profesor: 'Prof. Ricardo Gómez',
    profesorUsuario: 'profesor',
    institucion: 'Colegio San Juan Bosco',
    aulaId: 'aula-1',
    aulaNombre: 'Aula 101 - Grado 9°',
    periodo: 'Segundo Periodo · 2026',
    descripcion: 'Estrategias de nivelación para estudiantes con dificultades en factorización y banco de preguntas para exámenes parciales.',
    objetivos: [
      'Diseñar ítems de evaluación formativa de acuerdo con la taxonomía de Bloom.',
      'Implementar planes de apoyo y refuerzo en contraturno.',
    ],
    unidades: [
      {
        semana: 'Semana de Nivelación',
        tema: 'Talleres de Refuerzo Personalizado',
        descripcion: 'Banco de ejercicios complementarios para recuperar notas deficientes.',
        competencias: 'Superación académica y autoevaluación',
        recursos: 'Guía de recuperación confidencial',
      },
    ],
    visibleParaEstudiantes: false, // CONFIDENTIAL DRAFT: Hidden from students, ALWAYS visible to directors!
    aprobadoPorDirector: false,
    retroalimentacionDirector: 'Plan de recuperación en revisión por coordinación académica.',
    fechaCreacion: '2026-02-12',
    timestamp: Date.now() - 3600000 * 24 * 2,
  },
];

function readStorage<T>(key: string, defaultValue: T): T {
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : defaultValue;
  } catch {
    return defaultValue;
  }
}

function writeStorage<T>(key: string, value: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (e) {
    console.error('Error escribiendo en storage ClassPoint', e);
  }
}

export class ClassPointService {
  // Aulas
  static getAulas(institucion?: string): ClassPointAula[] {
    const all = readStorage<ClassPointAula[]>(STORAGE_KEYS.AULAS, INITIAL_AULAS);
    if (!institucion) return all;
    return all.filter((a) => !a.institucion || a.institucion.toLowerCase() === institucion.toLowerCase());
  }

  static saveAulas(aulas: ClassPointAula[]): void {
    writeStorage(STORAGE_KEYS.AULAS, aulas);
  }

  static addAula(
    aula: Omit<ClassPointAula, 'id' | 'codigo' | 'estudiantes'> & {
      id?: string;
      codigo?: string;
      estudiantes?: string[];
    }
  ): ClassPointAula {
    const all = this.getAulas();
    const cleanCode = (
      aula.codigo?.trim() || `BC-${Math.random().toString(36).substring(2, 6).toUpperCase()}`
    ).toUpperCase();

    const nueva: ClassPointAula = {
      ...aula,
      id: aula.id || `aula-${Date.now()}`,
      codigo: cleanCode,
      estudiantes: aula.estudiantes || [],
      horario: aula.horario || 'Lunes a Viernes · 8:00 - 10:00',
    };

    all.push(nueva);
    this.saveAulas(all);
    return nueva;
  }

  static joinAula(
    codigo: string,
    usuario: string
  ): { success: boolean; message: string; aula?: ClassPointAula } {
    if (!codigo || !codigo.trim()) {
      return { success: false, message: 'Por favor ingresa un código de aula válido.' };
    }
    const cleanCode = codigo.trim().toUpperCase();
    const all = this.getAulas();
    const index = all.findIndex((a) => a.codigo.toUpperCase() === cleanCode);

    if (index === -1) {
      return {
        success: false,
        message: `No se encontró ningún aula con el código "${cleanCode}". Consulta con tu profesor titular.`,
      };
    }

    const targetAula = all[index];
    const uClean = usuario.toLowerCase();
    if (targetAula.estudiantes.some((e) => e.toLowerCase() === uClean)) {
      return {
        success: false,
        message: `Ya estás inscrito en el aula "${targetAula.nombre}".`,
        aula: targetAula,
      };
    }

    targetAula.estudiantes.push(uClean);
    all[index] = targetAula;
    this.saveAulas(all);

    return {
      success: true,
      message: `¡Te has unido exitosamente al aula "${targetAula.nombre}"!`,
      aula: targetAula,
    };
  }

  static deleteAula(id: string): void {
    const all = this.getAulas().filter((a) => a.id !== id);
    this.saveAulas(all);
  }

  // Planes de Estudio
  static getPlanesEstudio(
    _usuario?: string,
    rol?: string,
    _institucion?: string
  ): ClassPointPlanEstudio[] {
    const all = readStorage<ClassPointPlanEstudio[]>(
      STORAGE_KEYS.PLANES_ESTUDIO,
      INITIAL_PLANES_ESTUDIO
    );

    // If student: ONLY show plans where visibleParaEstudiantes === true
    if (rol === 'estudiante') {
      return all.filter((p) => p.visibleParaEstudiantes === true);
    }

    // Teachers, Directors (administradores), and Creador Original ALWAYS see all plans
    return all;
  }

  static addPlanEstudio(
    plan: Omit<ClassPointPlanEstudio, 'id' | 'fechaCreacion' | 'timestamp'> & { id?: string }
  ): ClassPointPlanEstudio {
    const all = readStorage<ClassPointPlanEstudio[]>(
      STORAGE_KEYS.PLANES_ESTUDIO,
      INITIAL_PLANES_ESTUDIO
    );
    const nuevo: ClassPointPlanEstudio = {
      ...plan,
      id: plan.id || `plan-${Date.now()}`,
      fechaCreacion: new Date().toISOString().slice(0, 10),
      timestamp: Date.now(),
    };
    all.unshift(nuevo);
    writeStorage(STORAGE_KEYS.PLANES_ESTUDIO, all);
    return nuevo;
  }

  static updatePlanEstudio(id: string, updates: Partial<ClassPointPlanEstudio>): void {
    const all = readStorage<ClassPointPlanEstudio[]>(
      STORAGE_KEYS.PLANES_ESTUDIO,
      INITIAL_PLANES_ESTUDIO
    );
    const index = all.findIndex((p) => p.id === id);
    if (index !== -1) {
      all[index] = { ...all[index], ...updates };
      writeStorage(STORAGE_KEYS.PLANES_ESTUDIO, all);
    }
  }

  static deletePlanEstudio(id: string): void {
    const all = readStorage<ClassPointPlanEstudio[]>(
      STORAGE_KEYS.PLANES_ESTUDIO,
      INITIAL_PLANES_ESTUDIO
    ).filter((p) => p.id !== id);
    writeStorage(STORAGE_KEYS.PLANES_ESTUDIO, all);
  }

  // Materias
  static getMaterias(): ClassPointMateria[] {
    return readStorage<ClassPointMateria[]>(STORAGE_KEYS.MATERIAS, INITIAL_MATERIAS);
  }

  // Calificaciones
  static getCalificaciones(usuario?: string): ClassPointCalificacion[] {
    const all = readStorage<ClassPointCalificacion[]>(STORAGE_KEYS.CALIFICACIONES, INITIAL_CALIFICACIONES);
    if (!usuario) return all;
    return all.filter((c) => !c.usuario || c.usuario.toLowerCase() === usuario.toLowerCase());
  }

  static addCalificacion(calificacion: ClassPointCalificacion): void {
    const list = this.getCalificaciones();
    list.push(calificacion);
    writeStorage(STORAGE_KEYS.CALIFICACIONES, list);
  }

  // Tareas
  static getTareas(usuario?: string): ClassPointTarea[] {
    const all = readStorage<ClassPointTarea[]>(STORAGE_KEYS.TAREAS, INITIAL_TAREAS);
    if (!usuario) return all;
    return all.filter((t) => !t.usuario || t.usuario.toLowerCase() === usuario.toLowerCase());
  }

  static saveTareas(tareas: ClassPointTarea[]): void {
    writeStorage(STORAGE_KEYS.TAREAS, tareas);
  }

  static updateTareaEstado(id: string, nuevoEstado: 'pendiente' | 'completada' | 'entregada'): void {
    const tareas = this.getTareas();
    const updated = tareas.map((t) => (t.id === id ? { ...t, estado: nuevoEstado } : t));
    this.saveTareas(updated);
  }

  // Evidencias
  static getEvidencias(usuario?: string): ClassPointEvidencia[] {
    const all = readStorage<ClassPointEvidencia[]>(STORAGE_KEYS.EVIDENCIAS, INITIAL_EVIDENCIAS);
    if (!usuario) return all;
    return all.filter((e) => !e.usuario || e.usuario.toLowerCase() === usuario.toLowerCase());
  }

  static saveEvidencias(evidencias: ClassPointEvidencia[]): void {
    writeStorage(STORAGE_KEYS.EVIDENCIAS, evidencias);
  }

  static addEvidencia(evidencia: Omit<ClassPointEvidencia, 'id'> & { id?: string }): ClassPointEvidencia {
    const all = this.getEvidencias();
    const nueva: ClassPointEvidencia = {
      ...evidencia,
      id: evidencia.id || `evi-${Date.now()}`,
      estado: evidencia.estado || 'pendiente',
      fecha: evidencia.fecha || new Date().toISOString().slice(0, 10),
      timestamp: evidencia.timestamp || Date.now(),
    };
    all.unshift(nueva);
    this.saveEvidencias(all);
    return nueva;
  }

  static updateEvidencia(id: string, updates: Partial<ClassPointEvidencia>): void {
    const all = this.getEvidencias();
    const index = all.findIndex((e) => e.id === id);
    if (index !== -1) {
      all[index] = { ...all[index], ...updates };
      this.saveEvidencias(all);
    }
  }

  static deleteEvidencia(id: string): void {
    const all = this.getEvidencias().filter((e) => e.id !== id);
    this.saveEvidencias(all);
  }


  // ClassCoins - Every student appears with 0 Boscoints upon entering for the first time
  static getClassCoins(usuario: string): number {
    const wallet = readStorage<Record<string, number>>(STORAGE_KEYS.MONEDAS, {});
    return wallet[usuario.toLowerCase()] ?? 0;
  }

  static addClassCoins(usuario: string, amount: number): number {
    const wallet = readStorage<Record<string, number>>(STORAGE_KEYS.MONEDAS, {});
    const key = usuario.toLowerCase();
    const current = wallet[key] || 0;
    const updated = current + amount;
    wallet[key] = updated;
    writeStorage(STORAGE_KEYS.MONEDAS, wallet);
    return updated;
  }

  /**
   * Only STUDENTS are permitted to spend Boscoints in the reward market.
   * Teachers, Directors, and the Original Creator CANNOT spend coins; they can only grant them to students.
   */
  static spendClassCoins(usuario: string, amount: number, role?: string): boolean {
    if (role && role !== 'estudiante') {
      console.warn(`Rol "${role}" no tiene permitido usar Boscoints. Solo los estudiantes pueden usarlos.`);
      return false;
    }
    const uLower = usuario.toLowerCase();
    if (
      uLower === 'admin' ||
      uLower === 'director' ||
      uLower === 'creador' ||
      uLower === 'profesor' ||
      uLower.includes('directora')
    ) {
      console.warn('Docentes, directores y el creador original solo pueden otorgar monedas a los estudiantes, no gastarlas.');
      return false;
    }
    const current = this.getClassCoins(usuario);
    if (current < amount) return false;
    const wallet = readStorage<Record<string, number>>(STORAGE_KEYS.MONEDAS, {});
    wallet[uLower] = current - amount;
    writeStorage(STORAGE_KEYS.MONEDAS, wallet);
    return true;
  }

  /**
   * Teachers, Directors, and Creador Original grant Boscoints to students
   */
  static grantBoscoints(
    toUsuario: string,
    toNombre: string,
    amount: number,
    grantedBy: string,
    grantedByRol: 'profesor' | 'administrador' | 'creadorOriginal',
    reason: string,
    institucion: string
  ): boolean {
    if (amount <= 0) return false;
    this.addClassCoins(toUsuario, amount);
    const logs = readStorage<BoscointGrantLog[]>(STORAGE_KEYS.BOSCOINT_GRANTS, []);
    const newLog: BoscointGrantLog = {
      id: `grant-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      toUsuario: toUsuario.toLowerCase(),
      toNombre,
      amount,
      grantedBy,
      grantedByRol,
      reason: reason || 'Mérito académico y participación',
      institucion: institucion || 'Colegio San Juan Bosco',
      timestamp: Date.now(),
    };
    logs.unshift(newLog);
    writeStorage(STORAGE_KEYS.BOSCOINT_GRANTS, logs.slice(0, 100));
    return true;
  }

  static getBoscointGrants(institucion?: string): BoscointGrantLog[] {
    const logs = readStorage<BoscointGrantLog[]>(STORAGE_KEYS.BOSCOINT_GRANTS, []);
    if (!institucion) return logs;
    return logs.filter((l) => !l.institucion || l.institucion.toLowerCase() === institucion.toLowerCase());
  }

  // ==========================================
  // MULTI-SCHOOL MANAGEMENT METHODS
  // ==========================================
  static getSchools(): SchoolEntity[] {
    return readStorage<SchoolEntity[]>(STORAGE_KEYS.SCHOOLS, DEFAULT_SCHOOLS);
  }

  static saveSchools(schools: SchoolEntity[]): void {
    writeStorage(STORAGE_KEYS.SCHOOLS, schools);
  }

  static getSchoolById(id: string): SchoolEntity | undefined {
    return this.getSchools().find((s) => s.id === id);
  }

  static addSchool(school: SchoolEntity): void {
    const schools = this.getSchools();
    if (schools.some((s) => s.id === school.id)) {
      this.updateSchool(school.id, school);
      return;
    }
    schools.push(school);
    this.saveSchools(schools);
  }

  static updateSchool(id: string, updates: Partial<SchoolEntity>): void {
    const schools = this.getSchools();
    const index = schools.findIndex((s) => s.id === id);
    if (index !== -1) {
      schools[index] = { ...schools[index], ...updates };
      this.saveSchools(schools);
    }
  }

  static deleteSchool(id: string): void {
    const schools = this.getSchools().filter((s) => s.id !== id);
    this.saveSchools(schools);
  }


  // Productos del Mercado
  static getProductos(): ClassPointProducto[] {
    return readStorage<ClassPointProducto[]>(STORAGE_KEYS.PRODUCTOS, INITIAL_PRODUCTOS);
  }

  // El Chismógrafo - Separado por salón de clase
  static getChismes(aulaId?: string): ClassPointChisme[] {
    const all = readStorage<ClassPointChisme[]>(STORAGE_KEYS.CHISMOGRAFO, INITIAL_CHISMES);
    if (!aulaId || aulaId === 'todos') return all;
    return all.filter((c) => c.aulaId === aulaId);
  }

  static addChisme(chisme: Omit<ClassPointChisme, 'id' | 'fecha' | 'fechaTexto'>): void {
    const all = readStorage<ClassPointChisme[]>(STORAGE_KEYS.CHISMOGRAFO, INITIAL_CHISMES);
    const nuevo: ClassPointChisme = {
      ...chisme,
      id: Date.now(),
      fecha: Date.now(),
      fechaTexto: 'Ahora mismo',
    };
    all.unshift(nuevo);
    writeStorage(STORAGE_KEYS.CHISMOGRAFO, all);
  }

  static updateChisme(id: number, nuevoTexto: string): void {
    const all = this.getChismes();
    const index = all.findIndex((c) => c.id === id);
    if (index !== -1) {
      all[index] = { ...all[index], texto: nuevoTexto, editado: true };
      writeStorage(STORAGE_KEYS.CHISMOGRAFO, all);
    }
  }

  static deleteChisme(id: number): void {
    const all = this.getChismes().filter((c) => c.id !== id);
    writeStorage(STORAGE_KEYS.CHISMOGRAFO, all);
  }

  // Anuncios Institucionales (Comunicados de Docentes, Directores y Creador Original)
  static getAnuncios(institucion?: string, aulaId?: string): ClassPointAnuncio[] {
    const all = readStorage<ClassPointAnuncio[]>(STORAGE_KEYS.ANUNCIOS, INITIAL_ANUNCIOS);
    return all.filter((a) => {
      // If user institution is defined, match it or global
      if (institucion && institucion !== 'global' && a.institucion && a.institucion !== 'global') {
        if (a.institucion.toLowerCase().trim() !== institucion.toLowerCase().trim()) {
          return false;
        }
      }
      // If aulaId filter is provided and announcement is not school-wide ('todas')
      if (aulaId && aulaId !== 'todas' && a.aulaId && a.aulaId !== 'todas' && a.aulaId !== aulaId) {
        return false;
      }
      return true;
    });
  }

  static addAnuncio(anuncio: Omit<ClassPointAnuncio, 'id' | 'timestamp'>): ClassPointAnuncio {
    const all = readStorage<ClassPointAnuncio[]>(STORAGE_KEYS.ANUNCIOS, INITIAL_ANUNCIOS);
    const nuevo: ClassPointAnuncio = {
      ...anuncio,
      id: `anuncio-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      timestamp: Date.now(),
    };
    all.unshift(nuevo);
    writeStorage(STORAGE_KEYS.ANUNCIOS, all);
    return nuevo;
  }

  static deleteAnuncio(id: string): void {
    const all = readStorage<ClassPointAnuncio[]>(STORAGE_KEYS.ANUNCIOS, INITIAL_ANUNCIOS);
    const updated = all.filter((a) => a.id !== id);
    writeStorage(STORAGE_KEYS.ANUNCIOS, updated);
  }

  // Cifras y Estadísticas Reales de la Plataforma (sin números falsos)
  static getPlatformStats() {
    const users = this.getUsers();
    const schools = this.getSchools();
    const aulas = this.getAulas();
    const tareas = this.getTareas();
    const planes = this.getPlanesEstudio();
    const anuncios = this.getAnuncios();
    const evidencias = this.getEvidencias();

    const estudiantes = users.filter((u) => u.rol === 'estudiante');
    const profesores = users.filter((u) => u.rol === 'profesor');
    const directores = users.filter((u) => u.rol === 'administrador');
    const creadores = users.filter((u) => u.rol === 'creadorOriginal');

    // Computar las cifras reales para cada institución registrada
    const schoolsWithRealCounts = schools.map((sch) => {
      const schoolStudents = estudiantes.filter(
        (e) => e.institucion?.toLowerCase().trim() === sch.nombre.toLowerCase().trim()
      );
      const schoolTeachers = profesores.filter(
        (p) => p.institucion?.toLowerCase().trim() === sch.nombre.toLowerCase().trim()
      );
      const schoolAulas = aulas.filter(
        (a) => a.institucion?.toLowerCase().trim() === sch.nombre.toLowerCase().trim()
      );

      return {
        ...sch,
        estudiantesRegistrados: schoolStudents.length,
        profesoresRegistrados: schoolTeachers.length,
        aulasRegistradas: schoolAulas.length,
      };
    });

    return {
      totalPersonas: users.length,
      totalEstudiantes: estudiantes.length,
      totalProfesores: profesores.length,
      totalDirectores: directores.length,
      totalCreadores: creadores.length,
      totalEscuelas: schools.length,
      totalAulas: aulas.length,
      totalTareas: tareas.length,
      totalPlanes: planes.length,
      totalAnuncios: anuncios.length,
      totalEvidencias: evidencias.length,
      schools: schoolsWithRealCounts,
      rawUsers: users,
    };
  }

  // Métricas rápidas para estudiante
  static getStudentMetrics(usuario: string) {
    const notas = this.getCalificaciones(usuario);
    const tareas = this.getTareas(usuario);
    const pendientes = tareas.filter((t) => t.estado === 'pendiente').length;
    const completadas = tareas.filter((t) => t.estado === 'completada' || t.estado === 'entregada').length;
    const monedas = this.getClassCoins(usuario);

    const promedio =
      notas.length > 0
        ? (notas.reduce((acc, n) => acc + Number(n.nota || 0), 0) / notas.length).toFixed(1)
        : '—';

    return {
      promedio,
      notasRegistradas: notas.length,
      tareasPendientes: pendientes,
      tareasCompletadas: completadas,
      classCoins: monedas,
      asistenciaPct: 96,
    };
  }

  // Convert ClassPoint tareas into BoscoIA LmsTask objects
  static getLmsTasks(usuario: string): LmsTask[] {
    const cpTareas = this.getTareas(usuario);
    return cpTareas.map((t) => ({
      id: t.id,
      title: t.titulo,
      course: t.materia || 'Materia Escolar',
      teacher: 'Docente Titular',
      dueDate: t.fecha,
      rubric: t.descripcion,
      samplePrompt: `Hola BoscoIA, ayúdame a resolver la tarea de ClassPoint: "${t.titulo}". Guíame paso a paso con los conceptos y fórmulas.`,
      status: t.estado === 'completada' ? 'submitted' : t.estado === 'entregada' ? 'submitted' : 'in_progress',
    }));
  }

  // Export full ClassPoint backup JSON (identical structure to original ClassPoint)
  static exportBackup(): string {
    const backup: ClassPointBackup = {
      version: 1,
      fecha: new Date().toISOString(),
      plataforma: 'ClassPoint + BoscoIA Suite',
      datos: {
        aulas: JSON.stringify(this.getAulas()),
        materias: JSON.stringify(this.getMaterias()),
        calificaciones: JSON.stringify(this.getCalificaciones()),
        tareas: JSON.stringify(this.getTareas()),
        evidencias: JSON.stringify(this.getEvidencias()),
        productos: JSON.stringify(this.getProductos()),
        chismografo: JSON.stringify(this.getChismes()),
        anuncios: JSON.stringify(this.getAnuncios()),
      },
    };
    return JSON.stringify(backup, null, 2);
  }

  // Import ClassPoint backup JSON
  static importBackup(jsonString: string): { success: boolean; message: string } {
    try {
      const parsed = JSON.parse(jsonString);
      if (!parsed || !parsed.datos) {
        return { success: false, message: 'El archivo no contiene un formato de respaldo válido de ClassPoint.' };
      }

      const { datos } = parsed;
      if (datos.aulas) writeStorage(STORAGE_KEYS.AULAS, JSON.parse(datos.aulas));
      if (datos.materias) writeStorage(STORAGE_KEYS.MATERIAS, JSON.parse(datos.materias));
      if (datos.calificaciones) writeStorage(STORAGE_KEYS.CALIFICACIONES, JSON.parse(datos.calificaciones));
      if (datos.tareas) writeStorage(STORAGE_KEYS.TAREAS, JSON.parse(datos.tareas));
      if (datos.evidencias) writeStorage(STORAGE_KEYS.EVIDENCIAS, JSON.parse(datos.evidencias));
      if (datos.productos) writeStorage(STORAGE_KEYS.PRODUCTOS, JSON.parse(datos.productos));
      if (datos.chismografo) writeStorage(STORAGE_KEYS.CHISMOGRAFO, JSON.parse(datos.chismografo));
      if (datos.anuncios) writeStorage(STORAGE_KEYS.ANUNCIOS, JSON.parse(datos.anuncios));

      return { success: true, message: 'Respaldo de ClassPoint importado exitosamente.' };
    } catch (e: any) {
      return { success: false, message: `Error al procesar el archivo: ${e.message}` };
    }
  }

  // Users & Authentication
  static getUsers(): ClassPointUser[] {
    const users = readStorage<ClassPointUser[]>(STORAGE_KEYS.USERS, DEFAULT_USERS);
    const defaultCreator = DEFAULT_USERS.find((u) => u.rol === 'creadorOriginal');
    const normalized = users.map((u) => {
      if (
        u.usuario.toLowerCase() === 'creador' ||
        u.email?.toLowerCase() === 'ricardovazquezcaicedo@gmail.com'
      ) {
        return {
          ...u,
          rol: 'creadorOriginal' as const,
          email: u.email || 'ricardovazquezcaicedo@gmail.com',
        };
      }
      return u;
    });
    if (
      defaultCreator &&
      !normalized.some((u) => u.rol === 'creadorOriginal')
    ) {
      return [defaultCreator, ...normalized];
    }
    return normalized;
  }

  static authenticateUser(usuario: string, clave: string): ClassPointUser | null {
    const list = this.getUsers();
    const cleanUser = usuario.trim().toLowerCase();
    const found = list.find(
      (u) =>
        (u.usuario.toLowerCase() === cleanUser || u.email?.toLowerCase() === cleanUser) &&
        u.clave === clave.trim()
    );
    return found || null;
  }

  static registerUser(newUser: ClassPointUser): { success: boolean; message: string } {
    const list = this.getUsers();
    const cleanUser = newUser.usuario.trim().toLowerCase();
    if (list.some((u) => u.usuario.toLowerCase() === cleanUser)) {
      return { success: false, message: 'El nombre de usuario ya existe en ClassPoint.' };
    }
    list.push(newUser);
    writeStorage(STORAGE_KEYS.USERS, list);
    return { success: true, message: 'Usuario registrado exitosamente.' };
  }

  static addUser(newUser: ClassPointUser): void {
    this.registerUser(newUser);
  }

  static updateUser(
    currentUsuario: string,
    updates: Partial<ClassPointUser>
  ): { success: boolean; message: string; updatedUser?: ClassPointUser } {
    const list = this.getUsers();
    const cleanCurrent = currentUsuario.trim().toLowerCase();
    const index = list.findIndex(
      (u) => u.usuario.toLowerCase() === cleanCurrent || (u.email && u.email.toLowerCase() === cleanCurrent)
    );
    if (index === -1) {
      return { success: false, message: 'Usuario no encontrado en la base de datos.' };
    }

    // If changing username, check collision
    if (updates.usuario && updates.usuario.trim().toLowerCase() !== cleanCurrent) {
      const newU = updates.usuario.trim().toLowerCase();
      if (list.some((u, i) => i !== index && u.usuario.toLowerCase() === newU)) {
        return { success: false, message: 'El nuevo nombre de usuario ya está en uso por otra persona.' };
      }
    }

    const updated = { ...list[index], ...updates };
    list[index] = updated;
    writeStorage(STORAGE_KEYS.USERS, list);

    // If username changed, also migrate coins wallet key
    if (updates.usuario && updates.usuario.trim().toLowerCase() !== cleanCurrent) {
      const newU = updates.usuario.trim().toLowerCase();
      const wallet = readStorage<Record<string, number>>(STORAGE_KEYS.MONEDAS, {});
      if (wallet[cleanCurrent] !== undefined) {
        wallet[newU] = wallet[cleanCurrent];
        delete wallet[cleanCurrent];
        writeStorage(STORAGE_KEYS.MONEDAS, wallet);
      }
    }

    return { success: true, message: 'Perfil actualizado con éxito.', updatedUser: updated };
  }



  // BoscoIA Control Configuration (Professors & Directors)
  static getBoscoIAConfig(): BoscoIAControlConfig {
    return readStorage<BoscoIAControlConfig>(STORAGE_KEYS.BOSCOIA_CONFIG, DEFAULT_BOSCOIA_CONFIG);
  }

  static saveBoscoIAConfig(
    partial: Partial<BoscoIAControlConfig>,
    updatedBy?: string
  ): BoscoIAControlConfig {
    const current = this.getBoscoIAConfig();
    const updated: BoscoIAControlConfig = {
      ...current,
      ...partial,
      lastUpdatedBy: updatedBy || current.lastUpdatedBy,
      updatedAt: Date.now(),
    };
    writeStorage(STORAGE_KEYS.BOSCOIA_CONFIG, updated);
    return updated;
  }

  // Track and award Boscoints / ClassCoins for questions if enabled
  static recordAIQuestion(usuario: string): {
    coinsEarned: number;
    newTotal: number;
    allowed: boolean;
    reason?: string;
  } {
    const config = this.getBoscoIAConfig();

    // Check if AI is locked
    if (config.isLocked) {
      return {
        coinsEarned: 0,
        newTotal: this.getClassCoins(usuario),
        allowed: false,
        reason: config.lockedReason || 'BoscoIA está bloqueado por el docente.',
      };
    }

    // Check if coins are disabled
    if (!config.giveCoinsForQuestions) {
      return {
        coinsEarned: 0,
        newTotal: this.getClassCoins(usuario),
        allowed: true,
        reason: 'El docente ha pausado las recompensas de monedas.',
      };
    }

    // Check daily coins limit
    const today = new Date().toISOString().slice(0, 10);
    const dailyTracker = readStorage<Record<string, { date: string; coinsEarnedToday: number }>>(
      STORAGE_KEYS.DAILY_AI_COINS,
      {}
    );
    const userKey = usuario.toLowerCase();
    const userDaily = dailyTracker[userKey] && dailyTracker[userKey].date === today
      ? dailyTracker[userKey]
      : { date: today, coinsEarnedToday: 0 };

    if (userDaily.coinsEarnedToday >= config.maxCoinsDaily) {
      return {
        coinsEarned: 0,
        newTotal: this.getClassCoins(usuario),
        allowed: true,
        reason: `Has alcanzado el límite diario de ${config.maxCoinsDaily} Boscoints con la IA por hoy.`,
      };
    }

    const toAward = Math.min(config.coinsPerQuestion, config.maxCoinsDaily - userDaily.coinsEarnedToday);
    const newTotal = this.addClassCoins(usuario, toAward);

    userDaily.coinsEarnedToday += toAward;
    dailyTracker[userKey] = userDaily;
    writeStorage(STORAGE_KEYS.DAILY_AI_COINS, dailyTracker);

    return {
      coinsEarned: toAward,
      newTotal,
      allowed: true,
    };
  }
}
