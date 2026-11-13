import React, { useState, useEffect } from 'react';
import {
  BookOpen,
  GraduationCap,
  Sparkles,
  Download,
  Upload,
  Coins,
  CheckCircle2,
  Clock,
  Calendar,
  MessageSquare,
  Award,
  TrendingUp,
  FileText,
  Send,
  Users,
  Shield,
  ExternalLink,
  ChevronRight,
  AlertCircle,
  Lock,
  Unlock,
  Settings,
  HelpCircle,
  Plus,
  Trash2,
  Pencil,
  X,
  Maximize2,
  Minimize2,
  Sliders,
  DollarSign,
  Briefcase,
  Layers,
  School,
  Check,
  Sun,
  Moon,
  Trophy,
  Medal,
  FolderPlus,
  Search,
  Filter,
  Star,
  Flame,
  CheckCheck,
  UserCheck,
  Eye,
  EyeOff,
  Compass,
  FileSpreadsheet,
  Copy,
  Save,
} from 'lucide-react';
import {
  UserSession,
  ClassPointAula,
  ClassPointMateria,
  ClassPointCalificacion,
  ClassPointTarea,
  ClassPointEvidencia,
  ClassPointProducto,
  ClassPointChisme,
  ClassPointAnuncio,
  ClassPointPlanEstudio,
  BoscoIAControlConfig,
  ChatSession,
} from '../types';
import { ClassPointService, DEFAULT_BOSCOIA_CONFIG } from '../services/classPointStorage';
import { GrantBoscointsModal } from './GrantBoscointsModal';
import { CreatorMasterPanel } from './CreatorMasterPanel';
import { ProfileSettingsModal } from './ProfileSettingsModal';
import { GoogleSyncHubModal } from './GoogleSyncHubModal';
import { MicrosoftSyncHubModal } from './MicrosoftSyncHubModal';

interface ClassPointDashboardProps {
  userSession: UserSession;
  onLogout: () => void;
  // Handler to switch directly to BoscoIA chat view
  onOpenBoscoIA: (initialPrompt?: string) => void;
  // Render function or prop for BoscoIA tutor component
  renderBoscoIATutor: () => React.ReactNode;
  theme?: 'dark' | 'light';
  onToggleTheme?: () => void;
  onUpdateUserSession?: (session: UserSession) => void;
}

export const ClassPointDashboard: React.FC<ClassPointDashboardProps> = ({
  userSession,
  onLogout,
  onOpenBoscoIA,
  renderBoscoIATutor,
  theme = 'light',
  onToggleTheme,
  onUpdateUserSession,
}) => {
  const username = userSession.username || userSession.email.split('@')[0];
  const role = userSession.role || 'estudiante';
  const isTeacherOrAdmin = role === 'profesor' || role === 'administrador' || role === 'creadorOriginal';

  // Navigation tab state
  const [activeTab, setActiveTab] = useState<string>(
    role === 'creadorOriginal'
      ? 'master_colegios'
      : role === 'profesor'
      ? 'prof_aulas'
      : role === 'administrador'
      ? 'admin_centro'
      : 'inicio'
  );

  // Grant Boscoints Modal state
  const [isGrantModalOpen, setIsGrantModalOpen] = useState(false);
  const [preselectedStudent, setPreselectedStudent] = useState<{ usuario: string; nombre: string } | null>(null);

  // Data states
  const [aulas, setAulas] = useState<ClassPointAula[]>([]);
  const [materias, setMaterias] = useState<ClassPointMateria[]>([]);
  const [calificaciones, setCalificaciones] = useState<ClassPointCalificacion[]>([]);
  const [tareas, setTareas] = useState<ClassPointTarea[]>([]);
  const [evidencias, setEvidencias] = useState<ClassPointEvidencia[]>([]);
  const [productos, setProductos] = useState<ClassPointProducto[]>([]);
  const [chismes, setChismes] = useState<ClassPointChisme[]>([]);
  const [anuncios, setAnuncios] = useState<ClassPointAnuncio[]>([]);
  const [classCoins, setClassCoins] = useState<number>(120);

  // Avisos Institucionales State
  const [isNewAnuncioModalOpen, setIsNewAnuncioModalOpen] = useState(false);
  const [anuncioTitulo, setAnuncioTitulo] = useState('');
  const [anuncioTexto, setAnuncioTexto] = useState('');
  const [anuncioPrioridad, setAnuncioPrioridad] = useState<'normal' | 'importante' | 'urgente'>('normal');
  const [anuncioAula, setAnuncioAula] = useState('todas');
  const [anuncioToast, setAnuncioToast] = useState('');
  const [platformStats, setPlatformStats] = useState(() => ClassPointService.getPlatformStats());

  // BoscoIA Control Config State
  const [boscoConfig, setBoscoConfig] = useState<BoscoIAControlConfig>(() =>
    ClassPointService.getBoscoIAConfig()
  );
  const [configSavedToast, setConfigSavedToast] = useState(false);

  // Profile modal state
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);

  // Google Workspace Sync Modal State
  const [isGoogleSyncModalOpen, setIsGoogleSyncModalOpen] = useState(false);

  // Microsoft 365 Sync Modal State
  const [isMicrosoftSyncModalOpen, setIsMicrosoftSyncModalOpen] = useState(false);

  // Evidencias submission modal & state (Student)
  const [isNewEvidenceModalOpen, setIsNewEvidenceModalOpen] = useState(false);
  const [evidenciaTitulo, setEvidenciaTitulo] = useState('');
  const [evidenciaMateria, setEvidenciaMateria] = useState('Matemáticas y Álgebra');
  const [evidenciaProfesor, setEvidenciaProfesor] = useState('Lic. Andrés Caicedo');
  const [evidenciaDescripcion, setEvidenciaDescripcion] = useState('');
  const [evidenciaArchivoNombre, setEvidenciaArchivoNombre] = useState('evidencia_taller.pdf');
  const [evidenciaEnlace, setEvidenciaEnlace] = useState('');
  const [evidenciaToast, setEvidenciaToast] = useState('');

  // Personas / Directory state
  const [personasSearch, setPersonasSearch] = useState('');
  const [personasFilter, setPersonasFilter] = useState<'todos' | 'profesores' | 'directivos' | 'estudiantes'>('todos');

  // Teacher Review Evidencia Feedback & Points
  const [reviewFeedback, setReviewFeedback] = useState<{ [id: string]: string }>({});
  const [reviewCoins, setReviewCoins] = useState<{ [id: string]: number }>({});
  const [reviewSuccessMsg, setReviewSuccessMsg] = useState('');

  // UI States
  const [selectedMateria, setSelectedMateria] = useState<string>('Matemáticas y Álgebra');
  const [nuevoChismeTexto, setNuevoChismeTexto] = useState('');
  const [editingChismeId, setEditingChismeId] = useState<number | null>(null);
  const [editingChismeTexto, setEditingChismeTexto] = useState('');
  const [isBoscoIAFullScreen, setIsBoscoIAFullScreen] = useState(false);
  const [mercadoMensaje, setMercadoMensaje] = useState<string | null>(null);
  const [isFloatingTutorOpen, setIsFloatingTutorOpen] = useState(false);

  // Aulas Creation Modal & Join State
  const [isNewAulaModalOpen, setIsNewAulaModalOpen] = useState(false);
  const [nuevaAulaNombre, setNuevaAulaNombre] = useState('');
  const [nuevaAulaMateria, setNuevaAulaMateria] = useState('Matemáticas y Álgebra');
  const [nuevaAulaGrado, setNuevaAulaGrado] = useState('Grado 9°');
  const [nuevaAulaHorario, setNuevaAulaHorario] = useState('Lunes a Viernes · 8:00 - 10:00');
  const [nuevaAulaCodigo, setNuevaAulaCodigo] = useState('');
  const [nuevaAulaDesc, setNuevaAulaDesc] = useState('');
  const [aulaCreadaToast, setAulaCreadaToast] = useState('');

  // Student Join Aula State
  const [codigoUnirseAula, setCodigoUnirseAula] = useState('');
  const [joinAulaToast, setJoinAulaToast] = useState<{ success: boolean; message: string } | null>(null);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const [chismografoSalonSeleccionado, setChismografoSalonSeleccionado] = useState<string>('todos');

  // Planes de Estudio State & Modal
  const [planesEstudio, setPlanesEstudio] = useState<ClassPointPlanEstudio[]>([]);
  const [isNewPlanModalOpen, setIsNewPlanModalOpen] = useState(false);
  const [nuevoPlanTitulo, setNuevoPlanTitulo] = useState('');
  const [nuevoPlanMateria, setNuevoPlanMateria] = useState('Matemáticas y Álgebra');
  const [nuevoPlanGrado, setNuevoPlanGrado] = useState('Grado 9°');
  const [nuevoPlanPeriodo, setNuevoPlanPeriodo] = useState('Primer Periodo · 2026');
  const [nuevoPlanDesc, setNuevoPlanDesc] = useState('');
  const [nuevoPlanObjetivos, setNuevoPlanObjetivos] = useState('Comprender los conceptos fundamentales y resolver problemas paso a paso.\nAplicar procedimientos algebraicos con rigurosidad.\nDesarrollar autonomía con el apoyo socrático de BoscoIA.');
  const [nuevoPlanSemana1Tema, setNuevoPlanSemana1Tema] = useState('Unidad 1: Fundamentos y Conceptos Clave');
  const [nuevoPlanSemana1Desc, setNuevoPlanSemana1Desc] = useState('Introducción teórica, definiciones y talleres prácticos.');
  const [nuevoPlanSemana2Tema, setNuevoPlanSemana2Tema] = useState('Unidad 2: Aplicación y Resolución de Casos');
  const [nuevoPlanSemana2Desc, setNuevoPlanSemana2Desc] = useState('Desarrollo de problemas complejos, modelación y análisis.');
  const [nuevoPlanVisibleEstudiantes, setNuevoPlanVisibleEstudiantes] = useState(true);
  const [selectedPlanDetalle, setSelectedPlanDetalle] = useState<ClassPointPlanEstudio | null>(null);
  const [planToastMsg, setPlanToastMsg] = useState('');

  // Form states for teachers/admins
  const [nuevaTareaTitulo, setNuevaTareaTitulo] = useState('');
  const [nuevaTareaMateria, setNuevaTareaMateria] = useState('Matemáticas y Álgebra');
  const [nuevaTareaFecha, setNuevaTareaFecha] = useState('2026-11-20');
  const [nuevaTareaDesc, setNuevaTareaDesc] = useState('');
  const [nuevaTareaCoins, setNuevaTareaCoins] = useState(25);
  const [tareaCreadaMsg, setTareaCreadaMsg] = useState('');

  // New Calificacion form
  const [nuevaNotaEstudiante, setNuevaNotaEstudiante] = useState('ana');
  const [nuevaNotaMateria, setNuevaNotaMateria] = useState('Matemáticas y Álgebra');
  const [nuevaNotaTipo, setNuevaNotaTipo] = useState('Taller de Factorización');
  const [nuevaNotaValor, setNuevaNotaValor] = useState('4.8');
  const [nuevaNotaPeriodo, setNuevaNotaPeriodo] = useState('1');
  const [notaCreadaMsg, setNotaCreadaMsg] = useState('');

  const refreshAllData = () => {
    setAulas(ClassPointService.getAulas());
    setMaterias(ClassPointService.getMaterias());
    setCalificaciones(ClassPointService.getCalificaciones());
    setTareas(ClassPointService.getTareas(role === 'estudiante' ? username : undefined));
    setEvidencias(ClassPointService.getEvidencias(role === 'estudiante' ? username : undefined));
    setProductos(ClassPointService.getProductos());
    setChismes(ClassPointService.getChismes());
    setAnuncios(ClassPointService.getAnuncios());
    setClassCoins(ClassPointService.getClassCoins(username));
    setBoscoConfig(ClassPointService.getBoscoIAConfig());
    setPlanesEstudio(ClassPointService.getPlanesEstudio(username, role));
    setPlatformStats(ClassPointService.getPlatformStats());
  };

  useEffect(() => {
    refreshAllData();
  }, [username, role]);

  // Handlers for institutional announcements
  const handleCreateAnuncio = (e: React.FormEvent) => {
    e.preventDefault();
    if (!anuncioTitulo.trim() || !anuncioTexto.trim()) {
      setAnuncioToast('Por favor completa el título y el mensaje del comunicado.');
      setTimeout(() => setAnuncioToast(''), 3000);
      return;
    }

    const targetAula = aulas.find((a) => a.id === anuncioAula);
    const aulaNombre =
      anuncioAula === 'todas'
        ? 'Toda la Institución'
        : targetAula
        ? targetAula.nombre
        : 'Salón específico';

    ClassPointService.addAnuncio({
      titulo: anuncioTitulo.trim(),
      texto: anuncioTexto.trim(),
      prioridad: anuncioPrioridad,
      aulaId: anuncioAula,
      aulaNombre,
      autor: userSession.name || userSession.username || 'Docente / Director',
      autorUsuario: userSession.username,
      rol: role,
      institucion: userSession.institutionName || 'Colegio San Juan Bosco',
      fecha: 'Hoy, ' + new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    });

    setAnuncios(ClassPointService.getAnuncios());
    setPlatformStats(ClassPointService.getPlatformStats());
    setIsNewAnuncioModalOpen(false);
    setAnuncioTitulo('');
    setAnuncioTexto('');
    setAnuncioPrioridad('normal');
    setAnuncioAula('todas');
    setAnuncioToast('¡Aviso institucional publicado con éxito para toda la comunidad!');
    setTimeout(() => setAnuncioToast(''), 3500);
  };

  const handleDeleteAnuncio = (id: string) => {
    if (window.confirm('¿Seguro que deseas eliminar este comunicado institucional?')) {
      ClassPointService.deleteAnuncio(id);
      setAnuncios(ClassPointService.getAnuncios());
      setPlatformStats(ClassPointService.getPlatformStats());
      setAnuncioToast('Aviso eliminado correctamente.');
      setTimeout(() => setAnuncioToast(''), 3000);
    }
  };

  const studentMetrics = ClassPointService.getStudentMetrics(username);

  // Handlers for BoscoIA configuration changes (for teachers and directors)
  const handleToggleLock = () => {
    const updated = ClassPointService.saveBoscoIAConfig(
      { isLocked: !boscoConfig.isLocked },
      userSession.name
    );
    setBoscoConfig(updated);
    showConfigToast();
  };

  const handleUpdateBoscoConfig = (partial: Partial<BoscoIAControlConfig>) => {
    const updated = ClassPointService.saveBoscoIAConfig(partial, userSession.name);
    setBoscoConfig(updated);
    showConfigToast();
  };

  const showConfigToast = () => {
    setConfigSavedToast(true);
    setTimeout(() => setConfigSavedToast(false), 2500);
  };

  // Buy Reward from Store (Restricted strictly to students)
  const handleComprarProducto = (prod: ClassPointProducto) => {
    if (role !== 'estudiante') {
      setMercadoMensaje(
        'Solo los estudiantes pueden canjear Boscoints en la tienda. Los profesores, directores y el creador original solo pueden otorgar monedas a los estudiantes.'
      );
      setTimeout(() => setMercadoMensaje(null), 5000);
      return;
    }
    if (classCoins < prod.precio) {
      setMercadoMensaje(`Necesitas ${prod.precio} Boscoints (tienes ${classCoins}). Resuelve tareas o consultas para ganar más.`);
      return;
    }
    const success = ClassPointService.spendClassCoins(username, prod.precio, role);
    if (success) {
      setClassCoins(ClassPointService.getClassCoins(username));
      setMercadoMensaje(`¡Recompensa canjeada con éxito: "${prod.nombre}"!`);
      setTimeout(() => setMercadoMensaje(null), 4000);
    }
  };


  // Post Chisme / Anécdota
  const handlePublicarChisme = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nuevoChismeTexto.trim()) return;
    const targetAulaId =
      chismografoSalonSeleccionado === 'todos'
        ? aulas[0]?.id || 'aula-1'
        : chismografoSalonSeleccionado;
    const targetAula = aulas.find((a) => a.id === targetAulaId);

    ClassPointService.addChisme({
      tipo: 'aula',
      aulaId: targetAulaId,
      aulaNombre: targetAula ? targetAula.nombre : 'Aula General',
      texto: nuevoChismeTexto.trim(),
      autor: userSession.name,
      autorUsuario: username,
      destinatario: targetAula ? targetAula.nombre : 'todo el salón',
    });
    setNuevoChismeTexto('');
    setChismes(ClassPointService.getChismes());
  };

  const handleStartEditChisme = (chisme: ClassPointChisme) => {
    setEditingChismeId(chisme.id);
    setEditingChismeTexto(chisme.texto);
  };

  const handleSaveEditChisme = (id: number) => {
    if (!editingChismeTexto.trim()) return;
    ClassPointService.updateChisme(id, editingChismeTexto.trim());
    setEditingChismeId(null);
    setEditingChismeTexto('');
    setChismes(ClassPointService.getChismes());
  };

  const handleDeleteChisme = (id: number) => {
    ClassPointService.deleteChisme(id);
    setChismes(ClassPointService.getChismes());
  };

  // Handler for creating a new Aula (Teachers & Directors)
  const handleCrearAula = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nuevaAulaNombre.trim()) return;

    const codeGenerated = (
      nuevaAulaCodigo.trim() || `BC-${Math.random().toString(36).substring(2, 6).toUpperCase()}`
    ).toUpperCase();

    const nueva = ClassPointService.addAula({
      nombre: nuevaAulaNombre.trim(),
      materia: nuevaAulaMateria,
      grado: nuevaAulaGrado,
      horario: nuevaAulaHorario.trim(),
      profesor: userSession.name,
      profesorUsuario: username,
      codigo: codeGenerated,
      descripcion: nuevaAulaDesc.trim(),
      institucion: userSession.institutionName || 'Colegio San Juan Bosco',
      estudiantes: [],
    });

    setAulas(ClassPointService.getAulas());
    setAulaCreadaToast(`¡Aula "${nueva.nombre}" creada con éxito! Código para compartir: ${nueva.codigo}`);
    setIsNewAulaModalOpen(false);
    setNuevaAulaNombre('');
    setNuevaAulaCodigo('');
    setNuevaAulaDesc('');
    setTimeout(() => setAulaCreadaToast(''), 4500);
  };

  // Handler for student joining an Aula with code
  const handleUnirseAula = (e: React.FormEvent) => {
    e.preventDefault();
    if (!codigoUnirseAula.trim()) return;

    const res = ClassPointService.joinAula(codigoUnirseAula, username);
    setJoinAulaToast(res);
    if (res.success) {
      setAulas(ClassPointService.getAulas());
      setCodigoUnirseAula('');
    }
    setTimeout(() => setJoinAulaToast(null), 5000);
  };

  const handleEliminarAula = (aulaId: string) => {
    if (confirm('¿Estás seguro de que deseas eliminar esta aula?')) {
      ClassPointService.deleteAula(aulaId);
      setAulas(ClassPointService.getAulas());
    }
  };

  // Handler for creating a new Plan de Estudio (Teachers & Directors)
  const handleCrearPlanEstudio = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nuevoPlanTitulo.trim()) return;

    const objetivosList = nuevoPlanObjetivos
      .split('\n')
      .map((s) => s.trim())
      .filter(Boolean);

    const unidades = [
      {
        semana: 'Semanas 1 - 3',
        tema: nuevoPlanSemana1Tema.trim() || 'Fundamentos y Conceptos Clave',
        descripcion: nuevoPlanSemana1Desc.trim() || 'Desarrollo conceptual y ejercicios modelo.',
        competencias: 'Comprensión y razonamiento disciplinar',
        recursos: 'Talleres BoscoClass y tutoría BoscoIA',
      },
      {
        semana: 'Semanas 4 - 8',
        tema: nuevoPlanSemana2Tema.trim() || 'Aplicación Avanzada y Talleres',
        descripcion: nuevoPlanSemana2Desc.trim() || 'Resolución de problemas contextualizados.',
        competencias: 'Modelación y solución estructurada de problemas',
        recursos: 'Rúbricas de evaluación y diagramas',
      },
    ];

    const nuevo = ClassPointService.addPlanEstudio({
      titulo: nuevoPlanTitulo.trim(),
      materia: nuevoPlanMateria,
      grado: nuevoPlanGrado,
      periodo: nuevoPlanPeriodo,
      profesor: userSession.name,
      profesorUsuario: username,
      institucion: userSession.institutionName || 'Colegio San Juan Bosco',
      descripcion: nuevoPlanDesc.trim() || 'Plan curricular diseñado para el fortalecimiento académico integral.',
      objetivos: objetivosList.length > 0 ? objetivosList : ['Fortalecer el aprendizaje autónomo y guiado.'],
      unidades,
      visibleParaEstudiantes: nuevoPlanVisibleEstudiantes,
      aprobadoPorDirector: role === 'administrador' || role === 'creadorOriginal',
    });

    setPlanesEstudio(ClassPointService.getPlanesEstudio(username, role));
    setPlanToastMsg(
      `¡Plan de Estudio "${nuevo.titulo}" guardado! ${
        nuevo.visibleParaEstudiantes
          ? '👁️ Visible para estudiantes y directores.'
          : '🔒 Confidencial: oculto a estudiantes (siempre visible para directores).'
      }`
    );
    setIsNewPlanModalOpen(false);
    setNuevoPlanTitulo('');
    setNuevoPlanDesc('');
    setTimeout(() => setPlanToastMsg(''), 5000);
  };

  // Handler to toggle visibility for students
  const handleTogglePlanVisibilidad = (plan: ClassPointPlanEstudio) => {
    const nuevoEstado = !plan.visibleParaEstudiantes;
    ClassPointService.updatePlanEstudio(plan.id, { visibleParaEstudiantes: nuevoEstado });
    setPlanesEstudio(ClassPointService.getPlanesEstudio(username, role));
    setPlanToastMsg(
      `Visibilidad actualizada: Ahora está ${
        nuevoEstado ? 'visible para los estudiantes' : 'oculto a los estudiantes (visible siempre para directores)'
      }.`
    );
    setTimeout(() => setPlanToastMsg(''), 4000);
  };

  const handleEliminarPlan = (planId: string) => {
    if (confirm('¿Estás seguro de que deseas eliminar este plan de estudio?')) {
      ClassPointService.deletePlanEstudio(planId);
      setPlanesEstudio(ClassPointService.getPlanesEstudio(username, role));
    }
  };

  // Teacher Create Tarea
  const handleCrearTarea = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nuevaTareaTitulo.trim()) return;

    const nueva: ClassPointTarea = {
      id: `tarea-${Date.now()}`,
      usuario: 'estudiante',
      aulaId: 'aula-1',
      materia: nuevaTareaMateria,
      titulo: nuevaTareaTitulo.trim(),
      descripcion: nuevaTareaDesc.trim() || 'Desarrolla el taller con procedimientos paso a paso.',
      fecha: nuevaTareaFecha,
      estado: 'pendiente',
      puntosCoins: nuevaTareaCoins,
    };

    const current = ClassPointService.getTareas();
    current.unshift(nueva);
    ClassPointService.saveTareas(current);
    setTareas(current);
    setNuevaTareaTitulo('');
    setNuevaTareaDesc('');
    setTareaCreadaMsg('¡Tarea asignada con éxito al salón!');
    setTimeout(() => setTareaCreadaMsg(''), 3000);
  };

  // Teacher Create Calificacion
  const handleCrearCalificacion = (e: React.FormEvent) => {
    e.preventDefault();
    const nueva: ClassPointCalificacion = {
      id: `cal-${Date.now()}`,
      usuario: nuevaNotaEstudiante,
      nombre: nuevaNotaEstudiante === 'ana' ? 'Ana García' : 'Luis Pérez',
      materia: nuevaNotaMateria,
      aulaId: 'aula-1',
      tipo: nuevaNotaTipo.trim() || 'Evaluación',
      porcentaje: 25,
      nota: nuevaNotaValor,
      periodo: nuevaNotaPeriodo,
    };
    ClassPointService.addCalificacion(nueva);
    setCalificaciones(ClassPointService.getCalificaciones());
    setNotaCreadaMsg('¡Calificación registrada con éxito!');
    setTimeout(() => setNotaCreadaMsg(''), 3000);
  };

  // Student Create Evidencia
  const handleCrearEvidencia = (e: React.FormEvent) => {
    e.preventDefault();
    if (!evidenciaTitulo.trim()) return;

    ClassPointService.addEvidencia({
      usuario: username,
      estudianteNombre: userSession.name,
      titulo: evidenciaTitulo.trim(),
      materia: evidenciaMateria,
      profesor: evidenciaProfesor,
      descripcion: evidenciaDescripcion.trim(),
      archivoNombre: evidenciaArchivoNombre.trim() || 'evidencia_entregada.pdf',
      archivoTipo: 'documento',
      enlace: evidenciaEnlace.trim() || undefined,
      puntosCoins: 20,
    });

    setEvidencias(ClassPointService.getEvidencias(role === 'estudiante' ? username : undefined));
    setIsNewEvidenceModalOpen(false);
    setEvidenciaTitulo('');
    setEvidenciaDescripcion('');
    setEvidenciaEnlace('');
    setEvidenciaToast('¡Evidencia entregada con éxito! Tu docente recibirá la notificación para su revisión.');
    setTimeout(() => setEvidenciaToast(''), 4500);
  };

  // Teacher Review Evidencia: Approve & Award Coins
  const handleAprobarEvidencia = (id: string, stUsuario: string) => {
    const feedback = reviewFeedback[id] || 'Excelente trabajo didáctico. Cumple satisfactoriamente con la rúbrica y muestra dominio del tema.';
    const coinsAwarded = reviewCoins[id] !== undefined ? reviewCoins[id] : 20;

    ClassPointService.updateEvidencia(id, {
      estado: 'aprobada',
      retroalimentacion: feedback,
      puntosCoins: coinsAwarded,
    });

    if (coinsAwarded > 0) {
      ClassPointService.addClassCoins(stUsuario, coinsAwarded);
    }

    setEvidencias(ClassPointService.getEvidencias(role === 'estudiante' ? username : undefined));
    setReviewSuccessMsg(`¡Evidencia acreditada! Se otorgaron +${coinsAwarded} Boscoints al estudiante.`);
    setTimeout(() => setReviewSuccessMsg(''), 3500);
  };

  // Teacher Review Evidencia: Request Changes
  const handleSolicitarAjusteEvidencia = (id: string) => {
    const feedback = reviewFeedback[id] || 'Por favor revisa el desarrollo del paso final y adjunta tu reflexión con base en la guía de BoscoIA.';

    ClassPointService.updateEvidencia(id, {
      estado: 'requiere_ajustes',
      retroalimentacion: feedback,
    });

    setEvidencias(ClassPointService.getEvidencias(role === 'estudiante' ? username : undefined));
    setReviewSuccessMsg('Se ha enviado la solicitud de ajustes pedagógicos al estudiante.');
    setTimeout(() => setReviewSuccessMsg(''), 3500);
  };

  // Delete own pending evidence
  const handleEliminarEvidencia = (id: string) => {
    ClassPointService.deleteEvidencia(id);
    setEvidencias(ClassPointService.getEvidencias(role === 'estudiante' ? username : undefined));
  };

  return (
    <div
      className={`min-h-screen w-full flex flex-col font-sans transition-colors duration-200 ${
        theme === 'dark'
          ? 'dark bg-[#0a111a] text-slate-100 selection:bg-emerald-500/30'
          : 'bg-[#f4f8f8] text-[#203b50] selection:bg-[#50c6b3]/30'
      }`}
    >
      
      {/* Top Application Header */}
      <header className="sticky top-0 z-40 w-full bg-gradient-to-r from-[#7f1d1d] via-[#991b1b] to-[#dc2626] text-white shadow-md border-b-3 border-[#f59e0b]">
        <div className="max-w-7xl mx-auto px-4 py-2.5 flex items-center justify-between gap-4">
          
          {/* Brand Mark */}
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setActiveTab(role === 'profesor' ? 'prof_aulas' : role === 'administrador' ? 'admin_centro' : 'inicio')}
              className="flex items-center gap-2.5 text-left focus:outline-none"
            >
              <div className="w-10 h-10 rounded-xl bg-white border border-amber-300 p-1 shadow-md grid place-items-center shrink-0">
                <img
                  src="/assets/aistudio/image_c159dc3e.png"
                  alt="BoscoClass"
                  className="w-full h-full object-contain"
                />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="text-lg font-black tracking-tight leading-none text-white">
                    Bosco<span className="text-[#fbbf24]">Class</span>
                  </span>
                  <span className="px-1.5 py-0.2 rounded-full text-[9px] font-extrabold bg-[#450a0a] text-amber-300 border border-amber-400/40">
                    + BoscoIA
                  </span>
                </div>
                <span className="text-[10px] text-white/80 block font-medium">
                  {userSession.institutionName || 'Colegio San Juan Bosco · Tuluá'}
                </span>
              </div>
            </button>
          </div>

          {/* User Profile & ClassCoins Pill / Otorgar Action */}
          <div className="flex items-center gap-2.5">
            {/* If student: view wallet balance */}
            {role === 'estudiante' ? (
              <div
                className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#450a0a]/80 border border-amber-400/50 text-xs font-bold text-amber-300 shadow-xs cursor-pointer hover:bg-[#450a0a] transition-colors"
                onClick={() => setActiveTab('mercado')}
                title="Boscoints acumulados"
              >
                <span className="w-4 h-4 rounded-full bg-gradient-to-tr from-amber-400 to-yellow-300 text-[#78350f] text-[10px] font-black grid place-items-center">
                  $
                </span>
                <span>{classCoins} BC</span>
              </div>
            ) : (
              /* If teacher, director, or creator: prominent Otorgar button */
              <button
                type="button"
                onClick={() => {
                  setPreselectedStudent(null);
                  setIsGrantModalOpen(true);
                }}
                className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-gradient-to-r from-amber-400 to-yellow-300 hover:from-amber-300 hover:to-yellow-200 text-slate-950 text-xs font-black shadow-md transition-all active:scale-95"
                title="Otorgar Boscoints a estudiantes"
              >
                <Coins className="w-3.5 h-3.5" />
                <span>+ Otorgar Boscoints</span>
              </button>
            )}

            {/* Role Badge */}
            <span className="hidden sm:inline-flex px-2 py-0.5 rounded-lg text-[10px] font-bold uppercase tracking-wider bg-white/10 text-white border border-white/20">
              {role === 'creadorOriginal'
                ? 'Creador Original'
                : role === 'administrador'
                ? 'Director'
                : role === 'profesor'
                ? 'Profesor'
                : 'Estudiante'}
            </span>

            {/* Theme Toggle Button */}
            {onToggleTheme && (
              <button
                type="button"
                onClick={onToggleTheme}
                className="p-1.5 rounded-xl bg-black/20 hover:bg-black/30 border border-white/20 text-white transition-colors"
                title={theme === 'dark' ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro'}
              >
                {theme === 'dark' ? (
                  <Sun className="w-3.5 h-3.5 text-amber-300" />
                ) : (
                  <Moon className="w-3.5 h-3.5 text-white" />
                )}
              </button>
            )}

            {/* Google Workspace Sync Button */}
            <button
              type="button"
              onClick={() => setIsGoogleSyncModalOpen(true)}
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-white/10 hover:bg-white/20 border border-white/25 text-white text-xs font-bold transition-all shadow-xs cursor-pointer"
              title="Sincronizar con Google Workspace (Classroom, Calendar, Drive, Tasks)"
            >
              <svg viewBox="0 0 48 48" className="w-3.5 h-3.5 shrink-0">
                <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z" />
                <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z" />
                <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z" />
                <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z" />
              </svg>
              <span className="hidden sm:inline">Google Sync</span>
            </button>

            {/* Microsoft 365 Sync Button */}
            <button
              type="button"
              onClick={() => setIsMicrosoftSyncModalOpen(true)}
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-white/10 hover:bg-white/20 border border-white/25 text-white text-xs font-bold transition-all shadow-xs cursor-pointer"
              title="Sincronizar con Microsoft 365 (Teams, Outlook, OneDrive, To Do)"
            >
              <div className="w-3.5 h-3.5 grid grid-cols-2 gap-0.5 shrink-0">
                <div className="bg-[#f25022]" />
                <div className="bg-[#7fba00]" />
                <div className="bg-[#00a4ef]" />
                <div className="bg-[#ffb900]" />
              </div>
              <span className="hidden sm:inline">Microsoft Sync</span>
            </button>

            {/* Settings / Mi Perfil Button */}
            <button
              type="button"
              onClick={() => setIsProfileModalOpen(true)}
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-black/20 hover:bg-black/30 border border-white/20 text-white text-xs font-bold transition-colors"
              title="Configurar Perfil, Usuario y Contraseña"
            >
              <Settings className="w-3.5 h-3.5 text-[#50c6b3]" />
              <span className="hidden lg:inline">Mi Perfil</span>
            </button>

            {/* Interactive User Pill */}
            <button
              type="button"
              onClick={() => setIsProfileModalOpen(true)}
              className="flex items-center gap-2 pl-1 border-l border-white/20 hover:opacity-90 transition-opacity"
              title="Haz clic para ver y editar tu perfil"
            >
              <img
                src={
                  userSession.avatar ||
                  `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(
                    userSession.name
                  )}&backgroundColor=176b87`
                }
                alt={userSession.name}
                className="w-7 h-7 rounded-full border border-white/50 bg-[#d9f5ef] object-cover"
              />
              <span className="text-xs font-bold text-white hidden md:inline truncate max-w-[120px]">
                {userSession.name}
              </span>
            </button>

            {/* Logout button */}
            <button
              type="button"
              onClick={onLogout}
              className="text-xs px-2.5 py-1 rounded-xl bg-black/20 hover:bg-black/30 border border-white/20 text-white/90 transition-colors"
              title="Cerrar sesión"
            >
              Salir
            </button>
          </div>
        </div>

        {/* Dynamic Role Navigation Bar */}
        <div className="w-full bg-[#450a0a] border-t border-amber-900/50 px-4 py-1.5 overflow-x-auto">
          <div className="max-w-7xl mx-auto flex items-center gap-1.5 min-w-max text-xs font-semibold">
            
            {/* Student Navigation */}
            {role === 'estudiante' && (
              <>
                <button
                  type="button"
                  onClick={() => setActiveTab('inicio')}
                  className={`px-3 py-1.5 rounded-lg transition-all ${
                    activeTab === 'inicio' ? 'bg-gradient-to-r from-red-600 to-rose-600 text-white font-bold shadow-md border border-rose-400/40' : 'text-amber-100/80 hover:bg-white/10 hover:text-white'
                  }`}
                >
                  Inicio
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('materias')}
                  className={`px-3 py-1.5 rounded-lg transition-all ${
                    activeTab === 'materias' ? 'bg-gradient-to-r from-red-600 to-rose-600 text-white font-bold shadow-md border border-rose-400/40' : 'text-amber-100/80 hover:bg-white/10 hover:text-white'
                  }`}
                >
                  Materias
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('aulas')}
                  className={`px-3 py-1.5 rounded-lg transition-all ${
                    activeTab === 'aulas' ? 'bg-gradient-to-r from-red-600 to-rose-600 text-white font-bold shadow-md border border-rose-400/40' : 'text-amber-100/80 hover:bg-white/10 hover:text-white'
                  }`}
                >
                  Aulas
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('estudiante_planes')}
                  className={`px-3 py-1.5 rounded-lg transition-all ${
                    activeTab === 'estudiante_planes' ? 'bg-gradient-to-r from-red-600 to-rose-600 text-white font-bold shadow-md border border-rose-400/40' : 'text-amber-100/80 hover:bg-white/10 hover:text-white'
                  }`}
                >
                  📚 Planes de Estudio
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('tareas')}
                  className={`px-3 py-1.5 rounded-lg transition-all ${
                    activeTab === 'tareas' ? 'bg-gradient-to-r from-red-600 to-rose-600 text-white font-bold shadow-md border border-rose-400/40' : 'text-amber-100/80 hover:bg-white/10 hover:text-white'
                  }`}
                >
                  Tareas y Entregas
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('calendario')}
                  className={`px-3 py-1.5 rounded-lg transition-all ${
                    activeTab === 'calendario' ? 'bg-gradient-to-r from-red-600 to-rose-600 text-white font-bold shadow-md border border-rose-400/40' : 'text-amber-100/80 hover:bg-white/10 hover:text-white'
                  }`}
                >
                  Calendario
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('evidencias')}
                  className={`px-3 py-1.5 rounded-lg transition-all ${
                    activeTab === 'evidencias' ? 'bg-gradient-to-r from-red-600 to-rose-600 text-white font-bold shadow-md border border-rose-400/40' : 'text-amber-100/80 hover:bg-white/10 hover:text-white'
                  }`}
                >
                  Evidencias
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('logros')}
                  className={`px-3 py-1.5 rounded-lg transition-all ${
                    activeTab === 'logros' ? 'bg-gradient-to-r from-red-600 to-rose-600 text-white font-bold shadow-md border border-rose-400/40' : 'text-amber-100/80 hover:bg-white/10 hover:text-white'
                  }`}
                >
                  Logros e Insignias
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('mercado')}
                  className={`px-3 py-1.5 rounded-lg transition-all ${
                    activeTab === 'mercado' ? 'bg-gradient-to-r from-red-600 to-rose-600 text-white font-bold shadow-md border border-rose-400/40' : 'text-amber-100/80 hover:bg-white/10 hover:text-white'
                  }`}
                >
                  Mercado Boscoints
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('ranking')}
                  className={`px-3 py-1.5 rounded-lg transition-all ${
                    activeTab === 'ranking' ? 'bg-gradient-to-r from-red-600 to-rose-600 text-white font-bold shadow-md border border-rose-400/40' : 'text-amber-100/80 hover:bg-white/10 hover:text-white'
                  }`}
                >
                  Ranking
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('chismografo')}
                  className={`px-3 py-1.5 rounded-lg transition-all ${
                    activeTab === 'chismografo' ? 'bg-gradient-to-r from-red-600 to-rose-600 text-white font-bold shadow-md border border-rose-400/40' : 'text-amber-100/80 hover:bg-white/10 hover:text-white'
                  }`}
                >
                  🗣️ El Chismógrafo
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('avisos')}
                  className={`px-3 py-1.5 rounded-lg transition-all ${
                    activeTab === 'avisos' ? 'bg-gradient-to-r from-red-600 to-rose-600 text-white font-bold shadow-md border border-rose-400/40' : 'text-amber-100/80 hover:bg-white/10 hover:text-white'
                  }`}
                >
                  📢 Avisos {anuncios.length > 0 && `(${anuncios.length})`}
                </button>

                {/* Direct BoscoIA Tab */}
                <button
                  type="button"
                  onClick={() => setActiveTab('boscoia')}
                  className={`ml-2 px-3 py-1.5 rounded-lg font-bold flex items-center gap-1.5 transition-all ${
                    activeTab === 'boscoia'
                      ? 'bg-amber-400 text-slate-950 font-black shadow-md border border-amber-300'
                      : 'bg-red-700/60 hover:bg-red-600 text-amber-200 border border-amber-500/40'
                  }`}
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>BoscoIA Tutor</span>
                  {boscoConfig.isLocked && <Lock className="w-3 h-3 text-rose-300" />}
                </button>
              </>
            )}

            {/* Teacher Navigation */}
            {role === 'profesor' && (
              <>
                <button
                  type="button"
                  onClick={() => setActiveTab('prof_aulas')}
                  className={`px-3 py-1.5 rounded-lg transition-all ${
                    activeTab === 'prof_aulas' ? 'bg-gradient-to-r from-red-600 to-rose-600 text-white font-bold shadow-md border border-rose-400/40' : 'text-amber-100/80 hover:bg-white/10 hover:text-white'
                  }`}
                >
                  Aulas y Salones
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('prof_planes')}
                  className={`px-3 py-1.5 rounded-lg transition-all ${
                    activeTab === 'prof_planes' ? 'bg-gradient-to-r from-red-600 to-rose-600 text-white font-bold shadow-md border border-rose-400/40' : 'text-amber-100/80 hover:bg-white/10 hover:text-white'
                  }`}
                >
                  📚 Planes de Estudio
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('prof_calificaciones')}
                  className={`px-3 py-1.5 rounded-lg transition-all ${
                    activeTab === 'prof_calificaciones' ? 'bg-gradient-to-r from-red-600 to-rose-600 text-white font-bold shadow-md border border-rose-400/40' : 'text-amber-100/80 hover:bg-white/10 hover:text-white'
                  }`}
                >
                  Calificaciones
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('prof_tareas')}
                  className={`px-3 py-1.5 rounded-lg transition-all ${
                    activeTab === 'prof_tareas' ? 'bg-gradient-to-r from-red-600 to-rose-600 text-white font-bold shadow-md border border-rose-400/40' : 'text-amber-100/80 hover:bg-white/10 hover:text-white'
                  }`}
                >
                  Asignar Tareas
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('prof_evidencias')}
                  className={`px-3 py-1.5 rounded-lg transition-all ${
                    activeTab === 'prof_evidencias' ? 'bg-gradient-to-r from-red-600 to-rose-600 text-white font-bold shadow-md border border-rose-400/40' : 'text-amber-100/80 hover:bg-white/10 hover:text-white'
                  }`}
                >
                  Revisar Evidencias
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('admin_personas')}
                  className={`px-3 py-1.5 rounded-lg transition-all ${
                    activeTab === 'admin_personas' ? 'bg-gradient-to-r from-red-600 to-rose-600 text-white font-bold shadow-md border border-rose-400/40' : 'text-amber-100/80 hover:bg-white/10 hover:text-white'
                  }`}
                >
                  Directorio
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('ranking')}
                  className={`px-3 py-1.5 rounded-lg transition-all ${
                    activeTab === 'ranking' ? 'bg-gradient-to-r from-red-600 to-rose-600 text-white font-bold shadow-md border border-rose-400/40' : 'text-amber-100/80 hover:bg-white/10 hover:text-white'
                  }`}
                >
                  Ranking
                </button>

                {/* El Chismógrafo for Teachers */}
                <button
                  type="button"
                  onClick={() => setActiveTab('chismografo')}
                  className={`px-3 py-1.5 rounded-lg transition-all ${
                    activeTab === 'chismografo' ? 'bg-gradient-to-r from-red-600 to-rose-600 text-white font-bold shadow-md border border-rose-400/40' : 'text-amber-100/80 hover:bg-white/10 hover:text-white'
                  }`}
                >
                  🗣️ El Chismógrafo
                </button>

                {/* Avisos Institucionales for Teachers */}
                <button
                  type="button"
                  onClick={() => setActiveTab('avisos')}
                  className={`px-3 py-1.5 rounded-lg transition-all ${
                    activeTab === 'avisos' ? 'bg-gradient-to-r from-red-600 to-rose-600 text-white font-bold shadow-md border border-rose-400/40' : 'text-amber-100/80 hover:bg-white/10 hover:text-white'
                  }`}
                >
                  📢 Avisos {anuncios.length > 0 && `(${anuncios.length})`}
                </button>

                {/* TEACHER BOSCOIA CONTROL PANEL */}
                <button
                  type="button"
                  onClick={() => setActiveTab('config_boscoia')}
                  className={`ml-2 px-3 py-1.5 rounded-lg font-bold flex items-center gap-1.5 transition-all ${
                    activeTab === 'config_boscoia'
                      ? 'bg-amber-400 text-slate-950 shadow-md font-extrabold border border-amber-300'
                      : 'bg-red-800/80 hover:bg-red-700 text-amber-200 border border-amber-400/40'
                  }`}
                >
                  <Sliders className="w-3.5 h-3.5" />
                  <span>Configuración de BoscoIA</span>
                  {boscoConfig.isLocked ? (
                    <span className="px-1.5 py-0.2 rounded-full bg-rose-600 text-white text-[9px] font-black">
                      BLOQUEADO
                    </span>
                  ) : (
                    <span className="px-1.5 py-0.2 rounded-full bg-emerald-600 text-white text-[9px] font-black">
                      ACTIVO
                    </span>
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => setActiveTab('boscoia')}
                  className={`px-3 py-1.5 rounded-lg flex items-center gap-1 transition-all ${
                    activeTab === 'boscoia' ? 'bg-gradient-to-r from-red-600 to-rose-600 text-white font-bold' : 'text-amber-100/80 hover:bg-white/10'
                  }`}
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Probar BoscoIA</span>
                </button>
              </>
            )}

            {/* Creador Original Dedicated Navigation */}
            {role === 'creadorOriginal' && (
              <>
                <button
                  type="button"
                  onClick={() => setActiveTab('master_colegios')}
                  className={`px-3 py-1.5 rounded-lg transition-all ${
                    activeTab === 'master_colegios'
                      ? 'bg-gradient-to-r from-amber-400 to-yellow-300 text-slate-950 font-black shadow-xs'
                      : 'text-amber-100 hover:bg-white/10'
                  }`}
                >
                  🏫 Red Multicolegio
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('admin_centro')}
                  className={`px-3 py-1.5 rounded-lg transition-all ${
                    activeTab === 'admin_centro'
                      ? 'bg-gradient-to-r from-red-600 to-rose-600 text-white font-bold shadow-md border border-rose-400/40'
                      : 'text-amber-100 hover:bg-white/10'
                  }`}
                >
                  🏫 Aulas y Salones
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('admin_planes')}
                  className={`px-3 py-1.5 rounded-lg transition-all ${
                    activeTab === 'admin_planes'
                      ? 'bg-gradient-to-r from-red-600 to-rose-600 text-white font-bold shadow-md border border-rose-400/40'
                      : 'text-amber-100 hover:bg-white/10'
                  }`}
                >
                  📚 Planes Curriculares
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setPreselectedStudent(null);
                    setIsGrantModalOpen(true);
                  }}
                  className="px-3 py-1.5 rounded-lg bg-amber-400 hover:bg-amber-300 text-slate-950 font-black flex items-center gap-1.5 transition-all shadow-xs"
                >
                  <Coins className="w-3.5 h-3.5" />
                  <span>Otorgar Boscoints</span>
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('chismografo')}
                  className={`px-3 py-1.5 rounded-lg transition-all ${
                    activeTab === 'chismografo' ? 'bg-gradient-to-r from-red-600 to-rose-600 text-white font-bold shadow-md border border-rose-400/40' : 'text-amber-100/80 hover:bg-white/10 hover:text-white'
                  }`}
                >
                  🗣️ El Chismógrafo
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('avisos')}
                  className={`px-3 py-1.5 rounded-lg transition-all ${
                    activeTab === 'avisos' ? 'bg-gradient-to-r from-red-600 to-rose-600 text-white font-bold shadow-md border border-rose-400/40' : 'text-amber-100/80 hover:bg-white/10 hover:text-white'
                  }`}
                >
                  📢 Avisos {anuncios.length > 0 && `(${anuncios.length})`}
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('config_boscoia')}
                  className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 ${
                    activeTab === 'config_boscoia'
                      ? 'bg-gradient-to-r from-red-600 to-rose-600 text-white font-bold shadow-xs'
                      : 'text-amber-100/80 hover:bg-white/10'
                  }`}
                >
                  <Sliders className="w-3.5 h-3.5" />
                  <span>Control Global BoscoIA</span>
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('mercado')}
                  className={`px-3 py-1.5 rounded-lg transition-all ${
                    activeTab === 'mercado' ? 'bg-gradient-to-r from-red-600 to-rose-600 text-white font-bold shadow-xs' : 'text-amber-100/80 hover:bg-white/10'
                  }`}
                >
                  Catálogo de Premios
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('boscoia')}
                  className={`px-3 py-1.5 rounded-lg flex items-center gap-1 transition-all ${
                    activeTab === 'boscoia' ? 'bg-gradient-to-r from-red-600 to-rose-600 text-white font-bold' : 'text-amber-100/80 hover:bg-white/10'
                  }`}
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Probar BoscoIA Tutor</span>
                </button>
              </>
            )}

            {/* Director / Administrator Navigation */}
            {role === 'administrador' && (
              <>
                <button
                  type="button"
                  onClick={() => setActiveTab('admin_centro')}
                  className={`px-3 py-1.5 rounded-lg transition-all ${
                    activeTab === 'admin_centro' ? 'bg-gradient-to-r from-red-600 to-rose-600 text-white font-bold shadow-md border border-rose-400/40' : 'text-amber-100/80 hover:bg-white/10 hover:text-white'
                  }`}
                >
                  Aulas y Salones
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('admin_planes')}
                  className={`px-3 py-1.5 rounded-lg transition-all ${
                    activeTab === 'admin_planes' ? 'bg-gradient-to-r from-red-600 to-rose-600 text-white font-bold shadow-md border border-rose-400/40' : 'text-amber-100/80 hover:bg-white/10 hover:text-white'
                  }`}
                >
                  📚 Supervisar Planes
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('admin_personas')}
                  className={`px-3 py-1.5 rounded-lg transition-all ${
                    activeTab === 'admin_personas' ? 'bg-gradient-to-r from-red-600 to-rose-600 text-white font-bold shadow-md border border-rose-400/40' : 'text-amber-100/80 hover:bg-white/10 hover:text-white'
                  }`}
                >
                  Personas y Profesores
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('avisos')}
                  className={`px-3 py-1.5 rounded-lg transition-all ${
                    activeTab === 'avisos' ? 'bg-gradient-to-r from-red-600 to-rose-600 text-white font-bold shadow-md border border-rose-400/40' : 'text-amber-100/80 hover:bg-white/10 hover:text-white'
                  }`}
                >
                  📢 Avisos {anuncios.length > 0 && `(${anuncios.length})`}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setPreselectedStudent(null);
                    setIsGrantModalOpen(true);
                  }}
                  className="px-3 py-1.5 rounded-lg bg-amber-400 hover:bg-amber-300 text-slate-950 font-black flex items-center gap-1.5 transition-all shadow-xs"
                >
                  <Coins className="w-3.5 h-3.5" />
                  <span>+ Otorgar Boscoints</span>
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('ranking')}
                  className={`px-3 py-1.5 rounded-lg transition-all ${
                    activeTab === 'ranking' ? 'bg-gradient-to-r from-red-600 to-rose-600 text-white font-bold shadow-md border border-rose-400/40' : 'text-amber-100/80 hover:bg-white/10 hover:text-white'
                  }`}
                >
                  Ranking Escolar
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('prof_evidencias')}
                  className={`px-3 py-1.5 rounded-lg transition-all ${
                    activeTab === 'prof_evidencias' ? 'bg-gradient-to-r from-red-600 to-rose-600 text-white font-bold shadow-md border border-rose-400/40' : 'text-amber-100/80 hover:bg-white/10 hover:text-white'
                  }`}
                >
                  Auditar Evidencias
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('mercado')}
                  className={`px-3 py-1.5 rounded-lg transition-all ${
                    activeTab === 'mercado' ? 'bg-gradient-to-r from-red-600 to-rose-600 text-white font-bold shadow-md border border-rose-400/40' : 'text-amber-100/80 hover:bg-white/10 hover:text-white'
                  }`}
                >
                  Administrar Mercado
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('chismografo')}
                  className={`px-3 py-1.5 rounded-lg transition-all ${
                    activeTab === 'chismografo' ? 'bg-gradient-to-r from-red-600 to-rose-600 text-white font-bold shadow-md border border-rose-400/40' : 'text-amber-100/80 hover:bg-white/10 hover:text-white'
                  }`}
                >
                  🗣️ El Chismógrafo
                </button>

                {/* DIRECTOR BOSCOIA CONTROL PANEL */}
                <button
                  type="button"
                  onClick={() => setActiveTab('config_boscoia')}
                  className={`ml-2 px-3 py-1.5 rounded-lg font-bold flex items-center gap-1.5 transition-all ${
                    activeTab === 'config_boscoia'
                      ? 'bg-amber-400 text-slate-950 shadow-md font-extrabold border border-amber-300'
                      : 'bg-red-800/80 hover:bg-red-700 text-amber-200 border border-amber-400/40'
                  }`}
                >
                  <Sliders className="w-3.5 h-3.5" />
                  <span>Control Institucional de BoscoIA</span>
                  {boscoConfig.isLocked ? (
                    <span className="px-1.5 py-0.2 rounded-full bg-rose-600 text-white text-[9px] font-black">
                      BLOQUEADO
                    </span>
                  ) : (
                    <span className="px-1.5 py-0.2 rounded-full bg-emerald-600 text-white text-[9px] font-black">
                      ACTIVO
                    </span>
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => setActiveTab('boscoia')}
                  className={`px-3 py-1.5 rounded-lg flex items-center gap-1 transition-all ${
                    activeTab === 'boscoia' ? 'bg-gradient-to-r from-red-600 to-rose-600 text-white font-bold' : 'text-amber-100/80 hover:bg-white/10'
                  }`}
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Abrir Tutor BoscoIA</span>
                </button>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 space-y-6">

        {/* ======================================================== */}
        {/* PANEL MAESTRO CREADOR ORIGINAL (MULTI-ESCUELA Y DIRECTORES) */}
        {/* ======================================================== */}
        {(activeTab === 'master_colegios' || activeTab === 'master_directores') && (
          <CreatorMasterPanel
            onOpenGrantModal={(st) => {
              setPreselectedStudent(st || null);
              setIsGrantModalOpen(true);
            }}
            onOpenBoscoIA={() => setActiveTab('boscoia')}
          />
        )}


        {/* ======================================================== */}
        {/* PANEL DE CONFIGURACIÓN DE BOSCOIA (PROFESORES Y DIRECTORES) */}
        {/* ======================================================== */}
        {activeTab === 'config_boscoia' && (
          <div className="space-y-6 animate-in fade-in duration-200">
            {/* Header banner */}
            <div className="p-6 rounded-3xl bg-gradient-to-r from-[#7f1d1d] via-[#991b1b] to-[#dc2626] text-white shadow-xl border border-amber-500/40 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="px-2.5 py-0.5 rounded-full bg-amber-400 text-slate-900 font-extrabold text-[10px] uppercase tracking-wider">
                    Panel Docente y Directivo
                  </span>
                  <span className="text-xs text-white/70">
                    Último cambio por: {boscoConfig.lastUpdatedBy || 'Docente Titular'}
                  </span>
                </div>
                <h2 className="text-2xl font-black tracking-tight">
                  Configuración y Bloqueo de BoscoIA
                </h2>
                <p className="text-xs text-white/80 max-w-2xl mt-1">
                  Controla la disponibilidad del tutor inteligente en tus clases, desactívalo durante evaluaciones o exámenes, y define si los alumnos ganan Boscoints por sus consultas.
                </p>
              </div>

              {configSavedToast && (
                <div className="px-4 py-2 rounded-2xl bg-emerald-500 text-white font-bold text-xs flex items-center gap-2 shadow-lg animate-bounce">
                  <CheckCircle2 className="w-4 h-4" />
                  ¡Configuración guardada y activa!
                </div>
              )}
            </div>

            {/* Master Control Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              {/* Card 1: Bloqueo Maestro de la IA */}
              <div className="p-6 rounded-3xl bg-white border border-[#cfe1e6] shadow-sm space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-12 h-12 rounded-2xl grid place-items-center text-white font-black shadow-md ${
                        boscoConfig.isLocked ? 'bg-rose-600' : 'bg-emerald-600'
                      }`}
                    >
                      {boscoConfig.isLocked ? <Lock className="w-6 h-6" /> : <Unlock className="w-6 h-6" />}
                    </div>
                    <div>
                      <h3 className="text-base font-extrabold text-[#12344d]">
                        Estado del Tutor BoscoIA
                      </h3>
                      <p className="text-xs text-slate-500">
                        {boscoConfig.isLocked
                          ? 'BoscoIA está bloqueado para los alumnos'
                          : 'BoscoIA está activo y respondiendo consultas'}
                      </p>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={handleToggleLock}
                    className={`px-4 py-2.5 rounded-xl font-bold text-xs shadow-sm transition-all ${
                      boscoConfig.isLocked
                        ? 'bg-emerald-600 hover:bg-emerald-500 text-white'
                        : 'bg-rose-600 hover:bg-rose-500 text-white'
                    }`}
                  >
                    {boscoConfig.isLocked ? 'Desbloquear BoscoIA' : 'Bloquear BoscoIA'}
                  </button>
                </div>

                {/* Lock reason details */}
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
                  <label className="block text-xs font-bold text-[#12344d]">
                    Motivo de bloqueo visible para los estudiantes:
                  </label>
                  <select
                    value={boscoConfig.lockedReason}
                    onChange={(e) => handleUpdateBoscoConfig({ lockedReason: e.target.value })}
                    className="w-full p-2.5 text-xs rounded-xl border border-slate-300 bg-white"
                  >
                    <option value="Evaluación o examen activo en el salón">
                      📝 Evaluación o examen activo en el salón (Modo Examen)
                    </option>
                    <option value="Trabajo autónomo sin asistencia de IA">
                      ✏️ Trabajo autónomo sin asistencia de IA
                    </option>
                    <option value="Horario de clase magistral presencial">
                      👨‍🏫 Horario de clase magistral presencial
                    </option>
                    <option value="BoscoIA temporalmente pausado por la coordinación académica">
                      🏛️ Pausado por la coordinación académica
                    </option>
                  </select>

                  <div className="p-2.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-[11px]">
                    <strong>Aviso para alumnos:</strong> Cuando BoscoIA esté bloqueado, los estudiantes verán una pantalla de protección con el motivo indicado y la caja de texto estará deshabilitada.
                  </div>
                </div>
              </div>

              {/* Card 2: Economía de Boscoints (BC) */}
              <div className="p-6 rounded-3xl bg-white border border-[#cfe1e6] shadow-sm space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-amber-500 text-white grid place-items-center font-black shadow-md">
                    <Coins className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-base font-extrabold text-[#12344d]">
                      Economía de Boscoints (BC)
                    </h3>
                    <p className="text-xs text-slate-500">
                      Configura si los alumnos reciben monedas por realizar preguntas didácticas
                    </p>
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-4">
                  {/* Switch Give Coins */}
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-xs font-bold text-[#12344d] block">
                        Dar Boscoints por preguntas
                      </span>
                      <span className="text-[11px] text-slate-500">
                        Incentiva a los alumnos otorgando monedas con cada consulta
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() =>
                        handleUpdateBoscoConfig({
                          giveCoinsForQuestions: !boscoConfig.giveCoinsForQuestions,
                        })
                      }
                      className={`w-12 h-6 flex items-center rounded-full p-1 transition-colors ${
                        boscoConfig.giveCoinsForQuestions ? 'bg-emerald-600' : 'bg-slate-300'
                      }`}
                    >
                      <div
                        className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform ${
                          boscoConfig.giveCoinsForQuestions ? 'translate-x-6' : 'translate-x-0'
                        }`}
                      />
                    </button>
                  </div>

                  {/* Quantity inputs - Locked for teachers and directors */}
                  {role !== 'creadorOriginal' ? (
                    <div className="p-3.5 rounded-2xl bg-amber-50 border border-amber-200 text-amber-950 text-xs space-y-2">
                      <div className="flex items-center gap-2 font-bold text-amber-900">
                        <Lock className="w-4 h-4 text-amber-700 shrink-0" />
                        <span>Valor de las ayudas protegido institucionalmente</span>
                      </div>
                      <p className="text-[11px] text-amber-800 leading-relaxed">
                        Los profesores y directores no tienen permitido cambiar el valor de las ayudas ni las monedas otorgadas a los estudiantes. El valor oficial está fijado en <strong>+{boscoConfig.coinsPerQuestion} Boscoints</strong> por consulta didáctica (límite: {boscoConfig.maxCoinsDaily} BC diarios).
                      </p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-2 gap-3 pt-2 border-t border-slate-200">
                      <div>
                        <label className="block text-[11px] font-bold text-slate-700 mb-1">
                          Monedas por consulta:
                        </label>
                        <input
                          type="number"
                          min={0}
                          max={50}
                          value={boscoConfig.coinsPerQuestion}
                          onChange={(e) =>
                            handleUpdateBoscoConfig({
                              coinsPerQuestion: Number(e.target.value) || 0,
                            })
                          }
                          disabled={!boscoConfig.giveCoinsForQuestions}
                          className="w-full p-2 text-xs rounded-xl border border-slate-300 bg-white"
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] font-bold text-slate-700 mb-1">
                          Límite diario por alumno:
                        </label>
                        <input
                          type="number"
                          min={0}
                          max={500}
                          value={boscoConfig.maxCoinsDaily}
                          onChange={(e) =>
                            handleUpdateBoscoConfig({
                              maxCoinsDaily: Number(e.target.value) || 0,
                            })
                          }
                          disabled={!boscoConfig.giveCoinsForQuestions}
                          className="w-full p-2 text-xs rounded-xl border border-slate-300 bg-white"
                        />
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Card 3: Modo Socrático y Rigor Académico */}
              <div className="p-6 rounded-3xl bg-white border border-[#cfe1e6] shadow-sm space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-teal-600 text-white grid place-items-center font-black shadow-md">
                    <GraduationCap className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-base font-extrabold text-[#12344d]">
                      Enfoque Pedagógico Socrático
                    </h3>
                    <p className="text-xs text-slate-500">
                      Evita que los estudiantes reciban respuestas automáticas sin razonar
                    </p>
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-xs font-bold text-[#12344d] block">
                        Modo Socrático Estricto (Solo Pistas)
                      </span>
                      <span className="text-[11px] text-slate-500">
                        BoscoIA solo hará preguntas guía y desglosará conceptos sin entregar la respuesta final.
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() =>
                        handleUpdateBoscoConfig({
                          socraticOnly: !boscoConfig.socraticOnly,
                        })
                      }
                      className={`w-12 h-6 flex items-center rounded-full p-1 transition-colors ${
                        boscoConfig.socraticOnly ? 'bg-teal-600' : 'bg-slate-300'
                      }`}
                    >
                      <div
                        className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform ${
                          boscoConfig.socraticOnly ? 'translate-x-6' : 'translate-x-0'
                        }`}
                      />
                    </button>
                  </div>
                </div>
              </div>

              {/* Card 4: Estadísticas y Auditoría de Uso */}
              <div className="p-6 rounded-3xl bg-white border border-[#cfe1e6] shadow-sm space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-blue-600 text-white grid place-items-center font-black shadow-md">
                    <TrendingUp className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-base font-extrabold text-[#12344d]">
                      Métricas y Monitoreo Didáctico
                    </h3>
                    <p className="text-xs text-slate-500">
                      Supervisión de consultas e impacto académico en el salón
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-2 text-center">
                  <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200">
                    <span className="text-[10px] text-slate-500 uppercase font-bold block">
                      Consultas Hoy
                    </span>
                    <strong className="text-xl font-black text-[#12344d]">24</strong>
                  </div>
                  <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200">
                    <span className="text-[10px] text-slate-500 uppercase font-bold block">
                      Materia Top
                    </span>
                    <strong className="text-sm font-black text-[#176b87]">Álgebra</strong>
                  </div>
                  <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200">
                    <span className="text-[10px] text-slate-500 uppercase font-bold block">
                      Boscoints Otorgados
                    </span>
                    <strong className="text-xl font-black text-amber-600">48 BC</strong>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ======================================================== */}
        {/* BOSCOIA TUTOR FULL VIEW (INTEGRADO DIRECTAMENTE) */}
        {/* ======================================================== */}
        {activeTab === 'boscoia' && (
          <div className="space-y-4 animate-in fade-in duration-200">
            {/* If AI is Locked by teacher */}
            {boscoConfig.isLocked && role === 'estudiante' ? (
              <div className="p-8 sm:p-12 rounded-3xl bg-white border-2 border-rose-300 shadow-xl text-center space-y-4 max-w-2xl mx-auto my-8">
                <div className="w-16 h-16 rounded-3xl bg-rose-100 text-rose-600 grid place-items-center mx-auto shadow-md">
                  <Lock className="w-8 h-8" />
                </div>
                <h3 className="text-2xl font-black text-[#12344d]">
                  BoscoIA se encuentra temporalmente bloqueado
                </h3>
                <p className="text-sm text-slate-600 leading-relaxed">
                  Tu profesor o director ha pausado el acceso al tutor inteligente durante la jornada pedagógica.
                </p>
                <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-bold inline-block">
                  Motivo: {boscoConfig.lockedReason}
                </div>
                <p className="text-xs text-slate-400">
                  Concéntrate en tu evaluación o taller. ¡Mucho ánimo y éxito con tu prueba!
                </p>
                <div className="pt-2">
                  <button
                    type="button"
                    onClick={() => setActiveTab('inicio')}
                    className="px-5 py-2.5 rounded-xl bg-[#176b87] text-white text-xs font-bold hover:bg-[#124b68]"
                  >
                    Volver a Inicio de BoscoClass
                  </button>
                </div>
              </div>
            ) : (
              <div>
                {/* Active Tutor Header notice */}
                <div className="mb-3 px-4 py-2.5 rounded-2xl bg-gradient-to-r from-red-50 to-amber-50 border border-red-200 dark:bg-slate-900/80 dark:border-red-900/50 flex flex-wrap items-center justify-between gap-3 text-xs text-red-950 dark:text-red-100 shadow-xs">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-red-600 shrink-0" />
                    <span>
                      <strong>Tutor BoscoIA Activo:</strong> Ilustraciones didácticas creadas por IA en el chat, KaTeX y resolución guiada.
                    </span>
                  </div>
                  
                  <div className="flex items-center gap-2 shrink-0">
                    {boscoConfig.giveCoinsForQuestions ? (
                      <span className="font-bold text-amber-900 bg-amber-100 border border-amber-300 px-2.5 py-1 rounded-xl text-[11px] shrink-0">
                        +{boscoConfig.coinsPerQuestion} BC por consulta
                      </span>
                    ) : (
                      <span className="text-[11px] text-slate-500 shrink-0">
                        (Monedas en pausa)
                      </span>
                    )}

                    <button
                      type="button"
                      onClick={() => setIsBoscoIAFullScreen(true)}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white font-black text-xs shadow-md transition-all active:scale-95"
                      title="Abrir BoscoIA en pantalla completa"
                    >
                      <Maximize2 className="w-3.5 h-3.5" />
                      <span>Pantalla Completa</span>
                    </button>
                  </div>
                </div>

                {/* Render the full chat component */}
                {renderBoscoIATutor()}
              </div>
            )}
          </div>
        )}

        {/* ======================================================== */}
        {/* STUDENT VIEW: INICIO */}
        {/* ======================================================== */}
        {activeTab === 'inicio' && role === 'estudiante' && (
          <div className="space-y-6 animate-in fade-in duration-200">
            {/* Student Welcome Banner */}
            <div className="p-6 rounded-3xl bg-gradient-to-r from-[#7f1d1d] via-[#991b1b] to-[#dc2626] text-white shadow-lg border-b-2 border-amber-400 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-amber-300">
                  Bienvenido a tu panel de estudio salesiano
                </span>
                <h2 className="text-2xl font-black mt-0.5">
                  ¡Hola, {userSession.name}!
                </h2>
                <p className="text-xs text-white/80 mt-1 max-w-xl">
                  Revisa tus calificaciones por periodo, tareas por entregar y conversa con tu tutor <strong>BoscoIA</strong> para resolver cualquier duda paso a paso.
                </p>
              </div>

              <button
                type="button"
                onClick={() => setActiveTab('boscoia')}
                className="px-4 py-2.5 rounded-2xl bg-gradient-to-r from-amber-400 to-yellow-300 hover:from-amber-300 hover:to-yellow-200 text-slate-950 font-black text-xs shadow-md transition-transform hover:scale-[1.02] flex items-center gap-2 shrink-0"
              >
                <Sparkles className="w-4 h-4 text-red-700" />
                <span>Estudiar con BoscoIA</span>
              </button>
            </div>

            {/* Quick Metrics Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="p-4 rounded-2xl bg-white border border-[#dce9ef] shadow-xs">
                <span className="text-[11px] text-[#586d82] uppercase font-bold block">Promedio</span>
                <strong className="text-2xl font-black text-[#12344d]">
                  {studentMetrics.promedio}
                </strong>
              </div>
              <div className="p-4 rounded-2xl bg-white border border-[#dce9ef] shadow-xs">
                <span className="text-[11px] text-[#586d82] uppercase font-bold block">Tareas Pendientes</span>
                <strong className="text-2xl font-black text-[#176b87]">
                  {studentMetrics.tareasPendientes}
                </strong>
              </div>
              <div className="p-4 rounded-2xl bg-white border border-[#dce9ef] shadow-xs">
                <span className="text-[11px] text-[#586d82] uppercase font-bold block">Asistencia</span>
                <strong className="text-2xl font-black text-emerald-600">
                  {studentMetrics.asistenciaPct}%
                </strong>
              </div>
              <div className="p-4 rounded-2xl bg-white border border-[#dce9ef] shadow-xs">
                <span className="text-[11px] text-[#586d82] uppercase font-bold block">Boscoints</span>
                <strong className="text-2xl font-black text-amber-500">
                  {classCoins} BC
                </strong>
              </div>
            </div>

            {/* Anuncios del Colegio */}
            {anuncios.length > 0 && (
              <div className="space-y-3">
                <h3 className="text-sm font-extrabold text-[#12344d]">Anuncios Escolares</h3>
                <div className="space-y-2">
                  {anuncios.map((anuncio) => (
                    <div
                      key={anuncio.id}
                      className="p-4 rounded-2xl bg-white border border-[#dce9ef] shadow-xs flex items-start gap-3"
                    >
                      <div className="w-8 h-8 rounded-xl bg-blue-100 text-blue-700 grid place-items-center font-bold text-sm shrink-0">
                        📢
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center justify-between">
                          <h4 className="text-xs font-bold text-[#12344d]">{anuncio.titulo}</h4>
                          <span className="text-[10px] text-slate-400">{anuncio.fecha}</span>
                        </div>
                        <p className="text-xs text-slate-600 mt-1">{anuncio.texto}</p>
                        <span className="text-[10px] text-[#176b87] font-semibold mt-1 block">
                          Por: {anuncio.autor} ({anuncio.aulaNombre})
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Materias y Calificaciones Rápidas */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-extrabold text-[#12344d]">Mis Materias</h3>
                <button
                  type="button"
                  onClick={() => setActiveTab('materias')}
                  className="text-xs font-bold text-[#176b87] hover:underline"
                >
                  Ver boletín completo →
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {materias.map((mat) => {
                  const notasMat = calificaciones.filter((c) => c.materia === mat.nombre);
                  const promMat =
                    notasMat.length > 0
                      ? (
                          notasMat.reduce((acc, c) => acc + Number(c.nota), 0) / notasMat.length
                        ).toFixed(1)
                      : '—';
                  return (
                    <div
                      key={mat.id}
                      className="p-4 rounded-2xl bg-white border border-[#dce9ef] shadow-xs hover:border-[#50c6b3] transition-colors"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="text-xs font-bold text-[#12344d]">{mat.nombre}</h4>
                        <span className="px-2 py-0.5 rounded-full text-[11px] font-black bg-emerald-100 text-emerald-800">
                          {promMat}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-500">Prof: {mat.profesor}</p>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* ======================================================== */}
        {/* STUDENT VIEW: MATERIAS (CALIFICACIONES PERIODOS 1-4) */}
        {/* ======================================================== */}
        {activeTab === 'materias' && (
          <div className="space-y-6 animate-in fade-in duration-200">
            <div>
              <h2 className="text-xl font-black text-[#12344d]">Mis Materias y Calificaciones</h2>
              <p className="text-xs text-slate-500">
                Consulta tus notas registradas por periodo (1 a 4) y su ponderación.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
              {/* Sidebar materias selector */}
              <div className="md:col-span-4 space-y-2">
                {materias.map((m) => (
                  <button
                    key={m.id}
                    type="button"
                    onClick={() => setSelectedMateria(m.nombre)}
                    className={`w-full p-3.5 rounded-2xl text-left border transition-all ${
                      selectedMateria === m.nombre
                        ? 'bg-[#176b87] text-white border-[#176b87] shadow-sm'
                        : 'bg-white text-[#12344d] border-[#dce9ef] hover:bg-slate-50'
                    }`}
                  >
                    <h4 className="text-xs font-bold">{m.nombre}</h4>
                    <p
                      className={`text-[10px] mt-0.5 ${
                        selectedMateria === m.nombre ? 'text-white/80' : 'text-slate-500'
                      }`}
                    >
                      {m.profesor}
                    </p>
                  </button>
                ))}
              </div>

              {/* Materia detail grades */}
              <div className="md:col-span-8 p-6 rounded-3xl bg-white border border-[#dce9ef] shadow-sm space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                  <div>
                    <h3 className="text-base font-extrabold text-[#12344d]">{selectedMateria}</h3>
                    <p className="text-xs text-slate-500">Historial de notas del año escolar</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      onOpenBoscoIA(
                        `Hola BoscoIA, ayúdame a estudiar y repasar los temas de la materia "${selectedMateria}". Explícame los temas clave.`
                      );
                      setActiveTab('boscoia');
                    }}
                    className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center gap-1.5 shadow-2xs"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Repasar con BoscoIA</span>
                  </button>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="bg-[#eef5f7] text-[#12344d]">
                        <th className="p-3 rounded-l-xl">Actividad</th>
                        <th className="p-3">Periodo</th>
                        <th className="p-3">Ponderación</th>
                        <th className="p-3 rounded-r-xl">Calificación</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {calificaciones
                        .filter((c) => c.materia === selectedMateria)
                        .map((cal, idx) => (
                          <tr key={cal.id || idx} className="hover:bg-slate-50/50">
                            <td className="p-3 font-semibold text-[#12344d]">{cal.tipo}</td>
                            <td className="p-3 text-slate-500">Periodo {cal.periodo}</td>
                            <td className="p-3 text-slate-500">{cal.porcentaje}%</td>
                            <td className="p-3">
                              <span
                                className={`px-2.5 py-1 rounded-lg font-black text-xs ${
                                  Number(cal.nota) >= 4.0
                                    ? 'bg-emerald-100 text-emerald-800'
                                    : Number(cal.nota) >= 3.0
                                    ? 'bg-amber-100 text-amber-800'
                                    : 'bg-rose-100 text-rose-800'
                                }`}
                              >
                                {cal.nota}
                              </span>
                            </td>
                          </tr>
                        ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ======================================================== */}
        {/* STUDENT VIEW: TAREAS (CON BOTÓN RESOLVER CON BOSCOIA) */}
        {/* ======================================================== */}
        {(activeTab === 'tareas' || activeTab === 'calendario') && (
          <div className="space-y-6 animate-in fade-in duration-200">
            <div>
              <h2 className="text-xl font-black text-[#12344d]">
                {activeTab === 'calendario' ? '📅 Calendario de Tareas' : '📝 Mis Tareas y Entregas'}
              </h2>
              <p className="text-xs text-slate-500">
                Resuelve tus talleres con la ayuda socrática y explicaciones paso a paso de BoscoIA.
              </p>
            </div>

            <div className="space-y-3">
              {tareas.map((tarea) => (
                <div
                  key={tarea.id}
                  className="p-5 rounded-3xl bg-white border border-[#dce9ef] shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 hover:border-[#50c6b3] transition-all"
                >
                  <div className="space-y-1 min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-[#eef5f7] text-[#176b87]">
                        {tarea.materia}
                      </span>
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          tarea.estado === 'completada' || tarea.estado === 'entregada'
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-amber-100 text-amber-800'
                        }`}
                      >
                        {tarea.estado === 'completada' ? 'Entregada' : 'Pendiente'}
                      </span>
                      {tarea.puntosCoins && (
                        <span className="text-[11px] font-black text-amber-600 flex items-center gap-0.5">
                          +{tarea.puntosCoins} CC
                        </span>
                      )}
                    </div>

                    <h3 className="text-sm font-bold text-[#12344d]">{tarea.titulo}</h3>
                    <p className="text-xs text-slate-500 leading-relaxed">{tarea.descripcion}</p>
                    <span className="text-[11px] text-slate-400 block">
                      Entrega límite: {tarea.fecha}
                    </span>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      type="button"
                      onClick={() => {
                        onOpenBoscoIA(
                          `Hola BoscoIA, por favor ayúdame a resolver y comprender paso a paso mi tarea de BoscoClass: "${tarea.titulo}" de la materia ${tarea.materia}. Rúbrica: ${tarea.descripcion}. Guíame con explicaciones y fórmulas en LaTeX.`
                        );
                        setActiveTab('boscoia');
                      }}
                      className="px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs shadow-sm flex items-center gap-1.5 transition-all active:scale-[0.99]"
                    >
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>Resolver con BoscoIA</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ======================================================== */}
        {/* MERCADO / TIENDA DE BOSCOINTS */}
        {/* ======================================================== */}
        {activeTab === 'mercado' && (
          <div className="space-y-6 animate-in fade-in duration-200">
            <div className="p-6 rounded-3xl bg-gradient-to-r from-[#b45309] to-[#d97706] text-white shadow-lg flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-amber-200">
                  Mercado de Recompensas Boscoints
                </span>
                <h2 className="text-2xl font-black mt-0.5">Tienda de Logros y Canjes</h2>
                <p className="text-xs text-amber-100 mt-1 max-w-xl">
                  {role === 'estudiante'
                    ? 'Canjea tus Boscoints ganados resolviendo talleres e interactuando con BoscoIA por beneficios académicos.'
                    : 'Catálogo de beneficios disponibles para los estudiantes. Los docentes, directores y el creador otorgan las monedas a los alumnos.'}
                </p>
              </div>
              <div className="text-right shrink-0">
                {role === 'estudiante' ? (
                  <>
                    <span className="text-[11px] text-amber-200 block">Tu saldo actual</span>
                    <strong className="text-3xl font-black">{classCoins} BC</strong>
                  </>
                ) : (
                  <button
                    type="button"
                    onClick={() => {
                      setPreselectedStudent(null);
                      setIsGrantModalOpen(true);
                    }}
                    className="px-4 py-2.5 rounded-2xl bg-amber-300 hover:bg-white text-slate-950 font-black text-xs shadow-md flex items-center gap-2 transition-all active:scale-95"
                  >
                    <Coins className="w-4 h-4 text-amber-900" />
                    <span>+ Otorgar Boscoints a un Alumno</span>
                  </button>
                )}
              </div>
            </div>

            {/* Institutional notice for non-students */}
            {role !== 'estudiante' && (
              <div className="p-4 rounded-2xl bg-amber-50 border-2 border-amber-300 flex items-start gap-3 text-xs text-amber-950 shadow-xs">
                <Shield className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" />
                <div>
                  <strong className="font-extrabold text-amber-900 block mb-0.5">
                    Modo Gestión Institucional de Recompensas
                  </strong>
                  <span>
                    Los profesores, directores y el creador original <strong>únicamente pueden otorgar monedas a los estudiantes</strong> por sus méritos académicos y participación. No tienen permitido canjear los productos de la tienda, los cuales son exclusivos para los alumnos.
                  </span>
                </div>
              </div>
            )}

            {mercadoMensaje && (
              <div className="p-3.5 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 text-xs font-bold flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-amber-600" />
                {mercadoMensaje}
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
              {productos.map((prod) => (
                <div
                  key={prod.id}
                  className="p-5 rounded-3xl bg-white border border-[#cfe8e8] shadow-xs flex flex-col justify-between space-y-3 hover:border-amber-400 transition-all"
                >
                  <div>
                    <span className="text-2xl block mb-2">{prod.icono || '🎁'}</span>
                    <h3 className="text-xs font-bold text-[#12344d]">{prod.nombre}</h3>
                    <p className="text-[11px] text-slate-500 mt-1 leading-relaxed">
                      {prod.descripcion}
                    </p>
                  </div>

                  <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                    <span className="text-xs font-black text-amber-600">{prod.precio} BC</span>
                    <button
                      type="button"
                      onClick={() => handleComprarProducto(prod)}
                      disabled={role !== 'estudiante' || classCoins < prod.precio}
                      className={`px-3 py-1.5 rounded-xl font-bold text-xs transition-all ${
                        role !== 'estudiante'
                          ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
                          : classCoins >= prod.precio
                          ? 'bg-amber-500 hover:bg-amber-400 text-slate-950 shadow-2xs'
                          : 'bg-slate-100 text-slate-400 cursor-not-allowed'
                      }`}
                    >
                      {role !== 'estudiante' ? 'Solo Estudiantes' : 'Canjear'}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ======================================================== */}
        {/* AVISOS INSTITUCIONALES Y COMUNICADOS OFICIALES */}
        {/* ======================================================== */}
        {activeTab === 'avisos' && (
          <div className="space-y-6 animate-in fade-in duration-200 max-w-4xl mx-auto">
            {/* Header Banner */}
            <div className="p-6 rounded-3xl bg-gradient-to-r from-[#7f1d1d] via-[#991b1b] to-[#dc2626] text-white shadow-xl border-b-2 border-amber-400 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="px-3 py-0.5 rounded-full bg-amber-400 text-slate-950 font-black text-[10px] uppercase tracking-wider">
                    Tablón Oficial de Comunicados
                  </span>
                  <span className="text-xs text-amber-200/80">
                    {userSession.institutionName || 'Colegio San Juan Bosco'}
                  </span>
                </div>
                <h2 className="text-2xl font-black tracking-tight text-white flex items-center gap-2">
                  <span>📢 Avisos Institucionales</span>
                </h2>
                <p className="text-xs text-white/90 max-w-2xl mt-1 leading-relaxed">
                  Circulares, fechas pedagógicas, entrega de boletines y comunicados oficiales emitidos por Rectoría, Directores de Grupo y Docentes.
                </p>
              </div>

              {isTeacherOrAdmin && (
                <button
                  type="button"
                  onClick={() => setIsNewAnuncioModalOpen(true)}
                  className="px-5 py-3 rounded-2xl bg-gradient-to-r from-amber-400 to-yellow-300 hover:from-amber-300 hover:to-yellow-200 text-slate-950 font-black text-xs shadow-lg transition-transform hover:scale-105 active:scale-95 flex items-center gap-2 shrink-0 cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  <span>+ Publicar Comunicado</span>
                </button>
              )}
            </div>

            {/* Real Platform Statistics Live Banner */}
            <div className="p-4 rounded-3xl bg-white dark:bg-[#101c18] border-2 border-red-200 dark:border-red-950 shadow-xs space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-red-700 dark:text-red-400 flex items-center gap-1.5 uppercase tracking-wide">
                  <span>📊 Cifras Reales en la Plataforma</span>
                </span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 font-bold border border-emerald-200 dark:border-emerald-800">
                  Auditado en Tiempo Real
                </span>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center text-xs">
                <div className="p-2.5 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                  <strong className="block text-lg font-black text-slate-900 dark:text-white">
                    {platformStats.totalPersonas}
                  </strong>
                  <span className="text-[10px] text-slate-500 dark:text-slate-400">Total Personas</span>
                </div>
                <div className="p-2.5 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                  <strong className="block text-lg font-black text-[#D32F2F]">
                    {platformStats.totalEstudiantes}
                  </strong>
                  <span className="text-[10px] text-slate-500 dark:text-slate-400">Estudiantes</span>
                </div>
                <div className="p-2.5 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                  <strong className="block text-lg font-black text-amber-600 dark:text-amber-400">
                    {platformStats.totalProfesores}
                  </strong>
                  <span className="text-[10px] text-slate-500 dark:text-slate-400">Docentes</span>
                </div>
                <div className="p-2.5 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                  <strong className="block text-lg font-black text-sky-600 dark:text-sky-400">
                    {platformStats.totalEscuelas}
                  </strong>
                  <span className="text-[10px] text-slate-500 dark:text-slate-400">Colegios Activos</span>
                </div>
              </div>
            </div>

            {anuncioToast && (
              <div className="p-3.5 rounded-2xl bg-emerald-600 text-white text-xs font-bold shadow-md flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <span>{anuncioToast}</span>
              </div>
            )}

            {/* Announcements Feed */}
            {anuncios.length === 0 ? (
              <div className="p-10 rounded-3xl bg-white dark:bg-[#101c18] border border-slate-200 dark:border-slate-800 text-center space-y-3">
                <span className="text-4xl block">📢</span>
                <h4 className="text-sm font-bold text-slate-800 dark:text-slate-200">
                  No hay comunicados publicados aún
                </h4>
                <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
                  Los profesores, directores y el creador original pueden publicar comunicados institucionales para toda la comunidad escolar.
                </p>
                {isTeacherOrAdmin && (
                  <button
                    type="button"
                    onClick={() => setIsNewAnuncioModalOpen(true)}
                    className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-xs"
                  >
                    + Publicar Primer Comunicado
                  </button>
                )}
              </div>
            ) : (
              <div className="space-y-4">
                {anuncios.map((anuncio) => {
                  const isUrgente = anuncio.prioridad === 'urgente';
                  const isImportante = anuncio.prioridad === 'importante';
                  const canDelete =
                    role === 'administrador' ||
                    role === 'creadorOriginal' ||
                    anuncio.autorUsuario === username;

                  return (
                    <div
                      key={anuncio.id}
                      className={`p-5 rounded-3xl border-2 transition-all shadow-xs space-y-3 ${
                        isUrgente
                          ? 'bg-red-50/70 dark:bg-red-950/20 border-red-300 dark:border-red-900/60'
                          : isImportante
                          ? 'bg-amber-50/70 dark:bg-amber-950/20 border-amber-300 dark:border-amber-900/60'
                          : 'bg-white dark:bg-[#101c18] border-slate-200 dark:border-slate-800 hover:border-red-200'
                      }`}
                    >
                      {/* Announcement Top Bar */}
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <span
                            className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider border ${
                              isUrgente
                                ? 'bg-red-600 text-white border-red-700 shadow-xs'
                                : isImportante
                                ? 'bg-amber-500 text-slate-950 border-amber-600 shadow-xs'
                                : 'bg-blue-100 dark:bg-blue-950 text-blue-800 dark:text-blue-300 border-blue-300 dark:border-blue-800'
                            }`}
                          >
                            {isUrgente ? '🚨 URGENTE' : isImportante ? '⚠️ IMPORTANTE' : 'ℹ️ COMUNICADO'}
                          </span>

                          <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                            {anuncio.rol === 'administrador'
                              ? '🏛️ Rectoría / Dirección'
                              : anuncio.rol === 'creadorOriginal'
                              ? '👑 Creador Original'
                              : '👨‍🏫 Docente'}
                          </span>

                          <span className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">
                            Alcance: <strong>{anuncio.aulaNombre || 'Toda la Institución'}</strong>
                          </span>
                        </div>

                        <div className="flex items-center gap-2">
                          <span className="text-[11px] text-slate-400 font-medium">{anuncio.fecha}</span>
                          {canDelete && (
                            <button
                              type="button"
                              onClick={() => handleDeleteAnuncio(anuncio.id)}
                              className="p-1 rounded-lg text-slate-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/40 transition-colors"
                              title="Eliminar este comunicado"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      </div>

                      {/* Title & Body */}
                      <div>
                        <h3 className="text-base font-black text-slate-900 dark:text-white leading-snug">
                          {anuncio.titulo}
                        </h3>
                        <p className="text-xs text-slate-700 dark:text-slate-300 mt-2 leading-relaxed whitespace-pre-wrap">
                          {anuncio.texto}
                        </p>
                      </div>

                      {/* Bottom Author Tag */}
                      <div className="pt-2 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400">
                        <span className="font-semibold text-slate-700 dark:text-slate-300">
                          Emitido por: {anuncio.autor}
                        </span>
                        <span>{anuncio.institucion || userSession.institutionName}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* ======================================================== */}
        {/* EL CHISMÓGRAFO */}
        {/* ======================================================== */}
        {activeTab === 'chismografo' && (
          <div className="space-y-6 animate-in fade-in duration-200 max-w-3xl mx-auto">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <h2 className="text-xl font-black text-[#1c1917] dark:text-white flex items-center gap-2">
                  <span>🗣️ El Chismógrafo Salesiano</span>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-900 border border-amber-300">
                    Muro Escolar
                  </span>
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Comparte anécdotas, noticias divertidas y saludos del salón con respeto y fraternidad.
                </p>
              </div>

              {isTeacherOrAdmin && (
                <span className="text-[11px] px-2.5 py-1 rounded-xl bg-red-100 dark:bg-red-950/50 text-red-800 dark:text-red-300 font-bold border border-red-300 dark:border-red-800 self-start">
                  🛡️ Modo Moderación Activo (Docente / Director)
                </span>
              )}
            </div>

            {/* Salon / Aula Selector for El Chismógrafo */}
            <div className="p-4 rounded-3xl bg-white dark:bg-[#121c17] border border-red-200 dark:border-red-950/80 shadow-xs space-y-2.5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <School className="w-4 h-4 text-red-600 dark:text-red-400" />
                  <span className="text-xs font-black text-slate-800 dark:text-slate-100">
                    Muro por Salón de Clases:
                  </span>
                </div>
                <span className="text-[10px] text-slate-500 dark:text-slate-400">
                  Cada salón cuenta con su propio muro independiente
                </span>
              </div>

              <div className="flex flex-wrap items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => setChismografoSalonSeleccionado('todos')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                    chismografoSalonSeleccionado === 'todos'
                      ? 'bg-gradient-to-r from-red-600 to-rose-600 text-white shadow-xs'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                  }`}
                >
                  🌟 Todos los Salones
                </button>

                {aulas.map((aula) => (
                  <button
                    key={aula.id}
                    type="button"
                    onClick={() => setChismografoSalonSeleccionado(aula.id)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                      chismografoSalonSeleccionado === aula.id
                        ? 'bg-gradient-to-r from-red-600 to-rose-600 text-white shadow-xs'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                    }`}
                  >
                    <span>🏫 {aula.nombre}</span>
                    <span className="text-[10px] opacity-75">({aula.codigo})</span>
                  </button>
                ))}
              </div>
            </div>

            <form
              onSubmit={handlePublicarChisme}
              className="p-4 rounded-3xl bg-white dark:bg-[#121c17] border border-red-200 dark:border-red-950 shadow-sm space-y-3"
            >
              <div className="flex items-center justify-between text-[11px] text-slate-500">
                <span>
                  Publicando en:{' '}
                  <strong className="text-red-700 dark:text-red-300">
                    {chismografoSalonSeleccionado === 'todos'
                      ? aulas[0]?.nombre || 'Aula 101'
                      : aulas.find((a) => a.id === chismografoSalonSeleccionado)?.nombre || 'Salón Seleccionado'}
                  </strong>
                </span>
                <span className="text-[10px] text-slate-400">
                  {userSession.name} ({role})
                </span>
              </div>

              <textarea
                value={nuevoChismeTexto}
                onChange={(e) => setNuevoChismeTexto(e.target.value)}
                placeholder="¿Qué anécdota, felicitación o novedad quieres compartir hoy con el salón?..."
                rows={2}
                className="w-full p-3 text-xs rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-red-600"
              />
              <div className="flex items-center justify-between">
                <span className="text-[11px] text-slate-400">
                  Respeta las normas de convivencia salesianas
                </span>
                <button
                  type="submit"
                  disabled={!nuevoChismeTexto.trim()}
                  className="px-4 py-2 rounded-xl bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-700 hover:to-rose-700 text-white text-xs font-bold transition-all disabled:opacity-50 shadow-xs active:scale-95"
                >
                  Publicar en el Muro
                </button>
              </div>
            </form>

            <div className="space-y-3">
              {(() => {
                const chismesFiltrados =
                  chismografoSalonSeleccionado === 'todos'
                    ? chismes
                    : chismes.filter((c) => c.aulaId === chismografoSalonSeleccionado);

                if (chismesFiltrados.length === 0) {
                  return (
                    <div className="p-8 text-center text-xs text-slate-400 italic bg-white dark:bg-[#121c17] rounded-3xl border border-slate-200 dark:border-slate-800">
                      No hay mensajes publicados en este salón aún. ¡Sé el primero en compartir!
                    </div>
                  );
                }

                return chismesFiltrados.map((chisme) => {
                  const isAuthor =
                    chisme.autorUsuario === username || chisme.autor === userSession.name;
                  const canModerate = isTeacherOrAdmin || isAuthor;
                  const aulaObj = aulas.find((a) => a.id === chisme.aulaId);

                  return (
                    <div
                      key={chisme.id}
                      className="p-4 rounded-2xl bg-white dark:bg-[#121c17] border border-red-100 dark:border-red-950/60 shadow-xs space-y-2 hover:border-red-300 transition-colors"
                    >
                      <div className="flex items-center justify-between text-[11px]">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-extrabold text-[#7f1d1d] dark:text-red-400">
                            {chisme.autor}
                          </span>
                          <span className="px-2 py-0.5 rounded-lg text-[10px] font-bold bg-red-50 dark:bg-red-950/50 text-red-700 dark:text-red-300 border border-red-200 dark:border-red-900">
                            🏫 {chisme.aulaNombre || aulaObj?.nombre || 'Aula 101'}
                          </span>
                          <span className="text-slate-400">· {chisme.fechaTexto}</span>
                          {chisme.editado && (
                            <span className="text-[10px] text-amber-600 dark:text-amber-400 italic font-semibold">
                              (editado)
                            </span>
                          )}
                        </div>

                        {/* Edit & Delete Actions */}
                        {canModerate && (
                          <div className="flex items-center gap-1">
                            <button
                              type="button"
                              onClick={() => handleStartEditChisme(chisme)}
                              className="p-1 rounded-lg text-slate-400 hover:text-amber-600 hover:bg-amber-50 dark:hover:bg-amber-950/40 transition-colors"
                              title="Editar mensaje"
                            >
                              <Pencil className="w-3.5 h-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                if (confirm('¿Deseas eliminar este mensaje del chismógrafo?')) {
                                  handleDeleteChisme(chisme.id);
                                }
                              }}
                              className="p-1 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/40 transition-colors"
                              title="Eliminar mensaje"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        )}
                      </div>

                      {editingChismeId === chisme.id ? (
                        <div className="space-y-2 pt-1 animate-in fade-in duration-150">
                          <textarea
                            value={editingChismeTexto}
                            onChange={(e) => setEditingChismeTexto(e.target.value)}
                            rows={2}
                            className="w-full p-2.5 text-xs rounded-xl border border-red-300 dark:border-red-900 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-red-600"
                          />
                          <div className="flex justify-end gap-2">
                            <button
                              type="button"
                              onClick={() => {
                                setEditingChismeId(null);
                                setEditingChismeTexto('');
                              }}
                              className="px-3 py-1 text-xs rounded-lg border border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                            >
                              Cancelar
                            </button>
                            <button
                              type="button"
                              onClick={() => handleSaveEditChisme(chisme.id)}
                              disabled={!editingChismeTexto.trim()}
                              className="px-3 py-1 text-xs rounded-lg bg-red-600 hover:bg-red-700 text-white font-bold transition-colors disabled:opacity-50"
                            >
                              Guardar Cambios
                            </button>
                          </div>
                        </div>
                      ) : (
                        <p className="text-xs text-slate-700 dark:text-slate-200 leading-relaxed whitespace-pre-wrap">
                          {chisme.texto}
                        </p>
                      )}
                    </div>
                  );
                });
              })()}
            </div>
          </div>
        )}

        {/* ======================================================== */}
        {/* TEACHER VIEW: ASIGNAR TAREAS */}
        {/* ======================================================== */}
        {activeTab === 'prof_tareas' && isTeacherOrAdmin && (
          <div className="space-y-6 animate-in fade-in duration-200 max-w-3xl">
            <div>
              <h2 className="text-xl font-black text-[#12344d]">Asignar Nuevas Tareas</h2>
              <p className="text-xs text-slate-500">
                Crea tareas para los estudiantes y define los Boscoints otorgados al entregarlas.
              </p>
            </div>

            {tareaCreadaMsg && (
              <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                {tareaCreadaMsg}
              </div>
            )}

            <form
              onSubmit={handleCrearTarea}
              className="p-6 rounded-3xl bg-white border border-[#dce9ef] shadow-sm space-y-4"
            >
              <div>
                <label className="block text-xs font-bold text-[#12344d] mb-1">Título de la tarea</label>
                <input
                  type="text"
                  value={nuevaTareaTitulo}
                  onChange={(e) => setNuevaTareaTitulo(e.target.value)}
                  placeholder="Ej. Taller 5: Factorización por agrupación"
                  required
                  className="w-full p-2.5 text-xs rounded-xl border border-slate-300"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-[#12344d] mb-1">Materia</label>
                  <select
                    value={nuevaTareaMateria}
                    onChange={(e) => setNuevaTareaMateria(e.target.value)}
                    className="w-full p-2.5 text-xs rounded-xl border border-slate-300 bg-white"
                  >
                    {materias.map((m) => (
                      <option key={m.id} value={m.nombre}>
                        {m.nombre}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#12344d] mb-1">Fecha máxima</label>
                  <input
                    type="date"
                    value={nuevaTareaFecha}
                    onChange={(e) => setNuevaTareaFecha(e.target.value)}
                    required
                    className="w-full p-2.5 text-xs rounded-xl border border-slate-300"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#12344d] mb-1">Rúbrica y Descripción</label>
                <textarea
                  value={nuevaTareaDesc}
                  onChange={(e) => setNuevaTareaDesc(e.target.value)}
                  placeholder="Especifica los pasos requeridos y criterios de evaluación..."
                  rows={3}
                  className="w-full p-2.5 text-xs rounded-xl border border-slate-300"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#12344d] mb-1">
                  Recompensa en Boscoints al completar
                </label>
                <input
                  type="number"
                  min={5}
                  max={200}
                  value={nuevaTareaCoins}
                  onChange={(e) => setNuevaTareaCoins(Number(e.target.value) || 20)}
                  className="w-full p-2.5 text-xs rounded-xl border border-slate-300"
                />
              </div>

              <button
                type="submit"
                className="w-full py-3 rounded-xl bg-[#176b87] hover:bg-[#124b68] text-white font-bold text-xs shadow-sm transition-all"
              >
                Publicar Tarea en BoscoClass
              </button>
            </form>
          </div>
        )}

        {/* ======================================================== */}
        {/* TEACHER VIEW: REGISTRAR CALIFICACIONES */}
        {/* ======================================================== */}
        {activeTab === 'prof_calificaciones' && isTeacherOrAdmin && (
          <div className="space-y-6 animate-in fade-in duration-200 max-w-3xl">
            <div>
              <h2 className="text-xl font-black text-[#12344d]">Registrar Calificaciones</h2>
              <p className="text-xs text-slate-500">
                Asigna notas del 1.0 al 5.0 para los periodos escolares 1 a 4.
              </p>
            </div>

            {notaCreadaMsg && (
              <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                {notaCreadaMsg}
              </div>
            )}

            <form
              onSubmit={handleCrearCalificacion}
              className="p-6 rounded-3xl bg-white border border-[#dce9ef] shadow-sm space-y-4"
            >
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-[#12344d] mb-1">Estudiante</label>
                  <select
                    value={nuevaNotaEstudiante}
                    onChange={(e) => setNuevaNotaEstudiante(e.target.value)}
                    className="w-full p-2.5 text-xs rounded-xl border border-slate-300 bg-white"
                  >
                    <option value="ana">Ana García</option>
                    <option value="luis">Luis Pérez</option>
                    <option value="estudiante">Estudiante Invitado</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#12344d] mb-1">Materia</label>
                  <select
                    value={nuevaNotaMateria}
                    onChange={(e) => setNuevaNotaMateria(e.target.value)}
                    className="w-full p-2.5 text-xs rounded-xl border border-slate-300 bg-white"
                  >
                    {materias.map((m) => (
                      <option key={m.id} value={m.nombre}>
                        {m.nombre}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-bold text-[#12344d] mb-1">Periodo</label>
                  <select
                    value={nuevaNotaPeriodo}
                    onChange={(e) => setNuevaNotaPeriodo(e.target.value)}
                    className="w-full p-2.5 text-xs rounded-xl border border-slate-300 bg-white"
                  >
                    <option value="1">Periodo 1</option>
                    <option value="2">Periodo 2</option>
                    <option value="3">Periodo 3</option>
                    <option value="4">Periodo 4</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#12344d] mb-1">Actividad</label>
                  <input
                    type="text"
                    value={nuevaNotaTipo}
                    onChange={(e) => setNuevaNotaTipo(e.target.value)}
                    placeholder="Taller / Examen"
                    required
                    className="w-full p-2.5 text-xs rounded-xl border border-slate-300"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#12344d] mb-1">Nota (1.0 - 5.0)</label>
                  <input
                    type="text"
                    value={nuevaNotaValor}
                    onChange={(e) => setNuevaNotaValor(e.target.value)}
                    placeholder="4.8"
                    required
                    className="w-full p-2.5 text-xs rounded-xl border border-slate-300"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-3 rounded-xl bg-[#176b87] hover:bg-[#124b68] text-white font-bold text-xs shadow-sm transition-all"
              >
                Guardar Calificación
              </button>
            </form>
          </div>
        )}

        {/* ======================================================== */}
        {/* VIEW: AULAS Y SALONES DE CLASE (CREACIÓN Y UNIÓN) */}
        {/* ======================================================== */}
        {(activeTab === 'prof_aulas' || activeTab === 'aulas' || activeTab === 'admin_centro') && (
          <div className="space-y-6 animate-in fade-in duration-200">
            {/* Header banner */}
            <div className="p-6 rounded-3xl bg-gradient-to-r from-[#7f1d1d] via-[#991b1b] to-[#dc2626] text-white shadow-xl border-2 border-amber-400/40 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2 mb-1.5">
                  <span className="px-2.5 py-0.5 rounded-full bg-amber-400 text-slate-950 font-black text-[10px] uppercase tracking-wider">
                    Gestión Académica
                  </span>
                  <span className="text-xs text-amber-100">
                    {userSession.institutionName || 'Colegio San Juan Bosco'}
                  </span>
                </div>
                <h2 className="text-2xl font-black tracking-tight text-white">
                  Aulas y Salones de Clase
                </h2>
                <p className="text-xs text-amber-100/90 max-w-2xl mt-1">
                  {role === 'estudiante'
                    ? 'Únete a tus salones con el código proporcionado por tus profesores para acceder a tareas, notas y materiales.'
                    : 'Crea salones de clase, administra los códigos de acceso e inscribe o gestiona a tus estudiantes.'}
                </p>
              </div>

              {/* Teacher / Director Create Aula action */}
              {isTeacherOrAdmin && (
                <button
                  type="button"
                  onClick={() => setIsNewAulaModalOpen(true)}
                  className="px-5 py-3 rounded-2xl bg-gradient-to-r from-amber-400 to-yellow-300 hover:from-amber-300 hover:to-yellow-200 text-slate-950 font-black text-xs shadow-lg transition-transform hover:scale-105 active:scale-95 flex items-center gap-2 shrink-0"
                >
                  <Plus className="w-4 h-4" />
                  <span>+ Crear Nueva Aula</span>
                </button>
              )}
            </div>

            {/* Toasts */}
            {aulaCreadaToast && (
              <div className="p-4 rounded-2xl bg-emerald-600 text-white font-bold text-xs flex items-center gap-2 shadow-lg animate-in slide-in-from-top">
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <span>{aulaCreadaToast}</span>
              </div>
            )}

            {joinAulaToast && (
              <div
                className={`p-4 rounded-2xl text-white font-bold text-xs flex items-center gap-2 shadow-lg animate-in slide-in-from-top ${
                  joinAulaToast.success ? 'bg-emerald-600' : 'bg-rose-600'
                }`}
              >
                {joinAulaToast.success ? (
                  <CheckCircle2 className="w-4 h-4 shrink-0" />
                ) : (
                  <AlertCircle className="w-4 h-4 shrink-0" />
                )}
                <span>{joinAulaToast.message}</span>
              </div>
            )}

            {/* Student Join Aula Banner */}
            {role === 'estudiante' && (
              <div className="p-6 rounded-3xl bg-white dark:bg-[#121c17] border-2 border-red-200 dark:border-red-950 shadow-md space-y-3">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-red-100 dark:bg-red-950 text-red-700 dark:text-red-400 grid place-items-center font-bold">
                    🔑
                  </div>
                  <div>
                    <h3 className="text-sm font-black text-slate-900 dark:text-white">
                      ¿Tienes un código de aula? Únete a tu salón ahora
                    </h3>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400">
                      Ingresa el código que te entregó tu profesor (por ejemplo: CP-MATH-01, CP-BIO-02)
                    </p>
                  </div>
                </div>

                <form onSubmit={handleUnirseAula} className="flex flex-col sm:flex-row items-center gap-2.5 pt-1">
                  <input
                    type="text"
                    value={codigoUnirseAula}
                    onChange={(e) => setCodigoUnirseAula(e.target.value.toUpperCase())}
                    placeholder="Código de aula (ej: CP-MATH-01)"
                    className="flex-1 w-full p-2.5 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white font-mono uppercase font-bold focus:outline-none focus:ring-2 focus:ring-red-600"
                  />
                  <button
                    type="submit"
                    disabled={!codigoUnirseAula.trim()}
                    className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-700 hover:to-rose-700 text-white font-black text-xs shadow-md transition-all disabled:opacity-50 active:scale-95 flex items-center justify-center gap-1.5"
                  >
                    <CheckCheck className="w-4 h-4" />
                    <span>Unirme al Aula</span>
                  </button>
                </form>
              </div>
            )}

            {/* Aulas Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {aulas.map((aula) => {
                const isStudentEnrolled = aula.estudiantes.includes(username);

                return (
                  <div
                    key={aula.id}
                    className="p-5 rounded-3xl bg-white dark:bg-[#121c17] border border-red-100 dark:border-red-950/70 shadow-xs space-y-3.5 flex flex-col justify-between hover:border-red-300 transition-colors"
                  >
                    <div>
                      {/* Top Row: Code Pill + Student Count + Delete */}
                      <div className="flex items-center justify-between gap-2 flex-wrap">
                        <div className="flex items-center gap-1.5">
                          <span className="px-3 py-1 rounded-full text-xs font-mono font-black bg-red-50 dark:bg-red-950/60 text-red-700 dark:text-red-300 border border-red-200 dark:border-red-900 flex items-center gap-1.5">
                            <span>Código: {aula.codigo}</span>
                          </span>
                          <button
                            type="button"
                            onClick={() => {
                              navigator.clipboard.writeText(aula.codigo);
                              setCopiedCode(aula.codigo);
                              setTimeout(() => setCopiedCode(null), 2500);
                            }}
                            className="p-1 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/40 transition-colors"
                            title="Copiar código al portapapeles"
                          >
                            {copiedCode === aula.codigo ? (
                              <Check className="w-3.5 h-3.5 text-emerald-500" />
                            ) : (
                              <Copy className="w-3.5 h-3.5" />
                            )}
                          </button>
                          {copiedCode === aula.codigo && (
                            <span className="text-[10px] text-emerald-600 font-bold">¡Copiado!</span>
                          )}
                        </div>

                        <div className="flex items-center gap-2">
                          <span className="text-xs text-slate-400 font-semibold">
                            {aula.estudiantes.length} estudiantes
                          </span>
                          {isTeacherOrAdmin && (
                            <button
                              type="button"
                              onClick={() => handleEliminarAula(aula.id)}
                              className="p-1 text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/40 rounded-lg transition-colors"
                              title="Eliminar aula"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      </div>

                      {/* Title & Info */}
                      <div className="mt-2 space-y-1">
                        <h3 className="text-base font-extrabold text-[#12344d] dark:text-white">
                          {aula.nombre}
                        </h3>
                        <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 flex-wrap">
                          <span className="font-semibold text-red-700 dark:text-red-400">
                            {aula.materia || 'Materia General'}
                          </span>
                          <span>·</span>
                          <span>{aula.grado || 'Bachillerato'}</span>
                          <span>·</span>
                          <span>🕒 {aula.horario}</span>
                        </div>
                        <p className="text-xs text-slate-500 dark:text-slate-400">
                          👨‍🏫 Titular: <strong>{aula.profesor}</strong>
                        </p>
                        {aula.descripcion && (
                          <p className="text-[11px] text-slate-600 dark:text-slate-300 italic pt-1">
                            {aula.descripcion}
                          </p>
                        )}
                      </div>

                      {/* Student Status & Join Action */}
                      {role === 'estudiante' && (
                        <div className="pt-2">
                          {isStudentEnrolled ? (
                            <div className="p-2.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 text-xs font-bold flex items-center gap-2">
                              <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600 dark:text-emerald-400" />
                              <span>Ya estás inscrito en esta aula</span>
                            </div>
                          ) : (
                            <button
                              type="button"
                              onClick={() => {
                                const res = ClassPointService.joinAula(aula.codigo, username);
                                setJoinAulaToast(res);
                                if (res.success) setAulas(ClassPointService.getAulas());
                                setTimeout(() => setJoinAulaToast(null), 5000);
                              }}
                              className="w-full py-2 rounded-xl bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-700 hover:to-rose-700 text-white font-bold text-xs shadow-xs transition-all active:scale-95"
                            >
                              Inscribirme a esta Aula
                            </button>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Students in classroom with direct grant button */}
                    <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
                      <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block mb-1.5">
                        Estudiantes del Salón ({aula.estudiantes.length}):
                      </span>

                      {aula.estudiantes.length === 0 ? (
                        <p className="text-[11px] text-slate-400 italic">
                          Aún no hay estudiantes inscritos. Comparte el código{' '}
                          <strong className="text-red-600">{aula.codigo}</strong> para que se unan.
                        </p>
                      ) : (
                        <div className="space-y-1.5 max-h-40 overflow-y-auto">
                          {aula.estudiantes.map((st, idx) => {
                            const stNombre =
                              st === 'ana' ? 'Ana García' : st === 'luis' ? 'Luis Pérez' : `Estudiante (${st})`;
                            return (
                              <div
                                key={idx}
                                className="p-2 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs"
                              >
                                <span className="font-semibold text-slate-700 dark:text-slate-200">
                                  {stNombre}
                                </span>
                                {isTeacherOrAdmin && (
                                  <button
                                    type="button"
                                    onClick={() => {
                                      setPreselectedStudent({ usuario: st, nombre: stNombre });
                                      setIsGrantModalOpen(true);
                                    }}
                                    className="px-2.5 py-1 rounded-lg bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-[10px] flex items-center gap-1 shadow-2xs transition-colors"
                                  >
                                    <Coins className="w-3 h-3" />
                                    <span>+ Otorgar BC</span>
                                  </button>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ======================================================== */}
        {/* VIEW: PLANES DE ESTUDIO (CURRICULUM & SUPERVISIÓN) */}
        {/* ======================================================== */}
        {(activeTab === 'prof_planes' || activeTab === 'estudiante_planes' || activeTab === 'admin_planes') && (
          <div className="space-y-6 animate-in fade-in duration-200">
            {/* Header banner */}
            <div className="p-6 rounded-3xl bg-gradient-to-r from-[#7f1d1d] via-[#991b1b] to-[#dc2626] text-white shadow-xl border-2 border-amber-400/40 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2 mb-1.5">
                  <span className="px-2.5 py-0.5 rounded-full bg-amber-400 text-slate-950 font-black text-[10px] uppercase tracking-wider">
                    Malla Curricular Oficial
                  </span>
                  <span className="text-xs text-amber-100">
                    {userSession.institutionName || 'Colegio San Juan Bosco'}
                  </span>
                </div>
                <h2 className="text-2xl font-black tracking-tight text-white flex items-center gap-2">
                  <Compass className="w-6 h-6 text-amber-300" />
                  <span>Planes de Estudio y Temarios</span>
                </h2>
                <p className="text-xs text-amber-100/90 max-w-2xl mt-1 leading-relaxed">
                  {role === 'estudiante'
                    ? 'Consulta las unidades temáticas, competencias y objetivos pedagógicos establecidos por tus profesores para cada materia.'
                    : role === 'profesor'
                    ? 'Diseña planes de estudio por semanas. Puedes elegir si son visibles para los estudiantes, manteniendo siempre acceso total para supervisión de directores.'
                    : 'Supervisión académica institucional: Visualiza y audita todos los planes curriculares de los docentes (tanto públicos como borradores confidenciales).'}
                </p>
              </div>

              {/* Create Plan Button for Teachers & Directors */}
              {isTeacherOrAdmin && (
                <button
                  type="button"
                  onClick={() => setIsNewPlanModalOpen(true)}
                  className="px-5 py-3 rounded-2xl bg-gradient-to-r from-amber-400 to-yellow-300 hover:from-amber-300 hover:to-yellow-200 text-slate-950 font-black text-xs shadow-lg transition-transform hover:scale-105 active:scale-95 flex items-center gap-2 shrink-0"
                >
                  <Plus className="w-4 h-4" />
                  <span>+ Crear Plan de Estudio</span>
                </button>
              )}
            </div>

            {/* Plan Toast Feedback */}
            {planToastMsg && (
              <div className="p-4 rounded-2xl bg-emerald-600 text-white font-bold text-xs flex items-center gap-2 shadow-lg animate-in slide-in-from-top">
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <span>{planToastMsg}</span>
              </div>
            )}

            {/* Role Notice on Confidential Plans */}
            {(role === 'administrador' || role === 'creadorOriginal') && (
              <div className="p-3.5 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-300 dark:border-amber-800 text-amber-950 dark:text-amber-200 text-xs flex items-center gap-2">
                <Shield className="w-4 h-4 text-amber-600 shrink-0" />
                <span>
                  <strong>Modo Auditoría Directiva:</strong> Como director, puedes ver todos los planes curriculares, incluyendo aquellos marcados como confidenciales por los docentes (ocultos a los estudiantes).
                </span>
              </div>
            )}

            {/* Plans Grid */}
            {planesEstudio.length === 0 ? (
              <div className="p-12 text-center rounded-3xl bg-white dark:bg-[#121c17] border border-slate-200 dark:border-slate-800 space-y-4">
                <div className="w-16 h-16 rounded-3xl bg-red-50 dark:bg-red-950/40 text-red-600 dark:text-red-400 grid place-items-center mx-auto border border-red-200 dark:border-red-900">
                  <Compass className="w-8 h-8" />
                </div>
                <div>
                  <h3 className="text-base font-extrabold text-slate-800 dark:text-slate-100">
                    No hay planes de estudio registrados
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                    {role === 'profesor'
                      ? 'Haz clic en "+ Crear Plan de Estudio" para definir tu primera malla curricular.'
                      : 'Tus profesores aún no han publicado temarios para este periodo.'}
                  </p>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {planesEstudio.map((plan) => (
                  <div
                    key={plan.id}
                    className="p-5 rounded-3xl bg-white dark:bg-[#121c17] border border-red-100 dark:border-red-950/70 shadow-xs space-y-3.5 flex flex-col justify-between hover:border-red-300 transition-colors"
                  >
                    <div className="space-y-3">
                      {/* Top tags */}
                      <div className="flex items-center justify-between gap-2 flex-wrap">
                        <span className="px-2.5 py-0.5 rounded-lg text-[10px] font-bold bg-red-50 dark:bg-red-950/60 text-red-700 dark:text-red-300 border border-red-200 dark:border-red-900">
                          {plan.materia} · {plan.grado}
                        </span>

                        {/* Visibility Badge */}
                        {plan.visibleParaEstudiantes ? (
                          <span className="px-2.5 py-0.5 rounded-lg text-[10px] font-bold bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 flex items-center gap-1">
                            <Eye className="w-3 h-3" />
                            <span>Visible para Alumnos</span>
                          </span>
                        ) : (
                          <span
                            className="px-2.5 py-0.5 rounded-lg text-[10px] font-bold bg-amber-50 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 border border-amber-300 dark:border-amber-800 flex items-center gap-1"
                            title="Oculto para estudiantes. Los directores siempre pueden ver este plan."
                          >
                            <Lock className="w-3 h-3" />
                            <span>Confidencial (Solo Directores)</span>
                          </span>
                        )}
                      </div>

                      {/* Title & Description */}
                      <div>
                        <h3 className="text-base font-extrabold text-[#12344d] dark:text-white leading-snug">
                          {plan.titulo}
                        </h3>
                        <p className="text-xs text-slate-600 dark:text-slate-300 mt-1 line-clamp-2">
                          {plan.descripcion}
                        </p>
                      </div>

                      {/* Teacher & Period */}
                      <div className="p-2.5 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 text-[11px] space-y-1">
                        <div className="flex items-center justify-between">
                          <span className="text-slate-500">Docente:</span>
                          <strong className="text-slate-700 dark:text-slate-200">{plan.profesor}</strong>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-slate-500">Periodo:</span>
                          <span className="font-semibold text-slate-700 dark:text-slate-200">{plan.periodo || 'Periodo 1'}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-slate-500">Unidades:</span>
                          <span className="font-semibold text-red-700 dark:text-red-400">{plan.unidades.length} unidades temáticas</span>
                        </div>
                      </div>

                      {/* Objectives preview */}
                      {plan.objetivos && plan.objetivos.length > 0 && (
                        <div>
                          <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block mb-1">
                            Objetivos Clave:
                          </span>
                          <ul className="text-[11px] text-slate-600 dark:text-slate-300 space-y-1 list-disc pl-4">
                            {plan.objetivos.slice(0, 2).map((obj, i) => (
                              <li key={i}>{obj}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>

                    {/* Actions */}
                    <div className="pt-2 border-t border-slate-100 dark:border-slate-800 space-y-2">
                      <button
                        type="button"
                        onClick={() => setSelectedPlanDetalle(plan)}
                        className="w-full py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 font-bold text-xs transition-colors flex items-center justify-center gap-1.5"
                      >
                        <FileSpreadsheet className="w-3.5 h-3.5 text-red-600" />
                        <span>Ver Temario Completo</span>
                      </button>

                      {/* Teacher / Director Visibility Toggle */}
                      {isTeacherOrAdmin && (
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => handleTogglePlanVisibilidad(plan)}
                            className={`flex-1 py-1.5 rounded-xl text-[11px] font-bold border transition-colors flex items-center justify-center gap-1 ${
                              plan.visibleParaEstudiantes
                                ? 'border-amber-300 text-amber-800 dark:text-amber-300 hover:bg-amber-50 dark:hover:bg-amber-950/40'
                                : 'border-emerald-300 text-emerald-800 dark:text-emerald-300 hover:bg-emerald-50 dark:hover:bg-emerald-950/40'
                            }`}
                          >
                            {plan.visibleParaEstudiantes ? (
                              <>
                                <EyeOff className="w-3 h-3" />
                                <span>Ocultar a Alumnos</span>
                              </>
                            ) : (
                              <>
                                <Eye className="w-3 h-3" />
                                <span>Hacer Visible a Alumnos</span>
                              </>
                            )}
                          </button>

                          <button
                            type="button"
                            onClick={() => handleEliminarPlan(plan.id)}
                            className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/40 rounded-xl transition-colors"
                            title="Eliminar plan de estudio"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      )}

                      {/* Student direct study helper */}
                      {role === 'estudiante' && (
                        <button
                          type="button"
                          onClick={() => {
                            setActiveTab('boscoia');
                            onOpenBoscoIA(
                              `Hola BoscoIA, quiero estudiar el plan de ${plan.materia}: "${plan.titulo}". Ayúdame con explicaciones paso a paso, ejercicios y esquemas visuales.`
                            );
                          }}
                          className="w-full py-2 rounded-xl bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-700 hover:to-rose-700 text-white font-bold text-xs shadow-xs transition-all active:scale-95 flex items-center justify-center gap-1.5"
                        >
                          <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                          <span>Estudiar este Plan con BoscoIA</span>
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ======================================================== */}
        {/* STUDENT VIEW: EVIDENCIAS DE APRENDIZAJE */}
        {/* ======================================================== */}
        {activeTab === 'evidencias' && (
          <div className="space-y-6 animate-in fade-in duration-200">
            {/* Header banner */}
            <div className="p-6 rounded-3xl bg-gradient-to-r from-[#176b87] via-[#103d5b] to-[#0c2b42] text-white shadow-xl border border-[#2a7a9e] flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2 mb-1.5">
                  <span className="px-2.5 py-0.5 rounded-full bg-emerald-400 text-slate-950 font-black text-[10px] uppercase tracking-wider">
                    Portafolio Académico
                  </span>
                  <span className="text-xs text-white/70">
                    Acreditación y Rúbricas BoscoClass
                  </span>
                </div>
                <h2 className="text-2xl font-black tracking-tight">
                  Mis Evidencias de Aprendizaje
                </h2>
                <p className="text-xs text-white/80 max-w-2xl mt-1">
                  Sube tus talleres resueltos, diagramas biológicos, prácticas de laboratorio y soluciones de BoscoIA para que tus profesores las califiquen y te otorguen Boscoints.
                </p>
              </div>

              <button
                type="button"
                onClick={() => setIsNewEvidenceModalOpen(true)}
                className="px-5 py-3 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-400 hover:from-emerald-400 hover:to-teal-300 text-slate-950 font-black text-xs shadow-lg transition-transform hover:scale-105 active:scale-95 flex items-center gap-2 shrink-0"
              >
                <FolderPlus className="w-4 h-4" />
                <span>+ Subir Nueva Evidencia</span>
              </button>
            </div>

            {/* Toast Feedback */}
            {evidenciaToast && (
              <div className="p-4 rounded-2xl bg-emerald-500 text-white font-bold text-xs flex items-center gap-2 shadow-lg animate-in slide-in-from-top">
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <span>{evidenciaToast}</span>
              </div>
            )}

            {/* Summary Stat Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="p-4 rounded-2xl bg-white dark:bg-[#0f1b29] border border-slate-200 dark:border-slate-800 shadow-xs">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Total Evidencias</span>
                <span className="text-2xl font-black text-[#12344d] dark:text-white mt-1 block">
                  {evidencias.length}
                </span>
              </div>
              <div className="p-4 rounded-2xl bg-white dark:bg-[#0f1b29] border border-slate-200 dark:border-slate-800 shadow-xs">
                <span className="text-[10px] font-bold text-emerald-500 uppercase tracking-wider block">Aprobadas</span>
                <span className="text-2xl font-black text-emerald-600 dark:text-emerald-400 mt-1 block">
                  {evidencias.filter((e) => e.estado === 'aprobada').length}
                </span>
              </div>
              <div className="p-4 rounded-2xl bg-white dark:bg-[#0f1b29] border border-slate-200 dark:border-slate-800 shadow-xs">
                <span className="text-[10px] font-bold text-amber-500 uppercase tracking-wider block">En Revisión</span>
                <span className="text-2xl font-black text-amber-600 dark:text-amber-400 mt-1 block">
                  {evidencias.filter((e) => e.estado === 'pendiente' || !e.estado).length}
                </span>
              </div>
              <div className="p-4 rounded-2xl bg-white dark:bg-[#0f1b29] border border-slate-200 dark:border-slate-800 shadow-xs">
                <span className="text-[10px] font-bold text-indigo-500 uppercase tracking-wider block">Boscoints Ganados</span>
                <span className="text-2xl font-black text-indigo-600 dark:text-indigo-400 mt-1 block">
                  +{evidencias.filter((e) => e.estado === 'aprobada').reduce((acc, curr) => acc + (curr.puntosCoins || 20), 0)} BC
                </span>
              </div>
            </div>

            {/* Evidencias List */}
            {evidencias.length === 0 ? (
              <div className="p-12 text-center rounded-3xl bg-white dark:bg-[#0f1b29] border border-slate-200 dark:border-slate-800 space-y-4">
                <div className="w-16 h-16 rounded-3xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 grid place-items-center mx-auto border border-emerald-200 dark:border-emerald-800/40">
                  <Upload className="w-8 h-8" />
                </div>
                <div>
                  <h3 className="text-base font-extrabold text-slate-800 dark:text-slate-100">
                    Aún no has subido evidencias de aprendizaje
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 max-w-md mx-auto mt-1">
                    Comparte tus talleres, esquemas o apuntes para que tus docentes los revisen y recibas recompensas en Boscoints.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setIsNewEvidenceModalOpen(true)}
                  className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-md transition-all inline-flex items-center gap-2"
                >
                  <Plus className="w-4 h-4" />
                  <span>Subir mi primera evidencia</span>
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {evidencias.map((ev) => {
                  const isAprobada = ev.estado === 'aprobada';
                  const isPendiente = !ev.estado || ev.estado === 'pendiente';
                  return (
                    <div
                      key={ev.id}
                      className="p-5 rounded-3xl bg-white dark:bg-[#0f1b29] border border-slate-200 dark:border-slate-800 shadow-xs hover:shadow-md transition-all space-y-4 relative"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#eef5f7] dark:bg-slate-800 text-[#176b87] dark:text-emerald-400">
                              {ev.materia || 'Asignatura'}
                            </span>
                            <span className="text-[10px] text-slate-400">
                              📅 {ev.fecha || 'Reciente'}
                            </span>
                          </div>
                          <h3 className="text-base font-extrabold text-slate-800 dark:text-slate-100">
                            {ev.titulo}
                          </h3>
                        </div>

                        <span
                          className={`px-3 py-1 rounded-full text-[11px] font-black shrink-0 ${
                            isAprobada
                              ? 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-700/60'
                              : isPendiente
                              ? 'bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 border border-amber-300 dark:border-amber-700/60'
                              : 'bg-rose-100 dark:bg-rose-950/60 text-rose-800 dark:text-rose-300 border border-rose-300 dark:border-rose-700/60'
                          }`}
                        >
                          {isAprobada ? '✓ Aprobada' : isPendiente ? '⏳ En Revisión' : '⚠️ Requiere Ajustes'}
                        </span>
                      </div>

                      {ev.descripcion && (
                        <p className="text-xs text-slate-600 dark:text-slate-300 bg-slate-50 dark:bg-slate-900/60 p-3 rounded-2xl border border-slate-150 dark:border-slate-800/80 leading-relaxed">
                          {ev.descripcion}
                        </p>
                      )}

                      {/* Recipient Teacher & Attachment info */}
                      <div className="flex flex-wrap items-center justify-between gap-2 text-xs pt-1 border-t border-slate-100 dark:border-slate-800">
                        <div className="flex items-center gap-1.5 text-slate-600 dark:text-slate-300">
                          <GraduationCap className="w-4 h-4 text-emerald-500" />
                          <span className="font-semibold">{ev.profesor || 'Docente Titular'}</span>
                        </div>

                        <div className="flex items-center gap-2">
                          <span className="px-2.5 py-1 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-[11px] font-mono flex items-center gap-1.5">
                            <FileText className="w-3.5 h-3.5 text-indigo-500" />
                            <span className="truncate max-w-[140px]">{ev.archivoNombre || 'evidencia.pdf'}</span>
                          </span>

                          {ev.enlace && (
                            <a
                              href={ev.enlace}
                              target="_blank"
                              rel="noreferrer"
                              className="p-1 rounded-lg text-emerald-600 hover:bg-emerald-50 dark:hover:bg-slate-800"
                              title="Ver enlace"
                            >
                              <ExternalLink className="w-3.5 h-3.5" />
                            </a>
                          )}
                        </div>
                      </div>

                      {/* Teacher Feedback & Coins Awarded */}
                      {ev.retroalimentacion && (
                        <div className="p-3.5 rounded-2xl bg-emerald-50/80 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800/40 text-xs space-y-1">
                          <div className="flex items-center justify-between font-bold text-emerald-800 dark:text-emerald-300 text-[11px]">
                            <span>Comentario del Docente:</span>
                            {ev.puntosCoins && (
                              <span className="flex items-center gap-1 text-amber-600 dark:text-amber-400 font-extrabold">
                                <Coins className="w-3 h-3" />
                                +{ev.puntosCoins} Boscoints
                              </span>
                            )}
                          </div>
                          <p className="text-slate-700 dark:text-slate-300 text-xs italic leading-relaxed">
                            "{ev.retroalimentacion}"
                          </p>
                        </div>
                      )}

                      {/* Delete option if pending */}
                      {isPendiente && (
                        <div className="flex justify-end pt-1">
                          <button
                            type="button"
                            onClick={() => handleEliminarEvidencia(ev.id)}
                            className="text-[11px] text-rose-500 hover:text-rose-600 flex items-center gap-1 font-medium transition-colors"
                          >
                            <Trash2 className="w-3 h-3" />
                            <span>Retirar entrega</span>
                          </button>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* ======================================================== */}
        {/* TEACHER & DIRECTOR VIEW: REVISAR EVIDENCIAS */}
        {/* ======================================================== */}
        {(activeTab === 'prof_evidencias' || (role === 'administrador' && activeTab === 'prof_evidencias')) && (
          <div className="space-y-6 animate-in fade-in duration-200">
            {/* Header banner */}
            <div className="p-6 rounded-3xl bg-gradient-to-r from-[#103d5b] via-[#176b87] to-[#1e587a] text-white shadow-xl border border-[#2a7a9e] flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2 mb-1.5">
                  <span className="px-2.5 py-0.5 rounded-full bg-amber-400 text-slate-950 font-black text-[10px] uppercase tracking-wider">
                    Panel de Calificación y Acreditación
                  </span>
                  <span className="text-xs text-white/70">
                    Revisión de Evidencias Estudiantiles
                  </span>
                </div>
                <h2 className="text-2xl font-black tracking-tight">
                  Evidencias de Aprendizaje por Calificar
                </h2>
                <p className="text-xs text-white/80 max-w-2xl mt-1">
                  Evalúa las soluciones de talleres, diagramas de BoscoIA y proyectos enviados por tus alumnos. Agrega retroalimentación pedagógica y otorga Boscoints por su esfuerzo.
                </p>
              </div>

              {reviewSuccessMsg && (
                <div className="px-4 py-2.5 rounded-2xl bg-emerald-500 text-white font-bold text-xs flex items-center gap-2 shadow-lg animate-bounce">
                  <CheckCircle2 className="w-4 h-4 shrink-0" />
                  <span>{reviewSuccessMsg}</span>
                </div>
              )}
            </div>

            {/* Evidencias to review grid */}
            <div className="space-y-4">
              {evidencias.length === 0 ? (
                <div className="p-12 text-center rounded-3xl bg-white dark:bg-[#0f1b29] border border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400">
                  <CheckCheck className="w-10 h-10 text-emerald-500 mx-auto mb-2" />
                  <p className="font-bold">No hay evidencias pendientes por calificar en este momento.</p>
                </div>
              ) : (
                evidencias.map((ev) => {
                  const isAprobada = ev.estado === 'aprobada';
                  return (
                    <div
                      key={ev.id}
                      className="p-5 rounded-3xl bg-white dark:bg-[#0f1b29] border border-slate-200 dark:border-slate-800 shadow-xs space-y-4"
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                        <div className="flex items-center gap-3">
                          <img
                            src={`https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(
                              ev.estudianteNombre || ev.usuario
                            )}&backgroundColor=176b87`}
                            alt="Estudiante"
                            className="w-10 h-10 rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-100 object-cover shrink-0"
                          />
                          <div>
                            <div className="flex items-center gap-2">
                              <h4 className="text-sm font-extrabold text-slate-800 dark:text-slate-100">
                                {ev.estudianteNombre || ev.usuario}
                              </h4>
                              <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-[#eef5f7] dark:bg-slate-800 text-[#176b87] dark:text-emerald-400">
                                {ev.materia}
                              </span>
                            </div>
                            <p className="text-xs text-slate-400">
                              Entregado el: {ev.fecha || 'Reciente'} · Asignado a: {ev.profesor || 'Docente'}
                            </p>
                          </div>
                        </div>

                        <span
                          className={`px-3 py-1 rounded-full text-xs font-black self-start sm:self-center ${
                            isAprobada
                              ? 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-700/60'
                              : 'bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 border border-amber-300 dark:border-amber-700/60'
                          }`}
                        >
                          {isAprobada ? '✓ Acreditada' : '⏳ Pendiente de Acreditación'}
                        </span>
                      </div>

                      <div className="bg-slate-50 dark:bg-slate-900/60 p-4 rounded-2xl border border-slate-150 dark:border-slate-800 space-y-2">
                        <div className="flex items-center justify-between">
                          <h5 className="text-sm font-bold text-slate-800 dark:text-slate-100">
                            {ev.titulo}
                          </h5>
                          <span className="px-2.5 py-1 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 text-xs font-mono flex items-center gap-1.5">
                            <FileText className="w-3.5 h-3.5 text-indigo-500" />
                            <span>{ev.archivoNombre || 'archivo_entregado.pdf'}</span>
                          </span>
                        </div>
                        {ev.descripcion && (
                          <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                            {ev.descripcion}
                          </p>
                        )}
                      </div>

                      {/* Teacher Evaluation & Grading Block */}
                      <div className="p-4 rounded-2xl bg-indigo-50/50 dark:bg-slate-900/80 border border-indigo-100 dark:border-slate-800 space-y-3">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                          <label className="text-xs font-bold text-slate-700 dark:text-slate-200">
                            Retroalimentación Pedagógica del Docente:
                          </label>
                          <div className="flex items-center gap-2">
                            <span className="text-xs text-slate-500 font-semibold">Boscoints a otorgar:</span>
                            <select
                              value={reviewCoins[ev.id] !== undefined ? reviewCoins[ev.id] : (ev.puntosCoins || 20)}
                              onChange={(e) =>
                                setReviewCoins((prev) => ({
                                  ...prev,
                                  [ev.id]: Number(e.target.value),
                                }))
                              }
                              className="px-2.5 py-1 text-xs rounded-xl bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-800 dark:text-slate-100 font-bold"
                            >
                              <option value={10}>+10 Boscoints</option>
                              <option value={20}>+20 Boscoints (Estándar)</option>
                              <option value={30}>+30 Boscoints (Excelente)</option>
                              <option value={50}>+50 Boscoints (Sobresaliente)</option>
                            </select>
                          </div>
                        </div>

                        <textarea
                          rows={2}
                          value={
                            reviewFeedback[ev.id] !== undefined
                              ? reviewFeedback[ev.id]
                              : ev.retroalimentacion || ''
                          }
                          onChange={(e) =>
                            setReviewFeedback((prev) => ({
                              ...prev,
                              [ev.id]: e.target.value,
                            }))
                          }
                          placeholder="Escribe comentarios formativos, felicitaciones o puntos a reforzar en el taller..."
                          className="w-full p-2.5 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                        />

                        <div className="flex items-center justify-end gap-2 pt-1">
                          <button
                            type="button"
                            onClick={() => handleSolicitarAjusteEvidencia(ev.id)}
                            className="px-3.5 py-2 rounded-xl border border-amber-300 dark:border-amber-700 bg-amber-50 dark:bg-amber-950/40 text-amber-800 dark:text-amber-300 text-xs font-bold hover:bg-amber-100 transition-colors"
                          >
                            ⚠️ Solicitar Ajuste
                          </button>
                          <button
                            type="button"
                            onClick={() => handleAprobarEvidencia(ev.id, ev.usuario)}
                            className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-black shadow-md transition-all flex items-center gap-1.5 active:scale-95"
                          >
                            <Check className="w-3.5 h-3.5" />
                            <span>Aprobar y Otorgar Boscoints</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        )}

        {/* ======================================================== */}
        {/* STUDENT / GENERAL VIEW: LOGROS E INSIGNIAS */}
        {/* ======================================================== */}
        {activeTab === 'logros' && (
          <div className="space-y-6 animate-in fade-in duration-200">
            {/* Gamification Level Banner */}
            <div className="p-6 rounded-3xl bg-gradient-to-r from-[#176b87] via-[#103d5b] to-[#0a2337] text-white shadow-xl border border-[#2a7a9e] grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
              <div className="md:col-span-8 space-y-3">
                <div className="flex items-center gap-3">
                  <div className="w-14 h-14 rounded-2xl bg-amber-400 text-slate-950 grid place-items-center shadow-lg font-black text-2xl">
                    🏆
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h2 className="text-2xl font-black tracking-tight">
                        Nivel 5: Maestro del Pensamiento
                      </h2>
                      <span className="px-2 py-0.5 rounded-full bg-emerald-400 text-slate-950 font-black text-[10px] uppercase">
                        Rango Avanzado
                      </span>
                    </div>
                    <p className="text-xs text-white/80">
                      Continúa modelando ejercicios en BoscoIA y entregando evidencias para subir de rango.
                    </p>
                  </div>
                </div>

                {/* XP Progress Bar */}
                <div className="space-y-1.5 pt-2">
                  <div className="flex items-center justify-between text-xs font-bold">
                    <span>Progreso de Experiencia (XP)</span>
                    <span className="text-amber-300">750 / 1000 XP (75%)</span>
                  </div>
                  <div className="w-full h-3 rounded-full bg-black/30 p-0.5 overflow-hidden">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-emerald-400 via-teal-300 to-amber-300 transition-all duration-500 shadow-sm"
                      style={{ width: '75%' }}
                    />
                  </div>
                </div>
              </div>

              {/* Badges / Streak highlight */}
              <div className="md:col-span-4 flex flex-col gap-3 bg-white/10 p-4 rounded-2xl border border-white/15">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-white/80 font-semibold">Racha Activa:</span>
                  <span className="flex items-center gap-1 text-sm font-black text-amber-300">
                    <Flame className="w-4 h-4 fill-amber-400 text-amber-500" />
                    7 días seguidos
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-white/80 font-semibold">Billetera de Monedas:</span>
                  <span className="flex items-center gap-1 text-sm font-black text-amber-300">
                    <Coins className="w-4 h-4" />
                    {classCoins} Boscoints
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-white/80 font-semibold">Insignias Obtenidas:</span>
                  <span className="text-sm font-black text-emerald-300">
                    4 de 6 desbloqueadas
                  </span>
                </div>
              </div>
            </div>

            {/* Badges Showcase Grid */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-black text-slate-800 dark:text-slate-100">
                    Insignias y Medallas Didácticas
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Desbloquea condecoraciones al demostrar constancia pedagógica y habilidades socráticas.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {[
                  {
                    title: 'Mente Matemática',
                    desc: 'Resuelve 10 ejercicios de cálculo o álgebra con guía socrática de BoscoIA.',
                    icon: '🧠',
                    unlocked: true,
                    reward: '+15 Boscoints',
                    date: 'Obtenida hace 3 días',
                  },
                  {
                    title: 'Explorador Socrático',
                    desc: 'Formula 5 preguntas reflexivas sin pedir respuestas directas a la IA.',
                    icon: '🔬',
                    unlocked: true,
                    reward: '+25 Boscoints',
                    date: 'Obtenida hace 1 semana',
                  },
                  {
                    title: 'Puntualidad Salesiana',
                    desc: 'Entrega 5 tareas y talleres antes de la fecha límite programada.',
                    icon: '⏰',
                    unlocked: true,
                    reward: '+10 Boscoints',
                    date: 'Obtenida hace 2 semanas',
                  },
                  {
                    title: 'Compañero Solidario',
                    desc: 'Participa y apoya con explicaciones en el Chismógrafo académico.',
                    icon: '🌟',
                    unlocked: true,
                    reward: '+15 Boscoints',
                    date: 'Obtenida ayer',
                  },
                  {
                    title: 'Devorador de Libros',
                    desc: 'Entrega 3 ensayos analíticos en el área de Lengua Castellana y Literatura.',
                    icon: '📚',
                    unlocked: false,
                    reward: '+20 Boscoints',
                    progress: '2 / 3 entregados',
                  },
                  {
                    title: 'Creador Visual con IA',
                    desc: 'Genera 3 diagramas didácticos (como células o esquemas biológicos) con IA.',
                    icon: '🎨',
                    unlocked: false,
                    reward: '+30 Boscoints',
                    progress: '1 / 3 generados',
                  },
                ].map((b, idx) => (
                  <div
                    key={idx}
                    className={`p-5 rounded-3xl border transition-all ${
                      b.unlocked
                        ? 'bg-white dark:bg-[#0f1b29] border-emerald-200 dark:border-emerald-800/40 shadow-xs'
                        : 'bg-slate-50/70 dark:bg-slate-900/40 border-slate-200 dark:border-slate-800 opacity-80'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2 mb-3">
                      <div className="w-12 h-12 rounded-2xl bg-slate-100 dark:bg-slate-800 grid place-items-center text-2xl shadow-inner">
                        {b.icon}
                      </div>
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase ${
                          b.unlocked
                            ? 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300'
                            : 'bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                        }`}
                      >
                        {b.unlocked ? '✓ Desbloqueada' : 'Bloqueada'}
                      </span>
                    </div>

                    <h4 className="text-sm font-extrabold text-slate-800 dark:text-slate-100 mb-1">
                      {b.title}
                    </h4>
                    <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed mb-3">
                      {b.desc}
                    </p>

                    <div className="flex items-center justify-between text-[11px] pt-2 border-t border-slate-100 dark:border-slate-800 font-semibold">
                      <span className="text-amber-600 dark:text-amber-400 flex items-center gap-1 font-bold">
                        <Coins className="w-3 h-3" />
                        {b.reward}
                      </span>
                      <span className="text-slate-400">
                        {b.unlocked ? b.date : b.progress}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Weekly Quests */}
            <div className="p-6 rounded-3xl bg-white dark:bg-[#0f1b29] border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-base font-extrabold text-slate-800 dark:text-slate-100">
                    Misiones Didácticas Semanales
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Completa estos objetivos antes del domingo para ganar paquetes de Boscoints adicionales.
                  </p>
                </div>
                <span className="px-3 py-1 rounded-full text-xs font-bold bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800">
                  Semana Activa
                </span>
              </div>

              <div className="space-y-3">
                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="space-y-1">
                    <span className="font-bold text-xs text-slate-800 dark:text-slate-100 block">
                      Consultar 3 dudas complejas en BoscoIA
                    </span>
                    <span className="text-[11px] text-slate-400">
                      Usa el tutor en física o biología paso a paso.
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-xs font-black text-emerald-600 dark:text-emerald-400">
                      2 / 3 completadas
                    </span>
                    <span className="px-3 py-1 rounded-xl bg-amber-400 text-slate-950 font-black text-xs">
                      +15 BC
                    </span>
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="space-y-1">
                    <span className="font-bold text-xs text-slate-800 dark:text-slate-100 block">
                      Subir 1 evidencia de taller calificado
                    </span>
                    <span className="text-[11px] text-slate-400">
                      Entrega tu solución en la pestaña de Evidencias.
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-xs font-black text-emerald-600 dark:text-emerald-400">
                      ✓ Completada
                    </span>
                    <span className="px-3 py-1 rounded-xl bg-emerald-600 text-white font-black text-xs">
                      Reclamado
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ======================================================== */}
        {/* RANKING ESCOLAR & PODIUM */}
        {/* ======================================================== */}
        {activeTab === 'ranking' && (
          <div className="space-y-6 animate-in fade-in duration-200">
            {/* Header banner */}
            <div className="p-6 rounded-3xl bg-gradient-to-r from-[#103d5b] via-[#176b87] to-[#258ca0] text-white shadow-xl border border-[#2a7a9e] flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2 mb-1.5">
                  <span className="px-2.5 py-0.5 rounded-full bg-amber-400 text-slate-950 font-black text-[10px] uppercase tracking-wider">
                    Cuadro de Honor Institucional
                  </span>
                  <span className="text-xs text-white/70">
                    Colegio San Juan Bosco · Ranking General
                  </span>
                </div>
                <h2 className="text-2xl font-black tracking-tight">
                  Ranking y Tabla de Líderes
                </h2>
                <p className="text-xs text-white/80 max-w-2xl mt-1">
                  Reconocimiento al esfuerzo, excelencia en talleres y constancia académica. Los 3 primeros puestos reciben recompensas mensuales especiales en el Mercado CC.
                </p>
              </div>
            </div>

            {/* Top 3 Podium */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4">
              {/* 2nd Place */}
              <div className="order-2 sm:order-1 p-5 rounded-3xl bg-white dark:bg-[#0f1b29] border-2 border-slate-300 dark:border-slate-700 shadow-md text-center space-y-3 relative flex flex-col items-center">
                <span className="absolute -top-3 px-3 py-0.5 rounded-full bg-slate-300 text-slate-800 font-black text-xs shadow-sm">
                  🥈 2° Puesto · Plata
                </span>
                <img
                  src="https://api.dicebear.com/7.x/initials/svg?seed=Luis%20Perez&backgroundColor=475569"
                  alt="2do Lugar"
                  className="w-16 h-16 rounded-full border-4 border-slate-300 dark:border-slate-700 object-cover mt-2 shadow-md"
                />
                <div>
                  <h4 className="text-base font-extrabold text-slate-800 dark:text-slate-100">Luis Pérez</h4>
                  <p className="text-xs text-slate-500">Grado 11-B</p>
                </div>
                <div className="p-2.5 w-full rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-center justify-center gap-1.5 text-xs font-black text-amber-500">
                  <Coins className="w-4 h-4" />
                  <span>210 Boscoints</span>
                </div>
              </div>

              {/* 1st Place (Gold) */}
              <div className="order-1 sm:order-2 p-6 rounded-3xl bg-gradient-to-b from-amber-50 to-white dark:from-[#1f1d13] dark:to-[#0f1b29] border-3 border-amber-400 shadow-xl text-center space-y-3 relative flex flex-col items-center scale-105">
                <span className="absolute -top-3.5 px-4 py-1 rounded-full bg-gradient-to-r from-amber-400 to-yellow-300 text-slate-950 font-black text-xs shadow-md">
                  👑 1° Puesto · Oro
                </span>
                <img
                  src="https://api.dicebear.com/7.x/initials/svg?seed=Ana%20Garcia&backgroundColor=eab308"
                  alt="1er Lugar"
                  className="w-20 h-20 rounded-full border-4 border-amber-400 object-cover mt-2 shadow-lg"
                />
                <div>
                  <h4 className="text-lg font-black text-slate-800 dark:text-slate-100">Ana García</h4>
                  <p className="text-xs text-slate-500">Grado 11-A</p>
                </div>
                <div className="p-3 w-full rounded-2xl bg-amber-100/60 dark:bg-amber-950/50 border border-amber-300 dark:border-amber-800 flex items-center justify-center gap-1.5 text-sm font-black text-amber-700 dark:text-amber-300">
                  <Coins className="w-4 h-4" />
                  <span>260 Boscoints</span>
                </div>
              </div>

              {/* 3rd Place */}
              <div className="order-3 p-5 rounded-3xl bg-white dark:bg-[#0f1b29] border-2 border-amber-600/40 dark:border-amber-800/40 shadow-md text-center space-y-3 relative flex flex-col items-center">
                <span className="absolute -top-3 px-3 py-0.5 rounded-full bg-amber-600/20 text-amber-800 dark:text-amber-300 font-black text-xs shadow-sm">
                  🥉 3° Puesto · Bronce
                </span>
                <img
                  src="https://api.dicebear.com/7.x/initials/svg?seed=Mateo%20Gomez&backgroundColor=92400e"
                  alt="3er Lugar"
                  className="w-16 h-16 rounded-full border-4 border-amber-600/40 object-cover mt-2 shadow-md"
                />
                <div>
                  <h4 className="text-base font-extrabold text-slate-800 dark:text-slate-100">Mateo Gómez</h4>
                  <p className="text-xs text-slate-500">Grado 10-A</p>
                </div>
                <div className="p-2.5 w-full rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-center justify-center gap-1.5 text-xs font-black text-amber-500">
                  <Coins className="w-4 h-4" />
                  <span>180 Boscoints</span>
                </div>
              </div>
            </div>

            {/* Complete Ranking Table */}
            <div className="p-5 rounded-3xl bg-white dark:bg-[#0f1b29] border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
              <h3 className="text-base font-extrabold text-slate-800 dark:text-slate-100">
                Tabla General de Estudiantes
              </h3>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-400 font-bold uppercase tracking-wider text-[10px]">
                      <th className="py-3 px-3"># Pos</th>
                      <th className="py-3 px-3">Estudiante</th>
                      <th className="py-3 px-3">Grado</th>
                      <th className="py-3 px-3">Racha</th>
                      <th className="py-3 px-3">Evidencias</th>
                      <th className="py-3 px-3 text-right">Boscoints</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-150 dark:divide-slate-800">
                    {[
                      { pos: 1, name: 'Ana García', user: 'ana', grade: '11-A', streak: 12, ev: 6, coins: 260 },
                      { pos: 2, name: 'Luis Pérez', user: 'luis', grade: '11-B', streak: 9, ev: 5, coins: 210 },
                      { pos: 3, name: 'Mateo Gómez', user: 'mateo', grade: '10-A', streak: 8, ev: 4, coins: 180 },
                      { pos: 4, name: 'Camila Rodríguez', user: 'camila', grade: '11-A', streak: 6, ev: 4, coins: 155 },
                      { pos: 5, name: userSession.name, user: username, grade: 'Bachillerato', streak: 7, ev: evidencias.length, coins: classCoins, isSelf: true },
                      { pos: 6, name: 'Santiago Morales', user: 'santiago', grade: '10-B', streak: 4, ev: 3, coins: 95 },
                    ].map((row, idx) => (
                      <tr
                        key={idx}
                        className={`transition-colors ${
                          row.isSelf
                            ? 'bg-emerald-50/70 dark:bg-emerald-950/30 font-bold'
                            : 'hover:bg-slate-50 dark:hover:bg-slate-800/40'
                        }`}
                      >
                        <td className="py-3 px-3 font-mono font-bold text-slate-500">
                          {row.pos === 1 ? '🥇 1' : row.pos === 2 ? '🥈 2' : row.pos === 3 ? '🥉 3' : `#${row.pos}`}
                        </td>
                        <td className="py-3 px-3">
                          <div className="flex items-center gap-2">
                            <img
                              src={`https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(
                                row.name
                              )}&backgroundColor=176b87`}
                              alt={row.name}
                              className="w-7 h-7 rounded-full border border-slate-200 dark:border-slate-700 object-cover"
                            />
                            <div>
                              <span className="font-extrabold text-slate-800 dark:text-slate-100 block">
                                {row.name} {row.isSelf && <span className="ml-1 text-[10px] text-emerald-600 dark:text-emerald-400 font-black">(Tú)</span>}
                              </span>
                              <span className="text-[10px] text-slate-400">@{row.user}</span>
                            </div>
                          </div>
                        </td>
                        <td className="py-3 px-3 text-slate-600 dark:text-slate-300">{row.grade}</td>
                        <td className="py-3 px-3 text-amber-500 font-bold">🔥 {row.streak} días</td>
                        <td className="py-3 px-3 text-slate-600 dark:text-slate-300">{row.ev} entregas</td>
                        <td className="py-3 px-3 text-right font-black text-amber-600 dark:text-amber-400">
                          {row.coins} BC
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ======================================================== */}
        {/* DIRECTORIO DE PERSONAS, DOCENTES Y DIRECTIVOS */}
        {/* ======================================================== */}
        {(activeTab === 'admin_personas' || activeTab === 'personas') && (
          <div className="space-y-6 animate-in fade-in duration-200">
            {/* Header banner */}
            <div className="p-6 rounded-3xl bg-gradient-to-r from-[#103d5b] via-[#176b87] to-[#1e587a] text-white shadow-xl border border-[#2a7a9e] flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2 mb-1.5">
                  <span className="px-2.5 py-0.5 rounded-full bg-emerald-400 text-slate-950 font-black text-[10px] uppercase tracking-wider">
                    Comunidad Educativa
                  </span>
                  <span className="text-xs text-white/70">
                    {userSession.institutionName || 'Colegio San Juan Bosco'}
                  </span>
                </div>
                <h2 className="text-2xl font-black tracking-tight">
                  Directorio de Personas y Docentes
                </h2>
                <p className="text-xs text-white/80 max-w-2xl mt-1">
                  Encuentra a tus profesores, directivos y compañeros de salón. Consulta especialidades académicas, correos institucionales y asignaturas a cargo.
                </p>
              </div>

              {isTeacherOrAdmin && (
                <button
                  type="button"
                  onClick={() => {
                    setPreselectedStudent(null);
                    setIsGrantModalOpen(true);
                  }}
                  className="px-4 py-2.5 rounded-2xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-xs shadow-md transition-all flex items-center gap-2 shrink-0"
                >
                  <Coins className="w-4 h-4" />
                  <span>+ Otorgar Boscoints</span>
                </button>
              )}
            </div>

            {/* Real Platform Statistics Live Counters */}
            <div className="p-4 rounded-3xl bg-white dark:bg-[#101c18] border-2 border-red-200 dark:border-red-950 shadow-xs space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-red-700 dark:text-red-400 uppercase tracking-wide flex items-center gap-1.5">
                  <span>📊 Cifras Reales en la Plataforma</span>
                </span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 font-bold border border-emerald-200 dark:border-emerald-800">
                  Auditado en Tiempo Real
                </span>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center text-xs">
                <div className="p-2.5 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                  <strong className="block text-xl font-black text-slate-900 dark:text-white">
                    {platformStats.totalPersonas}
                  </strong>
                  <span className="text-[10px] text-slate-500 dark:text-slate-400">Total Personas Registradas</span>
                </div>
                <div className="p-2.5 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                  <strong className="block text-xl font-black text-[#D32F2F]">
                    {platformStats.totalEstudiantes}
                  </strong>
                  <span className="text-[10px] text-slate-500 dark:text-slate-400">Estudiantes Reales</span>
                </div>
                <div className="p-2.5 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                  <strong className="block text-xl font-black text-amber-600 dark:text-amber-400">
                    {platformStats.totalProfesores}
                  </strong>
                  <span className="text-[10px] text-slate-500 dark:text-slate-400">Docentes Reales</span>
                </div>
                <div className="p-2.5 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                  <strong className="block text-xl font-black text-sky-600 dark:text-sky-400">
                    {platformStats.totalEscuelas}
                  </strong>
                  <span className="text-[10px] text-slate-500 dark:text-slate-400">Instituciones Conectadas</span>
                </div>
              </div>
            </div>

            {/* Filter & Search Bar */}
            <div className="p-4 rounded-3xl bg-white dark:bg-[#0f1b29] border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3">
              <div className="relative w-full sm:w-80">
                <Search className="w-4 h-4 text-slate-500 dark:text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={personasSearch}
                  onChange={(e) => setPersonasSearch(e.target.value)}
                  placeholder="Buscar por nombre, correo o materia..."
                  className="w-full pl-9 pr-3 py-2 text-xs rounded-2xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 placeholder:text-slate-500 dark:placeholder:text-slate-400 font-medium focus:outline-none focus:ring-2 focus:ring-red-500"
                />
              </div>

              {/* Filter Pills */}
              <div className="flex items-center gap-1.5 w-full sm:w-auto overflow-x-auto text-xs font-bold">
                {[
                  { id: 'todos', label: 'Todos' },
                  { id: 'profesores', label: '👨‍🏫 Docentes' },
                  { id: 'directivos', label: '🏛️ Directivos' },
                  { id: 'estudiantes', label: '🎓 Estudiantes' },
                ].map((f) => (
                  <button
                    key={f.id}
                    type="button"
                    onClick={() => setPersonasFilter(f.id as any)}
                    className={`px-3 py-1.5 rounded-xl transition-all ${
                      personasFilter === f.id
                        ? 'bg-[#176b87] text-white shadow-xs'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
                    }`}
                  >
                    {f.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Directory Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {ClassPointService.getUsers()
                .filter((u) => {
                  const q = personasSearch.toLowerCase().trim();
                  const matchSearch =
                    !q ||
                    u.nombre.toLowerCase().includes(q) ||
                    u.usuario.toLowerCase().includes(q) ||
                    (u.email && u.email.toLowerCase().includes(q)) ||
                    (u.especialidad && u.especialidad.toLowerCase().includes(q));

                  const matchRole =
                    personasFilter === 'todos' ||
                    (personasFilter === 'profesores' && u.rol === 'profesor') ||
                    (personasFilter === 'directivos' && (u.rol === 'administrador' || u.rol === 'creadorOriginal')) ||
                    (personasFilter === 'estudiantes' && u.rol === 'estudiante');

                  return matchSearch && matchRole;
                })
                .map((user, idx) => {
                  const isTeacher = user.rol === 'profesor';
                  const isDirector = user.rol === 'administrador';
                  const isCreator = user.rol === 'creadorOriginal';
                  return (
                    <div
                      key={idx}
                      className="p-5 rounded-3xl bg-white dark:bg-[#0f1b29] border border-slate-200 dark:border-slate-800 shadow-xs hover:shadow-md transition-all space-y-3"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-center gap-3">
                          <img
                            src={
                              user.avatar ||
                              `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(
                                user.nombre
                              )}&backgroundColor=${isTeacher ? '176b87' : isDirector ? '7c3aed' : '059669'}`
                            }
                            alt={user.nombre}
                            className="w-12 h-12 rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-100 object-cover shrink-0"
                          />
                          <div>
                            <h4 className="text-sm font-extrabold text-slate-800 dark:text-slate-100">
                              {user.nombre}
                            </h4>
                            <span className="text-[11px] text-slate-400">@{user.usuario}</span>
                          </div>
                        </div>

                        <span
                          className={`px-2.5 py-0.5 rounded-lg text-[10px] font-black uppercase tracking-wider ${
                            isCreator
                              ? 'bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 border border-amber-300'
                              : isDirector
                              ? 'bg-purple-100 dark:bg-purple-950/60 text-purple-800 dark:text-purple-300 border border-purple-300'
                              : isTeacher
                              ? 'bg-blue-100 dark:bg-blue-950/60 text-blue-800 dark:text-blue-300 border border-blue-300'
                              : 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border border-emerald-300'
                          }`}
                        >
                          {isCreator ? 'Creador Original' : isDirector ? 'Director' : isTeacher ? 'Docente' : 'Estudiante'}
                        </span>
                      </div>

                      {user.especialidad && (
                        <p className="text-xs text-indigo-700 dark:text-indigo-300 font-semibold bg-indigo-50/70 dark:bg-indigo-950/40 p-2.5 rounded-xl border border-indigo-100 dark:border-indigo-800/40">
                          🎓 {user.especialidad}
                        </p>
                      )}

                      <div className="space-y-1 text-xs text-slate-600 dark:text-slate-400 pt-1 border-t border-slate-100 dark:border-slate-800">
                        {user.email && (
                          <div className="flex items-center gap-1.5 truncate">
                            <span className="text-slate-400">✉️</span>
                            <span className="truncate">{user.email}</span>
                          </div>
                        )}
                        {user.institucion && (
                          <div className="flex items-center gap-1.5 truncate text-[11px]">
                            <span className="text-slate-400">🏫</span>
                            <span className="truncate">{user.institucion}</span>
                          </div>
                        )}
                      </div>

                      {/* Quick Award Coins Button for Students */}
                      {user.rol === 'estudiante' && isTeacherOrAdmin && (
                        <div className="pt-2">
                          <button
                            type="button"
                            onClick={() => {
                              setPreselectedStudent({ usuario: user.usuario, nombre: user.nombre });
                              setIsGrantModalOpen(true);
                            }}
                            className="w-full py-2 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-xs flex items-center justify-center gap-1.5 shadow-xs transition-colors"
                          >
                            <Coins className="w-3.5 h-3.5" />
                            <span>Otorgar Boscoints</span>
                          </button>
                        </div>
                      )}
                    </div>
                  );
                })}
            </div>
          </div>
        )}
      </main>

      {/* ======================================================== */}
      {/* MODAL: SUBIR NUEVA EVIDENCIA (STUDENT) */}
      {/* ======================================================== */}
      {isNewEvidenceModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="relative w-full max-w-lg bg-white dark:bg-[#0e1724] text-slate-800 dark:text-slate-100 rounded-3xl p-6 shadow-2xl border border-slate-200 dark:border-slate-700">
            <button
              type="button"
              onClick={() => setIsNewEvidenceModalOpen(false)}
              className="absolute top-4 right-4 p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-2xl bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 grid place-items-center shrink-0">
                <FolderPlus className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-extrabold text-slate-900 dark:text-white">
                  Subir Nueva Evidencia de Aprendizaje
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Selecciona tu profesor, asignatura y adjunta tu trabajo.
                </p>
              </div>
            </div>

            <form onSubmit={handleCrearEvidencia} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Título de la Evidencia o Taller:
                </label>
                <input
                  type="text"
                  required
                  value={evidenciaTitulo}
                  onChange={(e) => setEvidenciaTitulo(e.target.value)}
                  placeholder="Ej: Taller 3 - Comparativa de Célula Eucariota y Procariota"
                  className="w-full p-2.5 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Asignatura:
                  </label>
                  <select
                    value={evidenciaMateria}
                    onChange={(e) => setEvidenciaMateria(e.target.value)}
                    className="w-full p-2.5 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-semibold"
                  >
                    <option value="Matemáticas y Álgebra">Matemáticas y Álgebra</option>
                    <option value="Física Mecánica y Óptica">Física Mecánica y Óptica</option>
                    <option value="Biología y Química Orgánica">Biología y Química Orgánica</option>
                    <option value="Lengua Castellana y Literatura">Lengua Castellana y Literatura</option>
                    <option value="Filosofía y Ética Socrática">Filosofía y Ética Socrática</option>
                    <option value="Tecnología e Informática">Tecnología e Informática</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Profesor Receptor:
                  </label>
                  <select
                    value={evidenciaProfesor}
                    onChange={(e) => setEvidenciaProfesor(e.target.value)}
                    className="w-full p-2.5 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-semibold"
                  >
                    <option value="Lic. Andrés Caicedo">Lic. Andrés Caicedo (Matemáticas)</option>
                    <option value="Dra. María Elena Restrepo">Dra. María Elena Restrepo (Biología)</option>
                    <option value="Ing. Carlos Mendoza">Ing. Carlos Mendoza (Física)</option>
                    <option value="Padre Javier Restrepo">Padre Javier Restrepo (Filosofía)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Descripción o Notas Pedagógicas:
                </label>
                <textarea
                  rows={3}
                  value={evidenciaDescripcion}
                  onChange={(e) => setEvidenciaDescripcion(e.target.value)}
                  placeholder="Detalla cómo resolviste el ejercicio, las dudas aclaradas con BoscoIA y tu conclusión..."
                  className="w-full p-2.5 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Archivo Adjunto (Simulado):
                  </label>
                  <input
                    type="text"
                    value={evidenciaArchivoNombre}
                    onChange={(e) => setEvidenciaArchivoNombre(e.target.value)}
                    placeholder="taller_resuelto.pdf"
                    className="w-full p-2.5 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Enlace de Google Drive / Canva (Opcional):
                  </label>
                  <input
                    type="url"
                    value={evidenciaEnlace}
                    onChange={(e) => setEvidenciaEnlace(e.target.value)}
                    placeholder="https://drive.google.com/..."
                    className="w-full p-2.5 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-200 dark:border-slate-700">
                <button
                  type="button"
                  onClick={() => setIsNewEvidenceModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-bold text-slate-600 dark:text-slate-300"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400 text-white font-black text-xs shadow-md transition-all active:scale-95"
                >
                  Entregar Evidencia
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* MODAL: CREAR NUEVA AULA (TEACHERS & DIRECTORS) */}
      {/* ======================================================== */}
      {isNewAulaModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="relative w-full max-w-lg bg-white dark:bg-[#0e1724] text-slate-800 dark:text-slate-100 rounded-3xl p-6 shadow-2xl border-2 border-red-200 dark:border-red-900/60 max-h-[92vh] overflow-y-auto">
            <button
              type="button"
              onClick={() => setIsNewAulaModalOpen(false)}
              className="absolute top-4 right-4 p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-2xl bg-red-600 text-white grid place-items-center shrink-0 shadow-md">
                <School className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-extrabold text-slate-900 dark:text-white">
                  Crear Nueva Aula / Salón de Clase
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Configura el salón, horario y genera el código de acceso para tus alumnos.
                </p>
              </div>
            </div>

            <form onSubmit={handleCrearAula} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Nombre del Aula / Salón:
                </label>
                <input
                  type="text"
                  required
                  value={nuevaAulaNombre}
                  onChange={(e) => setNuevaAulaNombre(e.target.value)}
                  placeholder="Ej: Aula 103 - Álgebra y Trigonometría 9°B"
                  className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-red-600"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Materia Asignada:
                  </label>
                  <select
                    value={nuevaAulaMateria}
                    onChange={(e) => setNuevaAulaMateria(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-semibold"
                  >
                    <option value="Matemáticas y Álgebra">Matemáticas y Álgebra</option>
                    <option value="Física Mecánica y Óptica">Física Mecánica y Óptica</option>
                    <option value="Biología Celular y Genética">Biología Celular y Genética</option>
                    <option value="Lengua Castellana y Literatura">Lengua Castellana y Literatura</option>
                    <option value="Filosofía y Ética">Filosofía y Ética</option>
                    <option value="Informática y Robótica">Informática y Robótica</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Grado Escolar:
                  </label>
                  <select
                    value={nuevaAulaGrado}
                    onChange={(e) => setNuevaAulaGrado(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-semibold"
                  >
                    <option value="Grado 6°">Grado 6°</option>
                    <option value="Grado 7°">Grado 7°</option>
                    <option value="Grado 8°">Grado 8°</option>
                    <option value="Grado 9°">Grado 9°</option>
                    <option value="Grado 10°">Grado 10°</option>
                    <option value="Grado 11°">Grado 11°</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Horario Semanal:
                  </label>
                  <input
                    type="text"
                    value={nuevaAulaHorario}
                    onChange={(e) => setNuevaAulaHorario(e.target.value)}
                    placeholder="Lunes y Miércoles · 8:00 - 10:00"
                    className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Código de Acceso (Opcional):
                  </label>
                  <input
                    type="text"
                    value={nuevaAulaCodigo}
                    onChange={(e) => setNuevaAulaCodigo(e.target.value.toUpperCase())}
                    placeholder="Ej: CP-ALG-9B (auto si vacío)"
                    className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-mono uppercase font-bold"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Descripción o Mensaje de Bienvenida:
                </label>
                <textarea
                  rows={2}
                  value={nuevaAulaDesc}
                  onChange={(e) => setNuevaAulaDesc(e.target.value)}
                  placeholder="Bienvenidos al aula de matemáticas. Aquí compartiremos talleres, evidencias y planes de estudio..."
                  className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-200 dark:border-slate-700">
                <button
                  type="button"
                  onClick={() => setIsNewAulaModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 font-bold text-slate-600 dark:text-slate-300"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-700 hover:to-rose-700 text-white font-black shadow-md transition-all active:scale-95 flex items-center gap-1.5"
                >
                  <Plus className="w-4 h-4" />
                  <span>Crear Aula</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* MODAL: CREAR NUEVO PLAN DE ESTUDIO (TEACHERS & DIRECTORS) */}
      {/* ======================================================== */}
      {isNewPlanModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="relative w-full max-w-2xl bg-white dark:bg-[#0e1724] text-slate-800 dark:text-slate-100 rounded-3xl p-6 shadow-2xl border-2 border-amber-300 dark:border-amber-900/60 max-h-[92vh] overflow-y-auto">
            <button
              type="button"
              onClick={() => setIsNewPlanModalOpen(false)}
              className="absolute top-4 right-4 p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-amber-500 to-yellow-400 text-slate-950 grid place-items-center shrink-0 shadow-md font-bold">
                <Compass className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-extrabold text-slate-900 dark:text-white">
                  Crear Nuevo Plan de Estudio / Malla Curricular
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Establece temarios semanales y elige si es visible para los estudiantes o confidencial.
                </p>
              </div>
            </div>

            <form onSubmit={handleCrearPlanEstudio} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Título del Plan de Estudio:
                </label>
                <input
                  type="text"
                  required
                  value={nuevoPlanTitulo}
                  onChange={(e) => setNuevoPlanTitulo(e.target.value)}
                  placeholder="Ej: Malla Curricular: Factorización, Fracciones y Ecuaciones Lineales"
                  className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Materia:
                  </label>
                  <select
                    value={nuevoPlanMateria}
                    onChange={(e) => setNuevoPlanMateria(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-semibold"
                  >
                    <option value="Matemáticas y Álgebra">Matemáticas y Álgebra</option>
                    <option value="Física Mecánica y Óptica">Física Mecánica y Óptica</option>
                    <option value="Biología Celular y Genética">Biología Celular y Genética</option>
                    <option value="Lengua Castellana y Literatura">Lengua Castellana y Literatura</option>
                    <option value="Filosofía y Ética Socrática">Filosofía y Ética Socrática</option>
                    <option value="Informática Educativa">Informática Educativa</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Grado:
                  </label>
                  <select
                    value={nuevoPlanGrado}
                    onChange={(e) => setNuevoPlanGrado(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-semibold"
                  >
                    <option value="Grado 6°">Grado 6°</option>
                    <option value="Grado 7°">Grado 7°</option>
                    <option value="Grado 8°">Grado 8°</option>
                    <option value="Grado 9°">Grado 9°</option>
                    <option value="Grado 10°">Grado 10°</option>
                    <option value="Grado 11°">Grado 11°</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Periodo Académico:
                  </label>
                  <select
                    value={nuevoPlanPeriodo}
                    onChange={(e) => setNuevoPlanPeriodo(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-semibold"
                  >
                    <option value="Primer Periodo · 2026">Primer Periodo · 2026</option>
                    <option value="Segundo Periodo · 2026">Segundo Periodo · 2026</option>
                    <option value="Tercer Periodo · 2026">Tercer Periodo · 2026</option>
                    <option value="Cuarto Periodo · 2026">Cuarto Periodo · 2026</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Descripción Pedagógica / Enfoque Didáctico:
                </label>
                <textarea
                  rows={2}
                  value={nuevoPlanDesc}
                  onChange={(e) => setNuevoPlanDesc(e.target.value)}
                  placeholder="Describe la metodología didáctica, el uso de BoscoIA para resolución guiada y las competencias centrales..."
                  className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Objetivos de Aprendizaje (uno por línea):
                </label>
                <textarea
                  rows={3}
                  value={nuevoPlanObjetivos}
                  onChange={(e) => setNuevoPlanObjetivos(e.target.value)}
                  placeholder="Comprender los conceptos fundamentales...&#10;Aplicar procedimientos con rigor...&#10;Resolver problemas con apoyo de BoscoIA..."
                  className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-mono"
                />
              </div>

              {/* Units inputs */}
              <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 space-y-3">
                <span className="font-bold text-slate-700 dark:text-slate-200 block">
                  Unidades Temáticas Iniciales:
                </span>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-500 mb-0.5">
                      Unidad 1 (Semanas 1-3):
                    </label>
                    <input
                      type="text"
                      value={nuevoPlanSemana1Tema}
                      onChange={(e) => setNuevoPlanSemana1Tema(e.target.value)}
                      placeholder="Tema de Unidad 1"
                      className="w-full p-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-500 mb-0.5">
                      Descripción / Talleres Unidad 1:
                    </label>
                    <input
                      type="text"
                      value={nuevoPlanSemana1Desc}
                      onChange={(e) => setNuevoPlanSemana1Desc(e.target.value)}
                      placeholder="Ejercicios prácticos e inducción teórica"
                      className="w-full p-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-500 mb-0.5">
                      Unidad 2 (Semanas 4-8):
                    </label>
                    <input
                      type="text"
                      value={nuevoPlanSemana2Tema}
                      onChange={(e) => setNuevoPlanSemana2Tema(e.target.value)}
                      placeholder="Tema de Unidad 2"
                      className="w-full p-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-500 mb-0.5">
                      Descripción / Talleres Unidad 2:
                    </label>
                    <input
                      type="text"
                      value={nuevoPlanSemana2Desc}
                      onChange={(e) => setNuevoPlanSemana2Desc(e.target.value)}
                      placeholder="Modelación y problemas avanzados"
                      className="w-full p-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                    />
                  </div>
                </div>
              </div>

              {/* CRITICAL TOGGLE: Visible para estudiantes vs Confidencial */}
              <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border-2 border-amber-300 dark:border-amber-800 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {nuevoPlanVisibleEstudiantes ? (
                      <Eye className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                    ) : (
                      <Lock className="w-5 h-5 text-amber-700 dark:text-amber-400" />
                    )}
                    <div>
                      <span className="font-extrabold text-slate-900 dark:text-white block">
                        {nuevoPlanVisibleEstudiantes
                          ? '👁️ Visible para los estudiantes'
                          : '🔒 Confidencial Docente (Oculto para Alumnos)'}
                      </span>
                      <span className="text-[11px] text-slate-600 dark:text-slate-300">
                        Los directores SIEMPRE podrán supervisar este plan de estudio.
                      </span>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => setNuevoPlanVisibleEstudiantes(!nuevoPlanVisibleEstudiantes)}
                    className={`w-12 h-6 flex items-center rounded-full p-1 transition-colors ${
                      nuevoPlanVisibleEstudiantes ? 'bg-emerald-600' : 'bg-slate-400'
                    }`}
                  >
                    <div
                      className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform ${
                        nuevoPlanVisibleEstudiantes ? 'translate-x-6' : 'translate-x-0'
                      }`}
                    />
                  </button>
                </div>

                <p className="text-[10px] text-amber-900 dark:text-amber-200 leading-relaxed pt-1">
                  ℹ️ <strong>Regla institucional:</strong> Si desactivas esta opción, los estudiantes no verán el temario en su pantalla. Sin embargo, los directores y coordinadores tendrán acceso completo para la supervisión y auditoría de la calidad educativa.
                </p>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-200 dark:border-slate-700">
                <button
                  type="button"
                  onClick={() => setIsNewPlanModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 font-bold text-slate-600 dark:text-slate-300"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-400 hover:from-amber-400 hover:to-yellow-300 text-slate-950 font-black shadow-md transition-all active:scale-95 flex items-center gap-1.5"
                >
                  <Save className="w-4 h-4" />
                  <span>Guardar Plan de Estudio</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* MODAL: VER DETALLE COMPLETO DEL PLAN DE ESTUDIO */}
      {/* ======================================================== */}
      {selectedPlanDetalle && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="relative w-full max-w-2xl bg-white dark:bg-[#0e1724] text-slate-800 dark:text-slate-100 rounded-3xl p-6 shadow-2xl border-2 border-red-200 dark:border-red-900/60 max-h-[92vh] overflow-y-auto space-y-4">
            <button
              type="button"
              onClick={() => setSelectedPlanDetalle(null)}
              className="absolute top-4 right-4 p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-2 flex-wrap pt-1">
              <span className="px-3 py-1 rounded-full text-xs font-bold bg-red-100 dark:bg-red-950 text-red-800 dark:text-red-300 border border-red-300 dark:border-red-800">
                {selectedPlanDetalle.materia} · {selectedPlanDetalle.grado}
              </span>
              <span className="px-3 py-1 rounded-full text-xs font-bold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200">
                {selectedPlanDetalle.periodo || 'Periodo Escolar'}
              </span>
              {selectedPlanDetalle.visibleParaEstudiantes ? (
                <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 flex items-center gap-1">
                  <Eye className="w-3.5 h-3.5" />
                  <span>Visible para Estudiantes</span>
                </span>
              ) : (
                <span className="px-3 py-1 rounded-full text-xs font-bold bg-amber-100 dark:bg-amber-950 text-amber-900 dark:text-amber-200 flex items-center gap-1">
                  <Lock className="w-3.5 h-3.5" />
                  <span>Confidencial (Visible para Directores)</span>
                </span>
              )}
            </div>

            <div>
              <h2 className="text-xl font-black text-slate-900 dark:text-white">
                {selectedPlanDetalle.titulo}
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                Profesor: <strong>{selectedPlanDetalle.profesor}</strong> · Institución: {selectedPlanDetalle.institucion || 'Colegio San Juan Bosco'}
              </p>
              <p className="text-xs text-slate-700 dark:text-slate-200 mt-2 leading-relaxed bg-slate-50 dark:bg-slate-900/60 p-3 rounded-2xl border border-slate-200 dark:border-slate-800">
                {selectedPlanDetalle.descripcion}
              </p>
            </div>

            {/* Learning Objectives */}
            <div>
              <h4 className="text-xs font-black uppercase text-slate-400 tracking-wider mb-2">
                Objetivos de Aprendizaje:
              </h4>
              <ul className="space-y-1.5 pl-4 list-disc text-xs text-slate-700 dark:text-slate-300">
                {selectedPlanDetalle.objetivos.map((obj, i) => (
                  <li key={i}>{obj}</li>
                ))}
              </ul>
            </div>

            {/* Weekly thematic units */}
            <div className="space-y-3">
              <h4 className="text-xs font-black uppercase text-slate-400 tracking-wider">
                Unidades Temáticas y Cronograma:
              </h4>

              <div className="space-y-3">
                {selectedPlanDetalle.unidades.map((u, i) => (
                  <div
                    key={i}
                    className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 space-y-1.5 text-xs"
                  >
                    <div className="flex items-center justify-between text-red-700 dark:text-red-400 font-extrabold text-xs">
                      <span>{u.semana}</span>
                      {u.competencias && (
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-red-100 dark:bg-red-950 text-red-800 dark:text-red-200">
                          {u.competencias}
                        </span>
                      )}
                    </div>
                    <h5 className="font-bold text-slate-900 dark:text-white text-sm">{u.tema}</h5>
                    <p className="text-slate-600 dark:text-slate-300">{u.descripcion}</p>
                    {u.recursos && (
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 italic pt-1">
                        Recursos sugeridos: {u.recursos}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Modal footer */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-3 border-t border-slate-200 dark:border-slate-800">
              <button
                type="button"
                onClick={() => {
                  setSelectedPlanDetalle(null);
                  setActiveTab('boscoia');
                  onOpenBoscoIA(
                    `Hola BoscoIA, por favor enséñame paso a paso los temas del plan de ${selectedPlanDetalle.materia}: "${selectedPlanDetalle.titulo}". Desglosa explicaciones pedagógicas e ilustraciones científicas.`
                  );
                }}
                className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-700 hover:to-rose-700 text-white font-bold text-xs shadow-md flex items-center justify-center gap-1.5"
              >
                <Sparkles className="w-4 h-4 text-amber-300" />
                <span>Estudiar con BoscoIA</span>
              </button>

              <button
                type="button"
                onClick={() => setSelectedPlanDetalle(null)}
                className="w-full sm:w-auto px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-bold text-slate-600 dark:text-slate-300"
              >
                Cerrar Temario
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* MODAL: CONFIGURACIÓN DE PERFIL (USUARIO, CONTRASEÑA, ETC.) */}
      {/* ======================================================== */}
      <ProfileSettingsModal
        isOpen={isProfileModalOpen}
        onClose={() => setIsProfileModalOpen(false)}
        userSession={userSession}
        onUpdateSession={(updatedSession: UserSession) => {
          if (onUpdateUserSession) {
            onUpdateUserSession(updatedSession);
          }
          refreshAllData();
        }}
        theme={theme}
        onToggleTheme={onToggleTheme}
      />

      {/* Floating Smart BoscoIA Assistant Trigger */}
      {activeTab !== 'boscoia' && (
        <div className="fixed bottom-5 right-5 z-40 flex flex-col items-end">
          <button
            type="button"
            onClick={() => setActiveTab('boscoia')}
            className="px-4 py-3 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs shadow-xl flex items-center gap-2.5 transition-transform hover:scale-105 active:scale-95 border-2 border-white"
          >
            <div className="w-6 h-6 rounded-lg bg-white/20 grid place-items-center">
              <Sparkles className="w-4 h-4" />
            </div>
            <span>BoscoIA Tutor</span>
            {boscoConfig.isLocked && <Lock className="w-3.5 h-3.5 text-amber-300" />}
          </button>
        </div>
      )}

      {/* Modal to Grant Boscoints */}
      <GrantBoscointsModal
        isOpen={isGrantModalOpen}
        onClose={() => setIsGrantModalOpen(false)}
        currentUserRole={role as any}
        currentUserName={userSession.name}
        currentUserInstitution={userSession.institutionName || 'Colegio San Juan Bosco'}
        preselectedStudent={preselectedStudent}
        onGrantSuccess={refreshAllData}
      />

      {/* Fullscreen BoscoIA Immersive View */}
      {isBoscoIAFullScreen && (
        <div className="fixed inset-0 z-50 bg-[#0c0a09] dark:bg-[#060807] flex flex-col animate-in fade-in duration-200">
          <div className="px-4 py-2 bg-gradient-to-r from-[#7f1d1d] via-[#991b1b] to-[#dc2626] text-white flex items-center justify-between border-b-2 border-amber-400 shrink-0 shadow-lg">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-white p-0.5 grid place-items-center shrink-0 border border-amber-300">
                <img
                  src="/assets/aistudio/image_c159dc3e.png"
                  alt="BoscoClass"
                  className="w-full h-full object-contain"
                />
              </div>
              <div>
                <span className="font-black text-xs sm:text-sm text-white">
                  BoscoIA Tutor · Modo Pantalla Completa
                </span>
                <span className="hidden sm:inline-block ml-2 text-[10px] text-amber-200">
                  Resolución interactiva con ilustraciones creadas por IA y KaTeX
                </span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {onToggleTheme && (
                <button
                  type="button"
                  onClick={onToggleTheme}
                  className="p-1.5 rounded-lg bg-black/20 hover:bg-black/30 text-white text-xs transition-colors"
                  title="Alternar tema"
                >
                  {theme === 'dark' ? <Sun className="w-3.5 h-3.5" /> : <Moon className="w-3.5 h-3.5" />}
                </button>
              )}
              <button
                type="button"
                onClick={() => setIsBoscoIAFullScreen(false)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/20 hover:bg-white/30 text-white font-black text-xs transition-colors shadow-xs"
              >
                <Minimize2 className="w-3.5 h-3.5" />
                <span>Salir de Pantalla Completa</span>
              </button>
            </div>
          </div>
          <div className="flex-1 min-h-0 p-2 sm:p-4 overflow-hidden">
            {renderBoscoIATutor()}
          </div>
        </div>
      )}

      {/* Modal: Publicar Aviso Institucional */}
      {isNewAnuncioModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="relative w-full max-w-lg bg-white dark:bg-[#0e1724] text-slate-800 dark:text-slate-100 rounded-3xl p-6 shadow-2xl border-2 border-red-300 dark:border-red-900/60 max-h-[92vh] overflow-y-auto space-y-4">
            <button
              type="button"
              onClick={() => setIsNewAnuncioModalOpen(false)}
              className="absolute top-4 right-4 p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-red-100 dark:bg-red-950 text-red-600 dark:text-red-400 grid place-items-center text-xl font-bold">
                📢
              </div>
              <div>
                <h3 className="text-base font-black text-slate-900 dark:text-white">
                  Publicar Aviso Institucional
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Visible para estudiantes, docentes y directores de la comunidad escolar.
                </p>
              </div>
            </div>

            <form onSubmit={handleCreateAnuncio} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-800 dark:text-slate-200 mb-1">
                  Título del Comunicado
                </label>
                <input
                  type="text"
                  value={anuncioTitulo}
                  onChange={(e) => setAnuncioTitulo(e.target.value)}
                  placeholder="Ej. Entrega de Informes Académicos, Simulacro Saber, Feria de Ciencias..."
                  required
                  className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder:text-slate-500 font-medium focus:outline-none focus:ring-2 focus:ring-red-600 shadow-xs"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-800 dark:text-slate-200 mb-1">
                    Nivel de Prioridad
                  </label>
                  <select
                    value={anuncioPrioridad}
                    onChange={(e) => setAnuncioPrioridad(e.target.value as any)}
                    className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-medium"
                  >
                    <option value="normal">ℹ️ Normal (Informativo)</option>
                    <option value="importante">⚠️ Importante (Atención requerida)</option>
                    <option value="urgente">🚨 Urgente (Prioridad máxima)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-800 dark:text-slate-200 mb-1">
                    Destinatarios / Alcance
                  </label>
                  <select
                    value={anuncioAula}
                    onChange={(e) => setAnuncioAula(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-medium"
                  >
                    <option value="todas">🏫 Toda la Institución (General)</option>
                    {aulas.map((aula) => (
                      <option key={aula.id} value={aula.id}>
                        📚 {aula.nombre} ({aula.grado || 'Aula'})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-800 dark:text-slate-200 mb-1">
                  Contenido del Mensaje
                </label>
                <textarea
                  value={anuncioTexto}
                  onChange={(e) => setAnuncioTexto(e.target.value)}
                  rows={4}
                  placeholder="Escribe los detalles del aviso institucional con claridad para estudiantes, familias y docentes..."
                  required
                  className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder:text-slate-500 font-medium focus:outline-none focus:ring-2 focus:ring-red-600 shadow-xs"
                />
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-slate-200 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsNewAnuncioModalOpen(false)}
                  className="px-4 py-2 text-xs font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 text-xs font-black text-white bg-[#D32F2F] hover:bg-[#B71C1C] rounded-xl shadow-md transition-all active:scale-95 cursor-pointer"
                >
                  Publicar Comunicado
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Google Workspace Synchronization Hub Modal */}
      <GoogleSyncHubModal
        isOpen={isGoogleSyncModalOpen}
        onClose={() => setIsGoogleSyncModalOpen(false)}
        tareas={tareas}
        aulas={aulas}
        onImportAulas={(newAulas) => {
          const updated = [...aulas, ...newAulas];
          setAulas(updated);
          ClassPointService.saveAulas(updated);
        }}
        userRole={role}
      />

      {/* Microsoft 365 Synchronization Hub Modal */}
      <MicrosoftSyncHubModal
        isOpen={isMicrosoftSyncModalOpen}
        onClose={() => setIsMicrosoftSyncModalOpen(false)}
        tareas={tareas}
        aulas={aulas}
        onImportAulas={(newAulas) => {
          const updated = [...aulas, ...newAulas];
          setAulas(updated);
          ClassPointService.saveAulas(updated);
        }}
        userRole={role}
      />

      {/* Footer */}
      <footer className="w-full py-4 px-4 text-center text-xs text-[#586d82] dark:text-slate-400 border-t border-[#dce9ef] dark:border-slate-800 bg-white dark:bg-[#0a111a] transition-colors">
        BoscoClass + BoscoIA · Plataforma Educativa Oficial Multi-Colegio
      </footer>
    </div>
  );
};
