import React, { useState, useEffect } from 'react';
import {
  X,
  RefreshCw,
  Calendar,
  FolderOpen,
  CheckSquare,
  Users,
  ExternalLink,
  Plus,
  Trash2,
  CheckCircle2,
  AlertCircle,
  Upload,
  ArrowRight,
  LogOut,
  Layers,
  Sparkles,
} from 'lucide-react';
import {
  microsoftSignIn,
  microsoftSignOut,
  getCurrentMicrosoftUser,
  isMicrosoftConnected,
} from '../services/microsoftAuthService';
import {
  MicrosoftSyncService,
  MicrosoftTeamClass,
  MicrosoftCalendarEvent,
  MicrosoftDriveItem,
  MicrosoftToDoTask,
  MicrosoftTeamAssignment,
} from '../services/microsoftSyncService';
import { ClassPointTarea, ClassPointAula } from '../types';

interface MicrosoftSyncHubModalProps {
  isOpen: boolean;
  onClose: () => void;
  tareas: ClassPointTarea[];
  aulas: ClassPointAula[];
  onImportAulas?: (newAulas: ClassPointAula[]) => void;
  userRole?: string;
}

export const MicrosoftSyncHubModal: React.FC<MicrosoftSyncHubModalProps> = ({
  isOpen,
  onClose,
  tareas,
  aulas,
  onImportAulas,
  userRole = 'estudiante',
}) => {
  const [isConnected, setIsConnected] = useState(isMicrosoftConnected());
  const [msUser, setMsUser] = useState(getCurrentMicrosoftUser());
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);

  // Active sub-tab in Microsoft Hub
  const [activeTab, setActiveTab] = useState<'teams' | 'outlook' | 'onedrive' | 'todo'>('teams');

  // Loading states
  const [isLoadingData, setIsLoadingData] = useState(false);
  const [actionSuccessMsg, setActionSuccessMsg] = useState<string | null>(null);

  // Teams data
  const [teams, setTeams] = useState<MicrosoftTeamClass[]>([]);
  const [selectedTeam, setSelectedTeam] = useState<MicrosoftTeamClass | null>(null);
  const [teamAssignments, setTeamAssignments] = useState<MicrosoftTeamAssignment[]>([]);

  // Outlook Calendar data
  const [events, setEvents] = useState<MicrosoftCalendarEvent[]>([]);
  const [newEventSubject, setNewEventSubject] = useState('');
  const [newEventDate, setNewEventDate] = useState('');
  const [newEventTime, setNewEventTime] = useState('09:00');
  const [newEventLocation, setNewEventLocation] = useState('Microsoft Teams');

  // OneDrive data
  const [files, setFiles] = useState<MicrosoftDriveItem[]>([]);
  const [newFileName, setNewFileName] = useState('');
  const [newFileContent, setNewFileContent] = useState('');

  // To Do data
  const [todoTasks, setTodoTasks] = useState<MicrosoftToDoTask[]>([]);
  const [newTodoTitle, setNewTodoTitle] = useState('');
  const [newTodoDue, setNewTodoDue] = useState('');
  const [newTodoImportance, setNewTodoImportance] = useState<'low' | 'normal' | 'high'>('normal');

  // Explicit confirmation dialog state
  const [confirmDialog, setConfirmDialog] = useState<{
    isOpen: boolean;
    title: string;
    description: string;
    confirmText?: string;
    onConfirm: () => Promise<void> | void;
  } | null>(null);

  // Load Microsoft Hub data when opened or connected
  useEffect(() => {
    if (isOpen) {
      const connected = isMicrosoftConnected();
      setIsConnected(connected);
      setMsUser(getCurrentMicrosoftUser());
      if (connected) {
        loadDataForCurrentTab(activeTab);
      }
    }
  }, [isOpen, activeTab]);

  const loadDataForCurrentTab = async (tab: typeof activeTab) => {
    setIsLoadingData(true);
    setAuthError(null);
    try {
      if (tab === 'teams') {
        const teamList = await MicrosoftSyncService.listClassTeams();
        setTeams(teamList);
        if (teamList.length > 0 && !selectedTeam) {
          setSelectedTeam(teamList[0]);
          const asgs = await MicrosoftSyncService.listTeamAssignments(teamList[0].id);
          setTeamAssignments(asgs);
        }
      } else if (tab === 'outlook') {
        const evList = await MicrosoftSyncService.listOutlookEvents();
        setEvents(evList);
      } else if (tab === 'onedrive') {
        const fileList = await MicrosoftSyncService.listOneDriveFiles();
        setFiles(fileList);
      } else if (tab === 'todo') {
        const tList = await MicrosoftSyncService.listTasks();
        setTodoTasks(tList);
      }
    } catch (err: any) {
      console.warn('Error cargando datos de Microsoft 365:', err);
      setAuthError(err.message || 'Error al conectar con Microsoft 365.');
    } finally {
      setIsLoadingData(false);
    }
  };

  // Sign In with Microsoft / @salesianos
  const handleMicrosoftLogin = async () => {
    setIsAuthenticating(true);
    setAuthError(null);
    try {
      const res = await microsoftSignIn('estudiante@salesianos.edu.co', 'Estudiante Salesiano');
      setMsUser(res.user);
      setIsConnected(true);
      setActionSuccessMsg('✅ Conexión con Microsoft 365 y @salesianos activada con éxito.');
      setTimeout(() => setActionSuccessMsg(null), 4000);
      await loadDataForCurrentTab(activeTab);
    } catch (err: any) {
      console.error('Error Microsoft Sign-In:', err);
      setAuthError(err.message || 'No se pudo iniciar sesión con Microsoft.');
    } finally {
      setIsAuthenticating(false);
    }
  };

  // Sign Out
  const handleMicrosoftLogout = () => {
    setConfirmDialog({
      isOpen: true,
      title: 'Desconectar Microsoft 365',
      description: '¿Deseas desvincular tu cuenta de Microsoft 365 / @salesianos de BoscoClass?',
      confirmText: 'Desconectar',
      onConfirm: async () => {
        await microsoftSignOut();
        setIsConnected(false);
        setMsUser(null);
        setConfirmDialog(null);
        setActionSuccessMsg('Cuenta de Microsoft desconectada.');
        setTimeout(() => setActionSuccessMsg(null), 3000);
      },
    });
  };

  // Sync BoscoClass Deadlines to Outlook Calendar
  const handleSyncDeadlinesToOutlook = () => {
    const pendingWithDue = tareas.filter((t) => t.fecha);
    if (pendingWithDue.length === 0) {
      setActionSuccessMsg('No hay tareas con fecha de entrega límite para sincronizar.');
      setTimeout(() => setActionSuccessMsg(null), 3500);
      return;
    }

    setConfirmDialog({
      isOpen: true,
      title: 'Sincronizar entregas a Outlook Calendar',
      description: `¿Deseas agregar ${pendingWithDue.length} fechas límite de tareas escolares a tu calendario principal de Outlook?`,
      confirmText: 'Sincronizar Calendario',
      onConfirm: async () => {
        try {
          setIsLoadingData(true);
          const count = await MicrosoftSyncService.syncDeadlinesToOutlook(
            pendingWithDue.map((t) => ({
              id: t.id,
              title: t.titulo,
              materia: t.materia,
              fecha: t.fecha,
            }))
          );
          setActionSuccessMsg(`✅ ¡${count} evento(s) sincronizado(s) exitosamente con Outlook!`);
          setTimeout(() => setActionSuccessMsg(null), 4000);
          const ev = await MicrosoftSyncService.listOutlookEvents();
          setEvents(ev);
        } catch (err: any) {
          setAuthError(err.message || 'Error al sincronizar con Outlook.');
        } finally {
          setIsLoadingData(false);
          setConfirmDialog(null);
        }
      },
    });
  };

  // Sync BoscoClass Tasks to Microsoft To Do
  const handleSyncTasksToMicrosoft = () => {
    if (tareas.length === 0) {
      setActionSuccessMsg('No hay tareas registradas en BoscoClass para sincronizar.');
      setTimeout(() => setActionSuccessMsg(null), 3500);
      return;
    }

    setConfirmDialog({
      isOpen: true,
      title: 'Sincronizar tareas a Microsoft To Do',
      description: `Se creará o actualizará la lista "BoscoClass - Tareas y Entregas" en Microsoft To Do con ${tareas.length} actividades escolares. ¿Deseas continuar?`,
      confirmText: 'Sincronizar con Microsoft To Do',
      onConfirm: async () => {
        try {
          setIsLoadingData(true);
          const result = await MicrosoftSyncService.syncBoscoTasksToMicrosoft(
            tareas.map((t) => ({
              id: t.id,
              title: t.titulo,
              materia: t.materia,
              fecha: t.fecha,
              descripcion: t.descripcion,
            }))
          );
          setActionSuccessMsg(
            `✅ ¡${result.syncedCount} tarea(s) agregada(s) a la lista "${result.listTitle}" de Microsoft To Do!`
          );
          setTimeout(() => setActionSuccessMsg(null), 4000);
          await loadDataForCurrentTab('todo');
        } catch (err: any) {
          setAuthError(err.message || 'Error al sincronizar con Microsoft To Do.');
        } finally {
          setIsLoadingData(false);
          setConfirmDialog(null);
        }
      },
    });
  };

  // Import Teams Classes as BoscoClass Aulas
  const handleImportTeamsToAulas = () => {
    if (teams.length === 0) return;

    const existingNames = new Set(aulas.map((a) => a.nombre.toLowerCase().trim()));
    const newAulas: ClassPointAula[] = teams
      .filter((tm) => !existingNames.has(tm.displayName.toLowerCase().trim()))
      .map((tm) => ({
        id: `ms_team_${tm.id}`,
        nombre: tm.displayName,
        horario: 'Lunes a Viernes (Teams Educativo)',
        profesor: msUser?.displayName || 'Docente Microsoft Teams',
        codigo: (tm.id || '').slice(-6).toUpperCase() || 'MS-101',
        estudiantes: [],
        grado: 'Curso Teams',
        materia: tm.subject || 'Microsoft Teams',
        institucion: 'Microsoft 365 Education',
        descripcion: tm.description || `Equipo de clase importado de Microsoft Teams: ${tm.displayName}`,
      }));

    if (newAulas.length === 0) {
      setActionSuccessMsg('Todos los salones de Microsoft Teams ya se encuentran importados en BoscoClass.');
      setTimeout(() => setActionSuccessMsg(null), 4000);
      return;
    }

    setConfirmDialog({
      isOpen: true,
      title: 'Importar Salones de Microsoft Teams',
      description: `Se importarán ${newAulas.length} salones de Microsoft Teams a las aulas de BoscoClass.`,
      confirmText: 'Importar Salones',
      onConfirm: async () => {
        if (onImportAulas) {
          onImportAulas(newAulas);
        }
        setActionSuccessMsg(`✅ ¡${newAulas.length} aula(s) importada(s) desde Teams exitosamente!`);
        setTimeout(() => setActionSuccessMsg(null), 4000);
        setConfirmDialog(null);
      },
    });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/75 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white dark:bg-[#0f172a] rounded-3xl max-w-4xl w-full max-h-[92vh] flex flex-col shadow-2xl border border-blue-200 dark:border-blue-950 overflow-hidden text-[#1e293b] dark:text-[#f8fafc]">
        {/* Header with Microsoft 4-Color Theme */}
        <div className="p-4 sm:p-5 bg-gradient-to-r from-[#0078d4] via-[#0284c7] to-[#0369a1] text-white flex items-center justify-between border-b-2 border-amber-400">
          <div className="flex items-center gap-3">
            {/* Authentic Microsoft Logo */}
            <div className="w-10 h-10 rounded-2xl bg-white p-2 shadow-md grid place-items-center shrink-0">
              <div className="w-6 h-6 grid grid-cols-2 gap-0.5">
                <div className="bg-[#f25022] rounded-xs" />
                <div className="bg-[#7fba00] rounded-xs" />
                <div className="bg-[#00a4ef] rounded-xs" />
                <div className="bg-[#ffb900] rounded-xs" />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-black tracking-tight leading-tight">
                  Microsoft 365 Education
                </h2>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-white/20 text-white uppercase tracking-wider">
                  @salesianos
                </span>
              </div>
              <p className="text-xs text-blue-100/90 font-medium">
                Teams Educativo · Outlook Calendar · OneDrive · Microsoft To Do
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {isConnected && msUser && (
              <button
                type="button"
                onClick={handleMicrosoftLogout}
                className="px-2.5 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-semibold flex items-center gap-1.5 transition-colors"
                title="Desconectar cuenta"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Desconectar</span>
              </button>
            )}
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-full hover:bg-white/20 text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Account Connection Status Bar */}
        <div className="px-5 py-3 bg-blue-50 dark:bg-blue-950/40 border-b border-blue-200 dark:border-blue-900/50 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 text-xs">
          {isConnected && msUser ? (
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-full overflow-hidden border border-blue-300">
                <img
                  src={
                    msUser.photoURL ||
                    `https://api.dicebear.com/7.x/identicon/svg?seed=${msUser.email}&backgroundColor=0078d4`
                  }
                  alt={msUser.displayName || 'Usuario Microsoft'}
                  className="w-full h-full object-cover"
                />
              </div>
              <div>
                <span className="font-extrabold text-blue-950 dark:text-blue-200">
                  {msUser.displayName}
                </span>{' '}
                <span className="text-blue-700 dark:text-blue-400">({msUser.email})</span>
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-2 text-blue-900 dark:text-blue-300">
              <AlertCircle className="w-4 h-4 text-amber-500 shrink-0" />
              <span>Conecta tu cuenta institucional @salesianos o Microsoft 365 para sincronizar.</span>
            </div>
          )}

          {!isConnected ? (
            <button
              type="button"
              onClick={handleMicrosoftLogin}
              disabled={isAuthenticating}
              className="px-4 py-2 rounded-xl bg-[#0078d4] hover:bg-[#006cbd] text-white font-extrabold text-xs shadow-md transition-all flex items-center gap-2 shrink-0 cursor-pointer disabled:opacity-50"
            >
              {isAuthenticating ? (
                <RefreshCw className="w-4 h-4 animate-spin" />
              ) : (
                <div className="w-3.5 h-3.5 grid grid-cols-2 gap-0.5">
                  <div className="bg-[#f25022]" />
                  <div className="bg-[#7fba00]" />
                  <div className="bg-[#00a4ef]" />
                  <div className="bg-[#ffb900]" />
                </div>
              )}
              <span>{isAuthenticating ? 'Conectando...' : 'Conectar con Microsoft'}</span>
            </button>
          ) : (
            <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 font-black text-[10px] border border-emerald-300 dark:border-emerald-800">
              ● Sincronización Activa
            </span>
          )}
        </div>

        {/* Global Toast / Success Message */}
        {actionSuccessMsg && (
          <div className="mx-5 mt-3 p-3 rounded-2xl bg-emerald-600 text-white font-bold text-xs flex items-center gap-2 shadow-md animate-in fade-in">
            <CheckCircle2 className="w-4 h-4 shrink-0 text-amber-300" />
            <span>{actionSuccessMsg}</span>
          </div>
        )}

        {/* Global Error Banner */}
        {authError && (
          <div className="mx-5 mt-3 p-3 rounded-2xl bg-rose-600 text-white font-bold text-xs flex items-center justify-between gap-2 shadow-md">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-amber-200" />
              <span>{authError}</span>
            </div>
            <button
              type="button"
              onClick={() => setAuthError(null)}
              className="text-white hover:text-amber-200 text-xs underline"
            >
              Cerrar
            </button>
          </div>
        )}

        {/* Tab Navigation */}
        <div className="flex border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-[#091122] px-5 overflow-x-auto">
          {[
            { id: 'teams', label: 'Teams Educativo', icon: Users, count: teams.length },
            { id: 'outlook', label: 'Outlook Calendar', icon: Calendar, count: events.length },
            { id: 'onedrive', label: 'OneDrive Escolar', icon: FolderOpen, count: files.length },
            { id: 'todo', label: 'Microsoft To Do', icon: CheckSquare, count: todoTasks.length },
          ].map((tab) => {
            const Icon = tab.icon;
            const active = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-2 py-3 px-4 text-xs font-bold border-b-2 transition-all whitespace-nowrap cursor-pointer ${
                  active
                    ? 'border-[#0078d4] text-[#0078d4] dark:text-[#38bdf8] bg-white dark:bg-[#0f172a]'
                    : 'border-transparent text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{tab.label}</span>
                {tab.count > 0 && (
                  <span
                    className={`px-1.5 py-0.2 rounded-full text-[10px] font-black ${
                      active
                        ? 'bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300'
                        : 'bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                    }`}
                  >
                    {tab.count}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Body Container */}
        <div className="p-5 flex-1 overflow-y-auto space-y-4">
          {!isConnected ? (
            /* Unconnected State Hero */
            <div className="py-12 px-6 text-center max-w-lg mx-auto space-y-4">
              <div className="w-16 h-16 rounded-3xl bg-blue-100 dark:bg-blue-950/60 text-[#0078d4] dark:text-[#38bdf8] grid place-items-center mx-auto shadow-md">
                <Sparkles className="w-8 h-8 text-[#0078d4]" />
              </div>
              <div>
                <h3 className="text-lg font-black text-slate-900 dark:text-white">
                  Vincula tu cuenta de Microsoft 365
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  Accede a tus salones de Microsoft Teams for Education, sincroniza fechas límite en Outlook, almacena respaldos en OneDrive y organiza tus tareas con Microsoft To Do.
                </p>
              </div>

              <div className="pt-2">
                <button
                  type="button"
                  onClick={handleMicrosoftLogin}
                  disabled={isAuthenticating}
                  className="px-6 py-3 rounded-2xl bg-gradient-to-r from-[#0078d4] via-[#0284c7] to-[#0369a1] hover:from-[#006cbd] hover:to-[#0284c7] text-white font-black text-sm shadow-lg transition-all flex items-center justify-center gap-2.5 mx-auto active:scale-95 cursor-pointer"
                >
                  <div className="w-4 h-4 grid grid-cols-2 gap-0.5">
                    <div className="bg-[#f25022]" />
                    <div className="bg-[#7fba00]" />
                    <div className="bg-[#00a4ef]" />
                    <div className="bg-[#ffb900]" />
                  </div>
                  <span>{isAuthenticating ? 'Iniciando sesión...' : 'Conectar Cuenta @salesianos'}</span>
                </button>
              </div>
            </div>
          ) : (
            /* Connected Content by Tab */
            <>
              {/* TAB 1: TEAMS FOR EDUCATION */}
              {activeTab === 'teams' && (
                <div className="space-y-4">
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-4 rounded-2xl bg-blue-50/60 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-900">
                    <div>
                      <h4 className="text-xs font-black uppercase text-blue-900 dark:text-blue-200 flex items-center gap-1.5">
                        <Users className="w-4 h-4 text-[#0078d4]" />
                        <span>Equipos de Clase en Microsoft Teams</span>
                      </h4>
                      <p className="text-xs text-blue-800 dark:text-blue-300 mt-0.5">
                        Equipos pedagógicos activos de tu cuenta educativa. Puedes importarlos directamente a tus salones de BoscoClass.
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={handleImportTeamsToAulas}
                      className="px-4 py-2 rounded-xl bg-[#0078d4] hover:bg-[#006cbd] text-white font-bold text-xs shadow-xs transition-all flex items-center gap-1.5 shrink-0 cursor-pointer"
                    >
                      <Layers className="w-3.5 h-3.5" />
                      <span>Importar Salones a BoscoClass</span>
                    </button>
                  </div>

                  {isLoadingData ? (
                    <div className="p-8 text-center text-xs text-slate-400">
                      <RefreshCw className="w-5 h-5 animate-spin mx-auto mb-2 text-[#0078d4]" />
                      Cargando equipos de Microsoft Teams...
                    </div>
                  ) : teams.length === 0 ? (
                    <div className="p-8 text-center rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs text-slate-500">
                      No se encontraron equipos de clase en Microsoft Teams.
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                      {teams.map((t) => (
                        <div
                          key={t.id}
                          onClick={async () => {
                            setSelectedTeam(t);
                            const asgs = await MicrosoftSyncService.listTeamAssignments(t.id);
                            setTeamAssignments(asgs);
                          }}
                          className={`p-4 rounded-2xl border transition-all cursor-pointer text-left ${
                            selectedTeam?.id === t.id
                              ? 'bg-blue-50 dark:bg-blue-950/50 border-[#0078d4] shadow-sm'
                              : 'bg-white dark:bg-[#1e293b] border-slate-200 dark:border-slate-800 hover:border-blue-300'
                          }`}
                        >
                          <div className="flex items-center gap-2 mb-2">
                            <span className="w-7 h-7 rounded-lg bg-[#0078d4] text-white font-black text-xs grid place-items-center">
                              T
                            </span>
                            <span className="text-[10px] px-2 py-0.5 rounded-md bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-300 font-bold">
                              {t.subject}
                            </span>
                          </div>
                          <h5 className="font-extrabold text-xs text-slate-900 dark:text-white line-clamp-1">
                            {t.displayName}
                          </h5>
                          <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 line-clamp-2">
                            {t.description}
                          </p>
                          <div className="mt-3 pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-[10px] text-slate-500">
                            <span>👥 {t.memberCount} integrantes</span>
                            <span>📢 {t.channelsCount} canales</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Selected Team Assignments */}
                  {selectedTeam && (
                    <div className="mt-4 p-4 rounded-2xl bg-slate-50 dark:bg-[#131d31] border border-slate-200 dark:border-slate-800 space-y-3">
                      <div className="flex items-center justify-between">
                        <h5 className="text-xs font-black text-slate-900 dark:text-white flex items-center gap-1.5">
                          <span>📋 Asignaciones de Teams para: {selectedTeam.displayName}</span>
                        </h5>
                        <span className="text-[10px] text-slate-500 font-medium">
                          {teamAssignments.length} asignaciones disponibles
                        </span>
                      </div>

                      <div className="space-y-2">
                        {teamAssignments.map((asg) => (
                          <div
                            key={asg.id}
                            className="p-3 rounded-xl bg-white dark:bg-[#1e293b] border border-slate-200 dark:border-slate-700 flex items-center justify-between gap-3 text-xs"
                          >
                            <div>
                              <div className="font-bold text-slate-900 dark:text-white">
                                {asg.title}
                              </div>
                              <span className="text-[10px] text-slate-500 dark:text-slate-400">
                                {asg.instructions} · Máximo: {asg.pointsPossible} pts
                              </span>
                            </div>
                            <span className="px-2 py-1 rounded-lg text-[10px] font-black bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 shrink-0">
                              Entrega: {asg.dueDateTime ? new Date(asg.dueDateTime).toLocaleDateString() : 'Pendiente'}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* TAB 2: OUTLOOK CALENDAR */}
              {activeTab === 'outlook' && (
                <div className="space-y-4">
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-4 rounded-2xl bg-sky-50 dark:bg-sky-950/30 border border-sky-200 dark:border-sky-900">
                    <div>
                      <h4 className="text-xs font-black uppercase text-sky-900 dark:text-sky-200 flex items-center gap-1.5">
                        <Calendar className="w-4 h-4 text-[#0284c7]" />
                        <span>Outlook Calendar (Microsoft 365)</span>
                      </h4>
                      <p className="text-xs text-sky-800 dark:text-sky-300 mt-0.5">
                        Sincroniza automáticamente las fechas límite de entrega de BoscoClass con tu calendario personal de Outlook.
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={handleSyncDeadlinesToOutlook}
                      className="px-4 py-2 rounded-xl bg-[#0284c7] hover:bg-[#0369a1] text-white font-bold text-xs shadow-xs transition-all flex items-center gap-1.5 shrink-0 cursor-pointer"
                    >
                      <Upload className="w-3.5 h-3.5" />
                      <span>Sincronizar Entregas ({tareas.filter((t) => t.fecha).length})</span>
                    </button>
                  </div>

                  {/* Create New Outlook Event */}
                  <div className="p-4 rounded-2xl bg-white dark:bg-[#1e293b] border border-slate-200 dark:border-slate-800 space-y-3">
                    <span className="text-xs font-black text-slate-900 dark:text-white flex items-center gap-1.5">
                      <Plus className="w-3.5 h-3.5 text-[#0078d4]" />
                      <span>Agendar Nuevo Evento en Outlook</span>
                    </span>
                    <div className="grid grid-cols-1 sm:grid-cols-4 gap-2">
                      <input
                        type="text"
                        value={newEventSubject}
                        onChange={(e) => setNewEventSubject(e.target.value)}
                        placeholder="Título del evento escolar..."
                        className="sm:col-span-2 p-2.5 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 outline-none focus:ring-2 focus:ring-[#0078d4]"
                      />
                      <input
                        type="date"
                        value={newEventDate}
                        onChange={(e) => setNewEventDate(e.target.value)}
                        className="p-2.5 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 outline-none focus:ring-2 focus:ring-[#0078d4]"
                      />
                      <button
                        type="button"
                        onClick={async () => {
                          if (!newEventSubject.trim() || !newEventDate) return;
                          const startD = new Date(`${newEventDate}T${newEventTime || '09:00'}:00`);
                          const endD = new Date(startD.getTime() + 60 * 60 * 1000);
                          await MicrosoftSyncService.createOutlookEvent({
                            subject: newEventSubject,
                            startDateTime: startD.toISOString(),
                            endDateTime: endD.toISOString(),
                            location: newEventLocation,
                          });
                          setNewEventSubject('');
                          setNewEventDate('');
                          setActionSuccessMsg('Evento agendado en Outlook Calendar.');
                          setTimeout(() => setActionSuccessMsg(null), 3500);
                          const ev = await MicrosoftSyncService.listOutlookEvents();
                          setEvents(ev);
                        }}
                        className="py-2.5 px-3 rounded-xl bg-[#0078d4] hover:bg-[#006cbd] text-white font-bold text-xs transition-colors cursor-pointer"
                      >
                        + Crear Evento
                      </button>
                    </div>
                  </div>

                  {/* List of Events */}
                  <div className="space-y-2">
                    {events.length === 0 ? (
                      <p className="p-8 text-center text-xs text-slate-400">
                        No hay eventos próximos registrados en Outlook Calendar.
                      </p>
                    ) : (
                      events.map((ev) => (
                        <div
                          key={ev.id}
                          className="p-3.5 rounded-2xl bg-white dark:bg-[#1e293b] border border-slate-200 dark:border-slate-800 flex items-center justify-between gap-3 shadow-xs"
                        >
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-blue-100 dark:bg-blue-950 text-[#0078d4] dark:text-[#38bdf8] grid place-items-center font-black text-xs shrink-0">
                              📅
                            </div>
                            <div>
                              <h5 className="font-bold text-xs text-slate-900 dark:text-white">
                                {ev.subject}
                              </h5>
                              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                                🕒 {new Date(ev.startDateTime).toLocaleString()} · 📍 {ev.location || 'Teams'}
                              </p>
                            </div>
                          </div>

                          <button
                            type="button"
                            onClick={() => {
                              setConfirmDialog({
                                isOpen: true,
                                title: 'Eliminar Evento de Outlook',
                                description: `¿Deseas eliminar "${ev.subject}" de tu calendario de Outlook?`,
                                confirmText: 'Eliminar',
                                onConfirm: async () => {
                                  await MicrosoftSyncService.deleteOutlookEvent(ev.id);
                                  const evList = await MicrosoftSyncService.listOutlookEvents();
                                  setEvents(evList);
                                  setConfirmDialog(null);
                                },
                              });
                            }}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 transition-colors"
                            title="Eliminar evento"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}

              {/* TAB 3: ONEDRIVE */}
              {activeTab === 'onedrive' && (
                <div className="space-y-4">
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-900">
                    <div>
                      <h4 className="text-xs font-black uppercase text-emerald-900 dark:text-emerald-200 flex items-center gap-1.5">
                        <FolderOpen className="w-4 h-4 text-emerald-600" />
                        <span>OneDrive para la Educación</span>
                      </h4>
                      <p className="text-xs text-emerald-800 dark:text-emerald-300 mt-0.5">
                        Almacena evidencias, guías pedagógicas y respaldos de tus cursos en la nube segura de Microsoft.
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={() => {
                        const backupData = JSON.stringify(
                          {
                            aulas,
                            tareas,
                            exportDate: new Date().toISOString(),
                            platform: 'BoscoClass - Salesianos',
                          },
                          null,
                          2
                        );
                        setConfirmDialog({
                          isOpen: true,
                          title: 'Subir Respaldo a OneDrive',
                          description: 'Se guardará un archivo JSON con todas las aulas y tareas en tu OneDrive.',
                          confirmText: 'Guardar Respaldo',
                          onConfirm: async () => {
                            await MicrosoftSyncService.uploadTextFile(
                              `BoscoClass_Respaldo_${new Date().toISOString().slice(0, 10)}.json`,
                              backupData
                            );
                            const fl = await MicrosoftSyncService.listOneDriveFiles();
                            setFiles(fl);
                            setActionSuccessMsg('✅ Respaldo cargado exitosamente en OneDrive.');
                            setTimeout(() => setActionSuccessMsg(null), 4000);
                            setConfirmDialog(null);
                          },
                        });
                      }}
                      className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-xs transition-all flex items-center gap-1.5 shrink-0 cursor-pointer"
                    >
                      <Upload className="w-3.5 h-3.5" />
                      <span>Cargar Respaldo a OneDrive</span>
                    </button>
                  </div>

                  {/* Upload new file form */}
                  <div className="p-4 rounded-2xl bg-white dark:bg-[#1e293b] border border-slate-200 dark:border-slate-800 space-y-3">
                    <span className="text-xs font-black text-slate-900 dark:text-white flex items-center gap-1.5">
                      <Plus className="w-3.5 h-3.5 text-emerald-600" />
                      <span>Crear / Subir Documento a OneDrive</span>
                    </span>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                      <input
                        type="text"
                        value={newFileName}
                        onChange={(e) => setNewFileName(e.target.value)}
                        placeholder="Nombre de archivo (ej: Resumen_Clase.docx)"
                        className="sm:col-span-2 p-2.5 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 outline-none focus:ring-2 focus:ring-emerald-500"
                      />
                      <button
                        type="button"
                        onClick={async () => {
                          if (!newFileName.trim()) return;
                          await MicrosoftSyncService.uploadTextFile(
                            newFileName,
                            newFileContent || 'Documento creado desde BoscoClass.'
                          );
                          setNewFileName('');
                          setNewFileContent('');
                          setActionSuccessMsg('Documento guardado en OneDrive.');
                          setTimeout(() => setActionSuccessMsg(null), 3500);
                          const fl = await MicrosoftSyncService.listOneDriveFiles();
                          setFiles(fl);
                        }}
                        className="py-2.5 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs transition-colors cursor-pointer"
                      >
                        + Guardar Archivo
                      </button>
                    </div>
                  </div>

                  {/* List of files */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {files.length === 0 ? (
                      <p className="sm:col-span-2 p-8 text-center text-xs text-slate-400">
                        No hay archivos en tu OneDrive Escolar.
                      </p>
                    ) : (
                      files.map((file) => (
                        <div
                          key={file.id}
                          className="p-3.5 rounded-2xl bg-white dark:bg-[#1e293b] border border-slate-200 dark:border-slate-800 flex items-center justify-between gap-3 shadow-xs"
                        >
                          <div className="flex items-center gap-2.5 min-w-0">
                            <span className="text-2xl shrink-0">
                              {file.name.endsWith('.docx')
                                ? '📄'
                                : file.name.endsWith('.xlsx')
                                ? '📊'
                                : file.name.endsWith('.pdf')
                                ? '📕'
                                : '📁'}
                            </span>
                            <div className="min-w-0">
                              <h5 className="font-bold text-xs text-slate-900 dark:text-white truncate">
                                {file.name}
                              </h5>
                              <span className="text-[10px] text-slate-500 dark:text-slate-400 block mt-0.5">
                                {file.size ? `${Math.round(file.size / 1024)} KB` : '12 KB'} ·{' '}
                                {new Date(file.lastModifiedDateTime).toLocaleDateString()}
                              </span>
                            </div>
                          </div>

                          <button
                            type="button"
                            onClick={() => {
                              setConfirmDialog({
                                isOpen: true,
                                title: 'Eliminar Archivo de OneDrive',
                                description: `¿Deseas eliminar "${file.name}" de OneDrive?`,
                                confirmText: 'Eliminar',
                                onConfirm: async () => {
                                  await MicrosoftSyncService.deleteOneDriveFile(file.id);
                                  const fl = await MicrosoftSyncService.listOneDriveFiles();
                                  setFiles(fl);
                                  setConfirmDialog(null);
                                },
                              });
                            }}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 transition-colors shrink-0"
                            title="Eliminar de OneDrive"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}

              {/* TAB 4: MICROSOFT TO DO */}
              {activeTab === 'todo' && (
                <div className="space-y-4">
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900">
                    <div>
                      <h4 className="text-xs font-black uppercase text-amber-900 dark:text-amber-200 flex items-center gap-1.5">
                        <CheckSquare className="w-4 h-4 text-amber-600" />
                        <span>Microsoft To Do (Lista BoscoClass)</span>
                      </h4>
                      <p className="text-xs text-amber-800 dark:text-amber-300 mt-0.5">
                        Organiza tus tareas escolares y márcalas como completadas con sincronización en tiempo real.
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={handleSyncTasksToMicrosoft}
                      className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs shadow-xs transition-all flex items-center gap-1.5 shrink-0 cursor-pointer"
                    >
                      <Upload className="w-3.5 h-3.5" />
                      <span>Sincronizar Tareas ({tareas.length})</span>
                    </button>
                  </div>

                  {/* Create New Task Form */}
                  <div className="p-4 rounded-2xl bg-white dark:bg-[#1e293b] border border-slate-200 dark:border-slate-800 space-y-3">
                    <span className="text-xs font-black text-slate-900 dark:text-white flex items-center gap-1.5">
                      <Plus className="w-3.5 h-3.5 text-amber-600" />
                      <span>Agregar Tarea a Microsoft To Do</span>
                    </span>
                    <div className="grid grid-cols-1 sm:grid-cols-4 gap-2">
                      <input
                        type="text"
                        value={newTodoTitle}
                        onChange={(e) => setNewTodoTitle(e.target.value)}
                        placeholder="Descripción o título de la tarea..."
                        className="sm:col-span-2 p-2.5 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 outline-none focus:ring-2 focus:ring-amber-500"
                      />
                      <select
                        value={newTodoImportance}
                        onChange={(e) => setNewTodoImportance(e.target.value as any)}
                        className="p-2.5 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 outline-none focus:ring-2 focus:ring-amber-500"
                      >
                        <option value="normal">Prioridad Normal</option>
                        <option value="high">Prioridad Alta 🔥</option>
                        <option value="low">Prioridad Baja</option>
                      </select>
                      <button
                        type="button"
                        onClick={async () => {
                          if (!newTodoTitle.trim()) return;
                          await MicrosoftSyncService.createTask({
                            title: newTodoTitle,
                            importance: newTodoImportance,
                          });
                          setNewTodoTitle('');
                          setActionSuccessMsg('Tarea agregada a Microsoft To Do.');
                          setTimeout(() => setActionSuccessMsg(null), 3500);
                          const tList = await MicrosoftSyncService.listTasks();
                          setTodoTasks(tList);
                        }}
                        className="py-2.5 px-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs transition-colors cursor-pointer"
                      >
                        + Agregar
                      </button>
                    </div>
                  </div>

                  {/* Tasks List */}
                  <div className="space-y-2">
                    {todoTasks.length === 0 ? (
                      <p className="p-8 text-center text-xs text-slate-400">
                        No hay tareas en tu lista de Microsoft To Do.
                      </p>
                    ) : (
                      todoTasks.map((task) => {
                        const isDone = task.status === 'completed';
                        return (
                          <div
                            key={task.id}
                            className={`p-3.5 rounded-2xl border transition-all flex items-center justify-between gap-3 ${
                              isDone
                                ? 'bg-slate-50 dark:bg-slate-900/60 border-slate-200 dark:border-slate-800 opacity-70'
                                : 'bg-white dark:bg-[#1e293b] border-slate-200 dark:border-slate-800 shadow-xs'
                            }`}
                          >
                            <div className="flex items-center gap-3">
                              <button
                                type="button"
                                onClick={async () => {
                                  await MicrosoftSyncService.toggleTaskStatus(task.id, task.status);
                                  const tList = await MicrosoftSyncService.listTasks();
                                  setTodoTasks(tList);
                                }}
                                className={`w-5 h-5 rounded-lg border flex items-center justify-center transition-colors cursor-pointer ${
                                  isDone
                                    ? 'bg-emerald-600 border-emerald-600 text-white'
                                    : 'border-slate-300 dark:border-slate-600 hover:border-amber-500'
                                }`}
                              >
                                {isDone && <CheckCircle2 className="w-3.5 h-3.5" />}
                              </button>

                              <div>
                                <h5
                                  className={`font-bold text-xs ${
                                    isDone
                                      ? 'line-through text-slate-400 dark:text-slate-500'
                                      : 'text-slate-900 dark:text-white'
                                  }`}
                                >
                                  {task.title}
                                </h5>
                                <span className="text-[10px] text-slate-500 dark:text-slate-400">
                                  {task.dueDateTime
                                    ? `Límite: ${new Date(task.dueDateTime).toLocaleDateString()}`
                                    : 'Sin fecha límite'}
                                </span>
                              </div>
                            </div>

                            <button
                              type="button"
                              onClick={() => {
                                setConfirmDialog({
                                  isOpen: true,
                                  title: 'Eliminar Tarea de Microsoft To Do',
                                  description: `¿Deseas eliminar "${task.title}"?`,
                                  confirmText: 'Eliminar',
                                  onConfirm: async () => {
                                    await MicrosoftSyncService.deleteTask(task.id);
                                    const tList = await MicrosoftSyncService.listTasks();
                                    setTodoTasks(tList);
                                    setConfirmDialog(null);
                                  },
                                });
                              }}
                              className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 transition-colors"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50 dark:bg-[#091122] border-t border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs text-slate-500">
          <span className="flex items-center gap-1.5 font-medium">
            <span className="w-2 h-2 rounded-full bg-blue-500" />
            Integración Microsoft 365 + Carisma Salesiano
          </span>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 font-bold transition-colors cursor-pointer"
          >
            Cerrar
          </button>
        </div>
      </div>

      {/* Confirmation Dialog Modal */}
      {confirmDialog && confirmDialog.isOpen && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200 dark:border-slate-800 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-blue-100 dark:bg-blue-950/80 text-[#0078d4] grid place-items-center shrink-0">
                <AlertCircle className="w-5 h-5 text-[#0078d4]" />
              </div>
              <h3 className="text-sm font-black text-slate-900 dark:text-white">
                {confirmDialog.title}
              </h3>
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
              {confirmDialog.description}
            </p>
            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setConfirmDialog(null)}
                className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={confirmDialog.onConfirm}
                className="px-4 py-2 rounded-xl text-xs font-black bg-[#0078d4] hover:bg-[#006cbd] text-white shadow-md transition-colors cursor-pointer"
              >
                {confirmDialog.confirmText || 'Confirmar'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
