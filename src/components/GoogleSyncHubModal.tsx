import React, { useState, useEffect } from 'react';
import {
  X,
  RefreshCw,
  Calendar,
  FolderOpen,
  CheckSquare,
  GraduationCap,
  ExternalLink,
  Plus,
  Trash2,
  CheckCircle2,
  AlertCircle,
  Upload,
  ArrowRight,
  LogOut,
  Layers,
} from 'lucide-react';
import {
  googleSignIn,
  googleSignOut,
  getCurrentGoogleUser,
  isGoogleConnected,
} from '../services/googleAuthService';
import {
  GoogleWorkspaceService,
  GoogleClassroomCourse,
  GoogleCalendarEvent,
  GoogleDriveFile,
  GoogleTaskItem,
  GoogleTaskList,
} from '../services/googleWorkspaceService';
import { ClassPointTarea, ClassPointAula } from '../types';

interface GoogleSyncHubModalProps {
  isOpen: boolean;
  onClose: () => void;
  tareas: ClassPointTarea[];
  aulas: ClassPointAula[];
  onImportAulas?: (newAulas: ClassPointAula[]) => void;
  userRole?: string;
}

export const GoogleSyncHubModal: React.FC<GoogleSyncHubModalProps> = ({
  isOpen,
  onClose,
  tareas,
  aulas,
  onImportAulas,
  userRole = 'estudiante',
}) => {
  const [isConnected, setIsConnected] = useState(isGoogleConnected());
  const [googleUser, setGoogleUser] = useState(getCurrentGoogleUser());
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);

  // Active sub-tab in Google Hub
  const [activeTab, setActiveTab] = useState<'classroom' | 'calendar' | 'drive' | 'tasks'>('classroom');

  // Loading states
  const [isLoadingData, setIsLoadingData] = useState(false);
  const [actionSuccessMsg, setActionSuccessMsg] = useState<string | null>(null);

  // Classroom data
  const [courses, setCourses] = useState<GoogleClassroomCourse[]>([]);

  // Calendar data
  const [events, setEvents] = useState<GoogleCalendarEvent[]>([]);

  // Drive data
  const [driveFiles, setDriveFiles] = useState<GoogleDriveFile[]>([]);
  const [uploadNoteTitle, setUploadNoteTitle] = useState('');
  const [uploadNoteContent, setUploadNoteContent] = useState('');
  const [isUploadingToDrive, setIsUploadingToDrive] = useState(false);

  // Tasks data
  const [taskLists, setTaskLists] = useState<GoogleTaskList[]>([]);
  const [selectedTaskListId, setSelectedTaskListId] = useState<string>('@default');
  const [tasks, setTasks] = useState<GoogleTaskItem[]>([]);
  const [newTaskTitle, setNewTaskTitle] = useState('');

  // Confirmation dialog state for destructive/mutating operations (Mandatory per SKILL.md)
  const [confirmDialog, setConfirmDialog] = useState<{
    isOpen: boolean;
    title: string;
    description: string;
    confirmText?: string;
    onConfirm: () => Promise<void>;
  } | null>(null);

  // Load all Google data when connected or tab changes
  useEffect(() => {
    if (isOpen) {
      const conn = isGoogleConnected();
      setIsConnected(conn);
      setGoogleUser(getCurrentGoogleUser());
      if (conn) {
        loadDataForCurrentTab(activeTab);
      }
    }
  }, [isOpen, activeTab]);

  const loadDataForCurrentTab = async (tab: 'classroom' | 'calendar' | 'drive' | 'tasks') => {
    if (!isGoogleConnected()) return;
    setIsLoadingData(true);
    setAuthError(null);

    try {
      if (tab === 'classroom') {
        const c = await GoogleWorkspaceService.listCourses();
        setCourses(c);
      } else if (tab === 'calendar') {
        const ev = await GoogleWorkspaceService.listCalendarEvents();
        setEvents(ev);
      } else if (tab === 'drive') {
        const files = await GoogleWorkspaceService.listDriveFiles();
        setDriveFiles(files);
      } else if (tab === 'tasks') {
        const lists = await GoogleWorkspaceService.listTaskLists();
        setTaskLists(lists);
        const activeListId = selectedTaskListId === '@default' && lists.length > 0 ? lists[0].id : selectedTaskListId;
        setSelectedTaskListId(activeListId);
        const t = await GoogleWorkspaceService.listTasks(activeListId);
        setTasks(t);
      }
    } catch (err: any) {
      console.warn(`Error loading Google data for ${tab}:`, err);
      setAuthError(err.message || 'Error al comunicarse con los servicios de Google Workspace.');
    } finally {
      setIsLoadingData(false);
    }
  };

  const handleConnectGoogle = async () => {
    setIsAuthenticating(true);
    setAuthError(null);
    try {
      const result = await googleSignIn();
      if (result) {
        setIsConnected(true);
        setGoogleUser(result.user);
        setActionSuccessMsg(`¡Conexión exitosa con ${result.user.email}!`);
        setTimeout(() => setActionSuccessMsg(null), 4000);
        await loadDataForCurrentTab(activeTab);
      }
    } catch (err: any) {
      console.error('Google Connect Error:', err);
      setAuthError(err.message || 'No se pudo completar la autenticación con Google.');
    } finally {
      setIsAuthenticating(false);
    }
  };

  const handleDisconnectGoogle = async () => {
    setConfirmDialog({
      isOpen: true,
      title: '¿Desconectar cuenta de Google?',
      description: 'Se cerrará la sesión de Google Workspace en este dispositivo. Podrás volver a conectarte cuando quieras.',
      confirmText: 'Desconectar',
      onConfirm: async () => {
        await googleSignOut();
        setIsConnected(false);
        setGoogleUser(null);
        setCourses([]);
        setEvents([]);
        setDriveFiles([]);
        setTasks([]);
        setConfirmDialog(null);
      },
    });
  };

  // Sync BoscoClass Deadlines to Google Calendar
  const handleSyncDeadlinesToCalendar = () => {
    const pendingWithDue = tareas.filter((t) => t.fecha);
    if (pendingWithDue.length === 0) {
      setActionSuccessMsg('No hay tareas con fecha de entrega límite para sincronizar.');
      setTimeout(() => setActionSuccessMsg(null), 3500);
      return;
    }

    setConfirmDialog({
      isOpen: true,
      title: 'Sincronizar entregas a Google Calendar',
      description: `¿Deseas agregar ${pendingWithDue.length} fechas límite de tareas escolares a tu calendario principal de Google Calendar?`,
      confirmText: 'Sincronizar Calendario',
      onConfirm: async () => {
        try {
          setIsLoadingData(true);
          const count = await GoogleWorkspaceService.syncDeadlinesToCalendar(
            pendingWithDue.map((t) => ({
              id: t.id,
              title: t.titulo,
              materia: t.materia,
              fecha: t.fecha,
            }))
          );
          setActionSuccessMsg(`✅ ¡${count} evento(s) sincronizado(s) exitosamente con Google Calendar!`);
          setTimeout(() => setActionSuccessMsg(null), 4000);
          const ev = await GoogleWorkspaceService.listCalendarEvents();
          setEvents(ev);
        } catch (err: any) {
          setAuthError(err.message || 'Error al sincronizar con Calendar.');
        } finally {
          setIsLoadingData(false);
          setConfirmDialog(null);
        }
      },
    });
  };

  // Sync BoscoClass Tasks to Google Tasks
  const handleSyncTasksToGoogle = () => {
    if (tareas.length === 0) {
      setActionSuccessMsg('No hay tareas registradas en BoscoClass para sincronizar.');
      setTimeout(() => setActionSuccessMsg(null), 3500);
      return;
    }

    setConfirmDialog({
      isOpen: true,
      title: 'Sincronizar tareas a Google Tasks',
      description: `Se creará o actualizará la lista "BoscoClass - Tareas y Entregas" en Google Tasks con ${tareas.length} actividades escolares. ¿Deseas continuar?`,
      confirmText: 'Sincronizar con Google Tasks',
      onConfirm: async () => {
        try {
          setIsLoadingData(true);
          const result = await GoogleWorkspaceService.syncBoscoTasksToGoogle(
            tareas.map((t) => ({
              id: t.id,
              title: t.titulo,
              materia: t.materia,
              fecha: t.fecha,
              descripcion: t.descripcion,
            }))
          );
          setActionSuccessMsg(`✅ ¡${result.syncedCount} tarea(s) agregada(s) a la lista "${result.listTitle}" de Google Tasks!`);
          setTimeout(() => setActionSuccessMsg(null), 4000);
          await loadDataForCurrentTab('tasks');
        } catch (err: any) {
          setAuthError(err.message || 'Error al sincronizar tareas.');
        } finally {
          setIsLoadingData(false);
          setConfirmDialog(null);
        }
      },
    });
  };

  // Upload Evidence/Note to Google Drive
  const handleUploadToDrive = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!uploadNoteTitle.trim()) return;

    try {
      setIsUploadingToDrive(true);
      const fileName = uploadNoteTitle.endsWith('.md') || uploadNoteTitle.endsWith('.txt')
        ? uploadNoteTitle
        : `${uploadNoteTitle}.txt`;

      await GoogleWorkspaceService.uploadTextFile(
        fileName,
        uploadNoteContent || `Documento académico de BoscoClass - Creado el ${new Date().toLocaleString()}`,
        'text/plain'
      );
      setUploadNoteTitle('');
      setUploadNoteContent('');
      setActionSuccessMsg(`✅ ¡Archivo "${fileName}" guardado en Google Drive!`);
      setTimeout(() => setActionSuccessMsg(null), 4000);
      const files = await GoogleWorkspaceService.listDriveFiles();
      setDriveFiles(files);
    } catch (err: any) {
      setAuthError(err.message || 'Error al subir archivo a Google Drive.');
    } finally {
      setIsUploadingToDrive(false);
    }
  };

  // Delete Drive file with required confirmation dialog
  const handleDeleteDriveFile = (file: GoogleDriveFile) => {
    setConfirmDialog({
      isOpen: true,
      title: '¿Eliminar archivo de Google Drive?',
      description: `¿Estás seguro de que deseas eliminar permanentemente el archivo "${file.name}" de tu Google Drive? Esta acción no se puede deshacer.`,
      confirmText: 'Sí, Eliminar Archivo',
      onConfirm: async () => {
        try {
          await GoogleWorkspaceService.deleteDriveFile(file.id);
          setActionSuccessMsg(`Archivo "${file.name}" eliminado de Google Drive.`);
          setTimeout(() => setActionSuccessMsg(null), 3000);
          setDriveFiles((prev) => prev.filter((f) => f.id !== file.id));
        } catch (err: any) {
          setAuthError(err.message || 'Error al eliminar archivo.');
        } finally {
          setConfirmDialog(null);
        }
      },
    });
  };

  // Import Classroom Courses as BoscoClass Aulas
  const handleImportCoursesToAulas = () => {
    if (courses.length === 0) return;

    const existingNames = new Set(aulas.map((a) => a.nombre.toLowerCase().trim()));
    const newAulas: ClassPointAula[] = courses
      .filter((c) => !existingNames.has(c.name.toLowerCase().trim()))
      .map((c) => ({
        id: `classroom_${c.id}`,
        nombre: c.name,
        horario: 'Lunes a Viernes (Virtual)',
        profesor: googleUser?.displayName || 'Docente Google Classroom',
        codigo: (c.id || '').slice(-6).toUpperCase() || 'GC-101',
        estudiantes: [],
        grado: c.section || 'Curso Virtual',
        materia: 'Google Classroom',
        institucion: 'Google Classroom',
        descripcion: `Curso importado desde Google Classroom: ${c.name}`,
      }));

    if (newAulas.length === 0) {
      setActionSuccessMsg('Todos los cursos de Google Classroom ya se encuentran importados en BoscoClass.');
      setTimeout(() => setActionSuccessMsg(null), 4000);
      return;
    }

    setConfirmDialog({
      isOpen: true,
      title: 'Importar Salones de Google Classroom',
      description: `Se importarán ${newAulas.length} clase(s) activas de tu Google Classroom a las aulas de BoscoClass.`,
      confirmText: 'Importar Salones',
      onConfirm: async () => {
        if (onImportAulas) {
          onImportAulas(newAulas);
        }
        setActionSuccessMsg(`✅ ¡${newAulas.length} salón(es) importados a BoscoClass!`);
        setTimeout(() => setActionSuccessMsg(null), 4000);
        setConfirmDialog(null);
      },
    });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/75 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="relative w-full max-w-4xl max-h-[92vh] flex flex-col bg-white dark:bg-[#0d1624] text-slate-800 dark:text-slate-100 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden">
        
        {/* Modal Top Bar */}
        <div className="p-5 sm:p-6 bg-gradient-to-r from-red-700 via-rose-700 to-[#b71c1c] text-white flex items-center justify-between shrink-0 shadow-md">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-white p-2 shadow-md flex items-center justify-center shrink-0">
              {/* Google Workspace colored icon */}
              <svg viewBox="0 0 48 48" className="w-full h-full">
                <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z" />
                <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z" />
                <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z" />
                <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z" />
              </svg>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-black tracking-tight">Sincronización con Google Workspace</h2>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-white/20 text-white font-bold uppercase tracking-wider">
                  Oficial
                </span>
              </div>
              <p className="text-xs text-white/90 mt-0.5">
                Conecta Google Classroom, Calendar, Drive y Tasks con BoscoClass
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-2xl bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Status / Account Header Banner */}
        <div className="p-4 bg-slate-50 dark:bg-[#111c2d] border-b border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shrink-0">
          {isConnected && googleUser ? (
            <div className="flex items-center gap-3">
              <img
                src={googleUser.photoURL || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(googleUser.displayName || 'Google')}`}
                alt="Google Avatar"
                className="w-10 h-10 rounded-full border-2 border-emerald-500 object-cover"
              />
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-bold text-slate-900 dark:text-white">
                    {googleUser.displayName || 'Usuario de Google'}
                  </span>
                  <span className="flex items-center gap-1 text-[10px] font-black px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800">
                    <CheckCircle2 className="w-3 h-3" /> Conectado y Sincronizado
                  </span>
                </div>
                <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                  {googleUser.email}
                </span>
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-2 text-xs text-slate-600 dark:text-slate-300">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500 animate-pulse" />
              <span>Conecta tu cuenta de Google para sincronizar tus clases, tareas, eventos y archivos escolares.</span>
            </div>
          )}

          <div className="flex items-center gap-2 self-end sm:self-auto">
            {isConnected ? (
              <>
                <button
                  type="button"
                  onClick={() => loadDataForCurrentTab(activeTab)}
                  disabled={isLoadingData}
                  className="px-3 py-1.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-200 transition-colors flex items-center gap-1.5 cursor-pointer"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isLoadingData ? 'animate-spin' : ''}`} />
                  <span>Actualizar</span>
                </button>
                <button
                  type="button"
                  onClick={handleDisconnectGoogle}
                  className="px-3 py-1.5 rounded-xl border border-red-200 dark:border-red-900/60 bg-red-50 dark:bg-red-950/30 hover:bg-red-100 text-xs font-semibold text-red-700 dark:text-red-400 transition-colors flex items-center gap-1.5 cursor-pointer"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>Desconectar</span>
                </button>
              </>
            ) : (
              <button
                type="button"
                onClick={handleConnectGoogle}
                disabled={isAuthenticating}
                className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-black dark:bg-white dark:hover:bg-slate-100 text-white dark:text-slate-900 font-bold text-xs shadow-md transition-all flex items-center gap-2.5 cursor-pointer"
              >
                <svg viewBox="0 0 48 48" className="w-4 h-4">
                  <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z" />
                  <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z" />
                  <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z" />
                  <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z" />
                </svg>
                <span>{isAuthenticating ? 'Conectando con Google...' : 'Vincular Cuenta de Google'}</span>
              </button>
            )}
          </div>
        </div>

        {/* Success / Error Alerts */}
        {actionSuccessMsg && (
          <div className="p-3 bg-emerald-50 dark:bg-emerald-950/40 border-b border-emerald-200 dark:border-emerald-800 text-xs text-emerald-800 dark:text-emerald-200 font-semibold flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
              <span>{actionSuccessMsg}</span>
            </div>
            <button onClick={() => setActionSuccessMsg(null)} className="text-emerald-500 hover:text-emerald-700">
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {authError && (
          <div className="p-3 bg-red-50 dark:bg-red-950/40 border-b border-red-200 dark:border-red-800 text-xs text-red-800 dark:text-red-200 font-semibold flex items-center justify-between">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-red-600 dark:text-red-400 shrink-0" />
              <span>{authError}</span>
            </div>
            <button onClick={() => setAuthError(null)} className="text-red-500 hover:text-red-700">
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {/* Tab Navigation */}
        <div className="flex items-center gap-1 p-2 bg-slate-100 dark:bg-[#0a121c] border-b border-slate-200 dark:border-slate-800 overflow-x-auto shrink-0">
          {[
            { id: 'classroom', label: 'Google Classroom', icon: GraduationCap, badge: courses.length > 0 ? courses.length : null },
            { id: 'calendar', label: 'Google Calendar', icon: Calendar, badge: events.length > 0 ? events.length : null },
            { id: 'drive', label: 'Google Drive', icon: FolderOpen, badge: driveFiles.length > 0 ? driveFiles.length : null },
            { id: 'tasks', label: 'Google Tasks', icon: CheckSquare, badge: tasks.length > 0 ? tasks.length : null },
          ].map((tab) => {
            const Icon = tab.icon;
            const isTabActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id as any)}
                className={`px-4 py-2 rounded-2xl text-xs font-bold transition-all flex items-center gap-2 shrink-0 cursor-pointer ${
                  isTabActive
                    ? 'bg-red-600 text-white shadow-xs'
                    : 'text-slate-600 dark:text-slate-300 hover:bg-white dark:hover:bg-slate-800/60'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{tab.label}</span>
                {tab.badge !== null && (
                  <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-black ${
                    isTabActive ? 'bg-white/20 text-white' : 'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300'
                  }`}>
                    {tab.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Tab Content Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
          {!isConnected ? (
            /* Unconnected State Screen */
            <div className="p-8 sm:p-12 text-center rounded-3xl bg-slate-50 dark:bg-[#0f1b29] border border-dashed border-slate-300 dark:border-slate-700 space-y-4">
              <div className="w-16 h-16 rounded-3xl bg-red-100 dark:bg-red-950/40 text-[#D32F2F] grid place-items-center mx-auto shadow-inner">
                <Layers className="w-8 h-8" />
              </div>
              <div className="max-w-md mx-auto space-y-2">
                <h3 className="text-lg font-black text-slate-900 dark:text-white">
                  Sincroniza BoscoClass con tus herramientas de Google
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                  Al conectar tu cuenta de Google Workspace, podrás visualizar y sincronizar tus clases de <strong>Google Classroom</strong>, fechas límites en <strong>Google Calendar</strong>, tareas en <strong>Google Tasks</strong> y guardar evidencias en <strong>Google Drive</strong>.
                </p>
              </div>

              <div className="pt-2">
                <button
                  type="button"
                  onClick={handleConnectGoogle}
                  disabled={isAuthenticating}
                  className="px-6 py-3 rounded-2xl bg-[#D32F2F] hover:bg-red-700 text-white font-black text-xs shadow-lg transition-transform hover:scale-105 active:scale-95 inline-flex items-center gap-2 cursor-pointer"
                >
                  <svg viewBox="0 0 48 48" className="w-4 h-4">
                    <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z" />
                    <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z" />
                    <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z" />
                    <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z" />
                  </svg>
                  <span>{isAuthenticating ? 'Conectando...' : 'Iniciar Sincronización con Google'}</span>
                </button>
              </div>
            </div>
          ) : (
            /* Connected Content */
            <>
              {/* TAB: GOOGLE CLASSROOM */}
              {activeTab === 'classroom' && (
                <div className="space-y-4">
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-4 rounded-2xl bg-emerald-50/70 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-800">
                    <div>
                      <h4 className="text-sm font-black text-emerald-950 dark:text-emerald-200 flex items-center gap-2">
                        <GraduationCap className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                        <span>Clases de Google Classroom</span>
                      </h4>
                      <p className="text-xs text-emerald-800 dark:text-emerald-300 mt-0.5">
                        Importa tus cursos de Classroom como salones virtuales en BoscoClass con un solo clic.
                      </p>
                    </div>

                    {courses.length > 0 && onImportAulas && (
                      <button
                        type="button"
                        onClick={handleImportCoursesToAulas}
                        className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-xs transition-all flex items-center gap-1.5 shrink-0 cursor-pointer"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>Importar a BoscoClass</span>
                      </button>
                    )}
                  </div>

                  {isLoadingData ? (
                    <div className="p-8 text-center text-xs text-slate-400">
                      <RefreshCw className="w-5 h-5 animate-spin mx-auto mb-2 text-red-500" />
                      Consultando Google Classroom...
                    </div>
                  ) : courses.length === 0 ? (
                    <div className="p-8 text-center rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs text-slate-500 dark:text-slate-400 space-y-2">
                      <p className="font-semibold text-slate-700 dark:text-slate-300">
                        No se encontraron cursos activos en esta cuenta de Google Classroom.
                      </p>
                      <p className="max-w-md mx-auto">
                        Asegúrate de haber iniciado sesión con tu correo escolar institucional o tener cursos activos asignados.
                      </p>
                      <a
                        href="https://classroom.google.com"
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1 text-red-600 hover:underline pt-2 font-bold"
                      >
                        Abrir Google Classroom <ExternalLink className="w-3 h-3" />
                      </a>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {courses.map((course) => (
                        <div
                          key={course.id}
                          className="p-4 rounded-2xl bg-white dark:bg-[#0f1b29] border border-slate-200 dark:border-slate-800 shadow-xs space-y-2 hover:border-red-400 transition-colors"
                        >
                          <div className="flex items-start justify-between gap-2">
                            <h5 className="text-sm font-black text-slate-900 dark:text-white line-clamp-1">
                              {course.name}
                            </h5>
                            <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 font-bold shrink-0">
                              Activa
                            </span>
                          </div>

                          <div className="text-xs text-slate-500 dark:text-slate-400 space-y-0.5">
                            {course.section && <p>Sección / Grado: {course.section}</p>}
                            {course.room && <p>Aula: {course.room}</p>}
                          </div>

                          {course.alternateLink && (
                            <a
                              href={course.alternateLink}
                              target="_blank"
                              rel="noreferrer"
                              className="text-xs text-red-600 dark:text-red-400 font-bold hover:underline inline-flex items-center gap-1 pt-1"
                            >
                              <span>Ir a la clase en Google Classroom</span>
                              <ExternalLink className="w-3 h-3" />
                            </a>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* TAB: GOOGLE CALENDAR */}
              {activeTab === 'calendar' && (
                <div className="space-y-4">
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-4 rounded-2xl bg-blue-50/70 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800">
                    <div>
                      <h4 className="text-sm font-black text-blue-950 dark:text-blue-200 flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                        <span>Sincronización con Google Calendar</span>
                      </h4>
                      <p className="text-xs text-blue-800 dark:text-blue-300 mt-0.5">
                        Agrega las fechas límite de entrega de tareas escolares de BoscoClass directamente a tu calendario personal.
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={handleSyncDeadlinesToCalendar}
                      className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-xs transition-all flex items-center gap-1.5 shrink-0 cursor-pointer"
                    >
                      <Upload className="w-3.5 h-3.5" />
                      <span>Sincronizar Entregas ({tareas.filter((t) => t.fecha).length})</span>
                    </button>
                  </div>

                  {isLoadingData ? (
                    <div className="p-8 text-center text-xs text-slate-400">
                      <RefreshCw className="w-5 h-5 animate-spin mx-auto mb-2 text-red-500" />
                      Consultando Google Calendar...
                    </div>
                  ) : events.length === 0 ? (
                    <div className="p-8 text-center rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs text-slate-500 dark:text-slate-400 space-y-2">
                      <p className="font-semibold text-slate-700 dark:text-slate-300">
                        No hay eventos próximos registrados en tu Google Calendar principal.
                      </p>
                      <p>Usa el botón de arriba para sincronizar las fechas límite de tus tareas de BoscoClass.</p>
                      <a
                        href="https://calendar.google.com"
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1 text-blue-600 hover:underline pt-2 font-bold"
                      >
                        Abrir Google Calendar <ExternalLink className="w-3 h-3" />
                      </a>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {events.map((ev) => {
                        const start = ev.start?.dateTime ? new Date(ev.start.dateTime).toLocaleString() : ev.start?.date;
                        const isBoscoEvent = ev.summary?.toLowerCase().includes('boscoclass');
                        return (
                          <div
                            key={ev.id}
                            className={`p-3.5 rounded-2xl border flex items-center justify-between gap-3 ${
                              isBoscoEvent
                                ? 'bg-red-50/50 dark:bg-red-950/20 border-red-200 dark:border-red-900/50'
                                : 'bg-white dark:bg-[#0f1b29] border-slate-200 dark:border-slate-800'
                            }`}
                          >
                            <div className="space-y-0.5">
                              <div className="flex items-center gap-2">
                                <span className="text-xs font-bold text-slate-900 dark:text-white">
                                  {ev.summary}
                                </span>
                                {isBoscoEvent && (
                                  <span className="text-[9px] px-1.5 py-0.5 rounded-md bg-red-600 text-white font-black">
                                    BoscoClass
                                  </span>
                                )}
                              </div>
                              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                                🕒 {start} {ev.location && `• 📍 ${ev.location}`}
                              </p>
                            </div>

                            {ev.htmlLink && (
                              <a
                                href={ev.htmlLink}
                                target="_blank"
                                rel="noreferrer"
                                className="p-2 rounded-xl text-slate-400 hover:text-blue-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                                title="Ver en Google Calendar"
                              >
                                <ExternalLink className="w-4 h-4" />
                              </a>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}

              {/* TAB: GOOGLE DRIVE */}
              {activeTab === 'drive' && (
                <div className="space-y-4">
                  {/* Upload Note / Evidence Box */}
                  <form
                    onSubmit={handleUploadToDrive}
                    className="p-4 rounded-2xl bg-amber-50/50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800 space-y-3"
                  >
                    <div className="flex items-center justify-between">
                      <h4 className="text-xs font-black text-amber-950 dark:text-amber-200 uppercase tracking-wide flex items-center gap-1.5">
                        <FolderOpen className="w-4 h-4 text-amber-600" />
                        <span>Guardar Evidencia o Resumen en Google Drive</span>
                      </h4>
                      <a
                        href="https://drive.google.com"
                        target="_blank"
                        rel="noreferrer"
                        className="text-[11px] font-bold text-amber-700 dark:text-amber-400 hover:underline flex items-center gap-1"
                      >
                        <span>Mi Drive</span> <ExternalLink className="w-3 h-3" />
                      </a>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                      <input
                        type="text"
                        value={uploadNoteTitle}
                        onChange={(e) => setUploadNoteTitle(e.target.value)}
                        placeholder="Nombre de archivo (ej. Tarea_Matematicas_11A)"
                        className="sm:col-span-1 px-3 py-2 text-xs rounded-xl bg-white dark:bg-slate-900 text-slate-900 dark:text-white border border-slate-300 dark:border-slate-700 font-medium focus:outline-none focus:border-red-500"
                        required
                      />
                      <input
                        type="text"
                        value={uploadNoteContent}
                        onChange={(e) => setUploadNoteContent(e.target.value)}
                        placeholder="Contenido o notas de la evidencia académica..."
                        className="sm:col-span-2 px-3 py-2 text-xs rounded-xl bg-white dark:bg-slate-900 text-slate-900 dark:text-white border border-slate-300 dark:border-slate-700 font-medium focus:outline-none focus:border-red-500"
                      />
                    </div>

                    <div className="flex justify-end">
                      <button
                        type="submit"
                        disabled={isUploadingToDrive || !uploadNoteTitle.trim()}
                        className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs shadow-xs transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                      >
                        <Upload className="w-3.5 h-3.5" />
                        <span>{isUploadingToDrive ? 'Guardando...' : 'Guardar en Google Drive'}</span>
                      </button>
                    </div>
                  </form>

                  {/* Drive Files List */}
                  {isLoadingData ? (
                    <div className="p-8 text-center text-xs text-slate-400">
                      <RefreshCw className="w-5 h-5 animate-spin mx-auto mb-2 text-red-500" />
                      Consultando Google Drive...
                    </div>
                  ) : driveFiles.length === 0 ? (
                    <div className="p-8 text-center rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs text-slate-500 dark:text-slate-400 space-y-2">
                      <p className="font-semibold text-slate-700 dark:text-slate-300">
                        No hay archivos recientes disponibles para mostrar.
                      </p>
                      <p>Usa el formulario superior para respaldar tus evidencias en Drive.</p>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {driveFiles.map((file) => (
                        <div
                          key={file.id}
                          className="p-3.5 rounded-2xl bg-white dark:bg-[#0f1b29] border border-slate-200 dark:border-slate-800 flex items-center justify-between gap-3 hover:border-slate-300 dark:hover:border-slate-700 transition-colors"
                        >
                          <div className="flex items-center gap-2.5 truncate">
                            <span className="text-lg shrink-0">📄</span>
                            <div className="truncate">
                              <span className="text-xs font-bold text-slate-900 dark:text-white truncate block">
                                {file.name}
                              </span>
                              <span className="text-[10px] text-slate-400">
                                {file.createdTime ? new Date(file.createdTime).toLocaleDateString() : 'Drive'}
                              </span>
                            </div>
                          </div>

                          <div className="flex items-center gap-1 shrink-0">
                            {file.webViewLink && (
                              <a
                                href={file.webViewLink}
                                target="_blank"
                                rel="noreferrer"
                                className="p-2 rounded-xl text-slate-400 hover:text-blue-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                                title="Abrir en Google Drive"
                              >
                                <ExternalLink className="w-3.5 h-3.5" />
                              </a>
                            )}
                            <button
                              type="button"
                              onClick={() => handleDeleteDriveFile(file)}
                              className="p-2 rounded-xl text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors"
                              title="Eliminar de Google Drive"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* TAB: GOOGLE TASKS */}
              {activeTab === 'tasks' && (
                <div className="space-y-4">
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-4 rounded-2xl bg-emerald-50/70 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-800">
                    <div>
                      <h4 className="text-sm font-black text-emerald-950 dark:text-emerald-200 flex items-center gap-2">
                        <CheckSquare className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                        <span>Sincronización con Google Tasks</span>
                      </h4>
                      <p className="text-xs text-emerald-800 dark:text-emerald-300 mt-0.5">
                        Lleva las tareas de BoscoClass a tu lista de pendientes oficial de Google Tasks en tu teléfono y computadora.
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={handleSyncTasksToGoogle}
                      className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-xs transition-all flex items-center gap-1.5 shrink-0 cursor-pointer"
                    >
                      <Upload className="w-3.5 h-3.5" />
                      <span>Sincronizar Todas las Tareas ({tareas.length})</span>
                    </button>
                  </div>

                  {/* Add Task Input */}
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      value={newTaskTitle}
                      onChange={(e) => setNewTaskTitle(e.target.value)}
                      placeholder="Nueva tarea para Google Tasks..."
                      className="flex-1 px-3.5 py-2.5 text-xs rounded-xl bg-white dark:bg-slate-900 text-slate-900 dark:text-white border border-slate-300 dark:border-slate-700 font-medium focus:outline-none focus:border-emerald-500"
                    />
                    <button
                      type="button"
                      onClick={async () => {
                        if (!newTaskTitle.trim()) return;
                        try {
                          await GoogleWorkspaceService.createTask(selectedTaskListId, {
                            title: newTaskTitle.trim(),
                          });
                          setNewTaskTitle('');
                          await loadDataForCurrentTab('tasks');
                        } catch (err: any) {
                          setAuthError(err.message || 'Error al crear tarea.');
                        }
                      }}
                      disabled={!newTaskTitle.trim()}
                      className="px-4 py-2.5 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-bold text-xs shadow-xs transition-colors cursor-pointer disabled:opacity-50"
                    >
                      + Agregar
                    </button>
                  </div>

                  {isLoadingData ? (
                    <div className="p-8 text-center text-xs text-slate-400">
                      <RefreshCw className="w-5 h-5 animate-spin mx-auto mb-2 text-red-500" />
                      Consultando Google Tasks...
                    </div>
                  ) : tasks.length === 0 ? (
                    <div className="p-8 text-center rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs text-slate-500 dark:text-slate-400 space-y-2">
                      <p className="font-semibold text-slate-700 dark:text-slate-300">
                        No hay tareas pendientes en esta lista de Google Tasks.
                      </p>
                      <p>Haz clic en "Sincronizar Todas las Tareas" para exportar tus entregas pendientes.</p>
                      <a
                        href="https://tasks.google.com"
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1 text-emerald-600 hover:underline pt-2 font-bold"
                      >
                        Abrir Google Tasks <ExternalLink className="w-3 h-3" />
                      </a>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {tasks.map((t) => {
                        const isDone = t.status === 'completed';
                        return (
                          <div
                            key={t.id}
                            className={`p-3.5 rounded-2xl border flex items-center justify-between gap-3 transition-colors ${
                              isDone
                                ? 'bg-slate-50 dark:bg-slate-900/40 border-slate-200 dark:border-slate-800 opacity-60'
                                : 'bg-white dark:bg-[#0f1b29] border-slate-200 dark:border-slate-800'
                            }`}
                          >
                            <div className="flex items-center gap-3">
                              <button
                                type="button"
                                onClick={async () => {
                                  try {
                                    await GoogleWorkspaceService.toggleTaskStatus(
                                      selectedTaskListId,
                                      t.id,
                                      !isDone
                                    );
                                    await loadDataForCurrentTab('tasks');
                                  } catch (err: any) {
                                    setAuthError(err.message || 'Error al actualizar tarea');
                                  }
                                }}
                                className={`w-5 h-5 rounded-md border flex items-center justify-center transition-colors cursor-pointer ${
                                  isDone
                                    ? 'bg-emerald-600 border-emerald-600 text-white'
                                    : 'border-slate-300 dark:border-slate-700 hover:border-emerald-500'
                                }`}
                              >
                                {isDone && <CheckCircle2 className="w-3.5 h-3.5" />}
                              </button>
                              <div>
                                <span className={`text-xs font-bold block ${isDone ? 'line-through text-slate-400' : 'text-slate-900 dark:text-white'}`}>
                                  {t.title}
                                </span>
                                {t.notes && (
                                  <span className="text-[10px] text-slate-400 block line-clamp-1">
                                    {t.notes}
                                  </span>
                                )}
                              </div>
                            </div>

                            <button
                              type="button"
                              onClick={() => {
                                setConfirmDialog({
                                  isOpen: true,
                                  title: '¿Eliminar tarea de Google Tasks?',
                                  description: `¿Estás seguro de que deseas eliminar la tarea "${t.title}" de tu lista de Google Tasks?`,
                                  confirmText: 'Eliminar',
                                  onConfirm: async () => {
                                    await GoogleWorkspaceService.deleteTask(selectedTaskListId, t.id);
                                    await loadDataForCurrentTab('tasks');
                                    setConfirmDialog(null);
                                  },
                                });
                              }}
                              className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                              title="Eliminar tarea"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}
            </>
          )}
        </div>

        {/* Mandatory Confirmation Modal for Destructive/Mutating Workspace operations */}
        {confirmDialog && confirmDialog.isOpen && (
          <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150">
            <div className="w-full max-w-md bg-white dark:bg-[#101b2a] border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-2xl space-y-4">
              <div className="w-10 h-10 rounded-2xl bg-amber-500/15 text-amber-600 dark:text-amber-400 grid place-items-center">
                <AlertCircle className="w-5 h-5" />
              </div>
              <div className="space-y-1.5">
                <h4 className="text-base font-black text-slate-900 dark:text-white">
                  {confirmDialog.title}
                </h4>
                <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                  {confirmDialog.description}
                </p>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setConfirmDialog(null)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  onClick={confirmDialog.onConfirm}
                  className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white font-black text-xs shadow-md transition-colors cursor-pointer"
                >
                  {confirmDialog.confirmText || 'Confirmar'}
                </button>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
