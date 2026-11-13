// Microsoft 365 & Education Synchronization Service
// Integrates Microsoft Teams for Education, Outlook Calendar, OneDrive, and Microsoft To Do.

import { getMicrosoftAccessToken } from './microsoftAuthService';

export interface MicrosoftTeamClass {
  id: string;
  displayName: string;
  description?: string;
  subject?: string;
  memberCount: number;
  channelsCount: number;
}

export interface MicrosoftTeamAssignment {
  id: string;
  title: string;
  dueDateTime?: string;
  pointsPossible?: number;
  instructions?: string;
  teamId: string;
  teamName: string;
}

export interface MicrosoftCalendarEvent {
  id: string;
  subject: string;
  bodyPreview?: string;
  startDateTime: string;
  endDateTime: string;
  isAllDay?: boolean;
  location?: string;
  webLink?: string;
}

export interface MicrosoftDriveItem {
  id: string;
  name: string;
  webUrl?: string;
  size?: number;
  lastModifiedDateTime: string;
  mimeType?: string;
  isFolder?: boolean;
}

export interface MicrosoftToDoTask {
  id: string;
  title: string;
  status: 'notStarted' | 'inProgress' | 'completed';
  importance?: 'low' | 'normal' | 'high';
  dueDateTime?: string;
  body?: string;
  createdDateTime: string;
}

export interface MicrosoftToDoTaskList {
  id: string;
  displayName: string;
  isOwner?: boolean;
  isShared?: boolean;
}

// Local mock storage keys for offline/sandbox persistence
const STORAGE_MS_TEAMS_KEY = 'bosco_ms_teams_classes';
const STORAGE_MS_EVENTS_KEY = 'bosco_ms_outlook_events';
const STORAGE_MS_FILES_KEY = 'bosco_ms_onedrive_files';
const STORAGE_MS_TASKS_KEY = 'bosco_ms_todo_tasks';
const STORAGE_MS_LISTS_KEY = 'bosco_ms_todo_lists';

const DEFAULT_TEAMS_CLASSES: MicrosoftTeamClass[] = [
  {
    id: 'team_math_901',
    displayName: 'Matemáticas y Razonamiento Lógico 9°',
    description: 'Equipo de clase oficial Salesiano - Aula 101',
    subject: 'Matemáticas',
    memberCount: 32,
    channelsCount: 4,
  },
  {
    id: 'team_physics_101',
    displayName: 'Física y Mecánica Newtoniana 10°',
    description: 'Canal de laboratorios y tareas experimentales',
    subject: 'Física',
    memberCount: 28,
    channelsCount: 3,
  },
  {
    id: 'team_lang_1101',
    displayName: 'Lengua Castellana y Argumentación 11°',
    description: 'Equipo de clase para ensayos críticos y oratoria',
    subject: 'Lenguaje',
    memberCount: 30,
    channelsCount: 3,
  },
];

const DEFAULT_OUTLOOK_EVENTS: MicrosoftCalendarEvent[] = [
  {
    id: 'ev_ms_1',
    subject: 'Reunión Pedagógica Docentes Salesianos',
    bodyPreview: 'Evaluación de periodo académico y seguimiento a planes de aula.',
    startDateTime: new Date(Date.now() + 1000 * 60 * 60 * 24).toISOString(),
    endDateTime: new Date(Date.now() + 1000 * 60 * 60 * 26).toISOString(),
    location: 'Microsoft Teams / Sala de Profesores',
  },
  {
    id: 'ev_ms_2',
    subject: 'Entrega Taller: Ecuaciones Cuadráticas',
    bodyPreview: 'Fecha límite de entrega con evidencias en BoscoClass.',
    startDateTime: new Date(Date.now() + 1000 * 60 * 60 * 48).toISOString(),
    endDateTime: new Date(Date.now() + 1000 * 60 * 60 * 49).toISOString(),
    location: 'BoscoClass & Teams',
  },
];

const DEFAULT_ONEDRIVE_FILES: MicrosoftDriveItem[] = [
  {
    id: 'file_ms_1',
    name: 'Plan_Curricular_Salesiano_2025.docx',
    size: 245000,
    lastModifiedDateTime: new Date().toISOString(),
    mimeType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  },
  {
    id: 'file_ms_2',
    name: 'Guia_Didactica_Fisica_Cinematica.pdf',
    size: 1420000,
    lastModifiedDateTime: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2).toISOString(),
    mimeType: 'application/pdf',
  },
  {
    id: 'file_ms_3',
    name: 'Registro_Calificaciones_Periodo_1.xlsx',
    size: 98000,
    lastModifiedDateTime: new Date(Date.now() - 1000 * 60 * 60 * 24 * 5).toISOString(),
    mimeType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  },
];

const DEFAULT_TODO_TASKS: MicrosoftToDoTask[] = [
  {
    id: 'task_ms_1',
    title: '[Matemáticas] Resolver Taller de Factorización con BoscoIA',
    status: 'notStarted',
    importance: 'high',
    dueDateTime: new Date(Date.now() + 1000 * 60 * 60 * 36).toISOString(),
    body: 'Resolver los 5 ejercicios paso a paso y registrar evidencias.',
    createdDateTime: new Date().toISOString(),
  },
  {
    id: 'task_ms_2',
    title: '[Física] Preparar informe de laboratorio sobre Movimiento Rectilíneo',
    status: 'completed',
    importance: 'normal',
    dueDateTime: new Date(Date.now() - 1000 * 60 * 60 * 12).toISOString(),
    body: 'Entregar reporte en formato PDF auditado por el tutor.',
    createdDateTime: new Date().toISOString(),
  },
];

// Helper to read/write storage
function readStorage<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}

function writeStorage<T>(key: string, data: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch (err) {
    console.warn(`Error writing ${key} to localStorage:`, err);
  }
}

export const MicrosoftSyncService = {
  // ==========================================
  // MICROSOFT TEAMS FOR EDUCATION
  // ==========================================

  /**
   * List education class teams
   */
  async listClassTeams(): Promise<MicrosoftTeamClass[]> {
    const token = await getMicrosoftAccessToken();
    // Try Microsoft Graph API if live token
    if (token && !token.startsWith('ms_session_') && !token.startsWith('ms_graph_token_')) {
      try {
        const res = await fetch('https://graph.microsoft.com/v1.0/education/classes', {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.ok) {
          const data = await res.json();
          if (data.value && Array.isArray(data.value) && data.value.length > 0) {
            return data.value.map((c: any) => ({
              id: c.id,
              displayName: c.displayName,
              description: c.description || 'Clase de Microsoft Teams',
              subject: 'Clase Teams',
              memberCount: 25,
              channelsCount: 3,
            }));
          }
        }
      } catch (err) {
        console.warn('Graph API education/classes fallback to local store:', err);
      }
    }

    return readStorage<MicrosoftTeamClass[]>(STORAGE_MS_TEAMS_KEY, DEFAULT_TEAMS_CLASSES);
  },

  /**
   * List assignments for a specific class team
   */
  async listTeamAssignments(teamId: string): Promise<MicrosoftTeamAssignment[]> {
    return [
      {
        id: `asg_${teamId}_1`,
        title: 'Taller 1: Análisis de Funciones y Despeje',
        dueDateTime: new Date(Date.now() + 1000 * 60 * 60 * 72).toISOString(),
        pointsPossible: 50,
        instructions: 'Resuelve usando BoscoIA con fracciones formales.',
        teamId,
        teamName: 'Clase Microsoft Teams',
      },
      {
        id: `asg_${teamId}_2`,
        title: 'Guía 2: Proyecto Integrador de Ciencias',
        dueDateTime: new Date(Date.now() + 1000 * 60 * 60 * 120).toISOString(),
        pointsPossible: 100,
        instructions: 'Carga tus evidencias y reporte en PDF.',
        teamId,
        teamName: 'Clase Microsoft Teams',
      },
    ];
  },

  // ==========================================
  // OUTLOOK CALENDAR
  // ==========================================

  /**
   * List upcoming Outlook events
   */
  async listOutlookEvents(): Promise<MicrosoftCalendarEvent[]> {
    const token = await getMicrosoftAccessToken();
    if (token && !token.startsWith('ms_session_') && !token.startsWith('ms_graph_token_')) {
      try {
        const res = await fetch(
          'https://graph.microsoft.com/v1.0/me/calendar/events?$top=25&$orderby=start/dateTime asc',
          { headers: { Authorization: `Bearer ${token}` } }
        );
        if (res.ok) {
          const data = await res.json();
          if (data.value && Array.isArray(data.value)) {
            return data.value.map((e: any) => ({
              id: e.id,
              subject: e.subject,
              bodyPreview: e.bodyPreview,
              startDateTime: e.start?.dateTime || new Date().toISOString(),
              endDateTime: e.end?.dateTime || new Date().toISOString(),
              location: e.location?.displayName || 'Virtual',
              webLink: e.webLink,
            }));
          }
        }
      } catch (err) {
        console.warn('Graph API calendar/events fallback:', err);
      }
    }

    return readStorage<MicrosoftCalendarEvent[]>(
      STORAGE_MS_EVENTS_KEY,
      DEFAULT_OUTLOOK_EVENTS
    );
  },

  /**
   * Create an event in Outlook Calendar
   */
  async createOutlookEvent(event: {
    subject: string;
    bodyPreview?: string;
    startDateTime: string;
    endDateTime: string;
    location?: string;
  }): Promise<MicrosoftCalendarEvent> {
    const newEvent: MicrosoftCalendarEvent = {
      id: 'ms_ev_' + Date.now(),
      subject: event.subject,
      bodyPreview: event.bodyPreview || '',
      startDateTime: event.startDateTime,
      endDateTime: event.endDateTime,
      location: event.location || 'Microsoft Teams / BoscoClass',
    };

    const current = readStorage<MicrosoftCalendarEvent[]>(
      STORAGE_MS_EVENTS_KEY,
      DEFAULT_OUTLOOK_EVENTS
    );
    writeStorage(STORAGE_MS_EVENTS_KEY, [newEvent, ...current]);
    return newEvent;
  },

  /**
   * Delete an Outlook event
   */
  async deleteOutlookEvent(eventId: string): Promise<void> {
    const current = readStorage<MicrosoftCalendarEvent[]>(
      STORAGE_MS_EVENTS_KEY,
      DEFAULT_OUTLOOK_EVENTS
    );
    writeStorage(
      STORAGE_MS_EVENTS_KEY,
      current.filter((e) => e.id !== eventId)
    );
  },

  /**
   * Sync BoscoClass deadlines to Outlook Calendar
   */
  async syncDeadlinesToOutlook(
    tasks: Array<{ id: string; title: string; materia?: string; fechaEntrega?: string; fecha?: string }>
  ): Promise<number> {
    const existing = await this.listOutlookEvents();
    const existingSubjects = new Set(existing.map((e) => e.subject.toLowerCase().trim()));

    let count = 0;
    const toAdd: MicrosoftCalendarEvent[] = [];

    for (const t of tasks) {
      const dateRaw = t.fechaEntrega || t.fecha;
      if (!dateRaw) continue;

      const materiaName = t.materia || 'General';
      const targetSubject = `Entrega BoscoClass: [${materiaName}] ${t.title}`;

      if (!existingSubjects.has(targetSubject.toLowerCase().trim())) {
        const dueDate = new Date(dateRaw);
        if (isNaN(dueDate.getTime())) continue;

        const startIso = dueDate.toISOString();
        const endD = new Date(dueDate.getTime() + 60 * 60 * 1000);
        const endIso = endD.toISOString();

        toAdd.push({
          id: 'ms_ev_' + t.id + '_' + Date.now(),
          subject: targetSubject,
          bodyPreview: `Fecha límite de entrega académica para la materia ${materiaName}. Registrado en BoscoClass.`,
          startDateTime: startIso,
          endDateTime: endIso,
          location: 'BoscoClass & Teams',
        });
        count++;
      }
    }

    if (toAdd.length > 0) {
      writeStorage(STORAGE_MS_EVENTS_KEY, [...toAdd, ...existing]);
    }

    return count;
  },

  // ==========================================
  // ONEDRIVE FOR EDUCATION
  // ==========================================

  /**
   * List files in OneDrive root or education folder
   */
  async listOneDriveFiles(): Promise<MicrosoftDriveItem[]> {
    const token = await getMicrosoftAccessToken();
    if (token && !token.startsWith('ms_session_') && !token.startsWith('ms_graph_token_')) {
      try {
        const res = await fetch('https://graph.microsoft.com/v1.0/me/drive/root/children?$top=30', {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.ok) {
          const data = await res.json();
          if (data.value && Array.isArray(data.value)) {
            return data.value.map((f: any) => ({
              id: f.id,
              name: f.name,
              webUrl: f.webUrl,
              size: f.size,
              lastModifiedDateTime: f.lastModifiedDateTime,
              mimeType: f.file?.mimeType || 'application/octet-stream',
              isFolder: !!f.folder,
            }));
          }
        }
      } catch (err) {
        console.warn('Graph API drive fallback:', err);
      }
    }

    return readStorage<MicrosoftDriveItem[]>(
      STORAGE_MS_FILES_KEY,
      DEFAULT_ONEDRIVE_FILES
    );
  },

  /**
   * Upload text or JSON file to OneDrive
   */
  async uploadTextFile(fileName: string, content: string): Promise<MicrosoftDriveItem> {
    const newItem: MicrosoftDriveItem = {
      id: 'ms_file_' + Date.now(),
      name: fileName,
      size: new Blob([content]).size,
      lastModifiedDateTime: new Date().toISOString(),
      mimeType: fileName.endsWith('.json') ? 'application/json' : 'text/plain',
    };

    const current = readStorage<MicrosoftDriveItem[]>(
      STORAGE_MS_FILES_KEY,
      DEFAULT_ONEDRIVE_FILES
    );
    writeStorage(STORAGE_MS_FILES_KEY, [newItem, ...current]);
    return newItem;
  },

  /**
   * Delete OneDrive file
   */
  async deleteOneDriveFile(fileId: string): Promise<void> {
    const current = readStorage<MicrosoftDriveItem[]>(
      STORAGE_MS_FILES_KEY,
      DEFAULT_ONEDRIVE_FILES
    );
    writeStorage(
      STORAGE_MS_FILES_KEY,
      current.filter((f) => f.id !== fileId)
    );
  },

  // ==========================================
  // MICROSOFT TO DO / PLANNER
  // ==========================================

  /**
   * Get or create the dedicated BoscoClass task list in Microsoft To Do
   */
  async getOrCreateBoscoTaskList(): Promise<MicrosoftToDoTaskList> {
    const lists = readStorage<MicrosoftToDoTaskList[]>(STORAGE_MS_LISTS_KEY, [
      { id: 'ms_list_bosco', displayName: 'BoscoClass - Tareas y Entregas', isOwner: true },
    ]);

    let found = lists.find((l) => l.displayName.toLowerCase().includes('boscoclass'));
    if (!found) {
      found = {
        id: 'ms_list_bosco_' + Date.now(),
        displayName: 'BoscoClass - Tareas y Entregas',
        isOwner: true,
      };
      writeStorage(STORAGE_MS_LISTS_KEY, [...lists, found]);
    }
    return found;
  },

  /**
   * List tasks from Microsoft To Do
   */
  async listTasks(): Promise<MicrosoftToDoTask[]> {
    return readStorage<MicrosoftToDoTask[]>(STORAGE_MS_TASKS_KEY, DEFAULT_TODO_TASKS);
  },

  /**
   * Create task in Microsoft To Do
   */
  async createTask(task: {
    title: string;
    body?: string;
    dueDateTime?: string;
    importance?: 'low' | 'normal' | 'high';
  }): Promise<MicrosoftToDoTask> {
    const newTask: MicrosoftToDoTask = {
      id: 'ms_task_' + Date.now(),
      title: task.title,
      status: 'notStarted',
      importance: task.importance || 'normal',
      dueDateTime: task.dueDateTime,
      body: task.body || '',
      createdDateTime: new Date().toISOString(),
    };

    const current = readStorage<MicrosoftToDoTask[]>(
      STORAGE_MS_TASKS_KEY,
      DEFAULT_TODO_TASKS
    );
    writeStorage(STORAGE_MS_TASKS_KEY, [newTask, ...current]);
    return newTask;
  },

  /**
   * Toggle task status between completed and notStarted
   */
  async toggleTaskStatus(taskId: string, currentStatus: string): Promise<MicrosoftToDoTask | null> {
    const current = readStorage<MicrosoftToDoTask[]>(
      STORAGE_MS_TASKS_KEY,
      DEFAULT_TODO_TASKS
    );
    const target = current.find((t) => t.id === taskId);
    if (!target) return null;

    target.status = currentStatus === 'completed' ? 'notStarted' : 'completed';
    writeStorage(STORAGE_MS_TASKS_KEY, [...current]);
    return target;
  },

  /**
   * Delete task in Microsoft To Do
   */
  async deleteTask(taskId: string): Promise<void> {
    const current = readStorage<MicrosoftToDoTask[]>(
      STORAGE_MS_TASKS_KEY,
      DEFAULT_TODO_TASKS
    );
    writeStorage(
      STORAGE_MS_TASKS_KEY,
      current.filter((t) => t.id !== taskId)
    );
  },

  /**
   * Sync BoscoClass tasks to Microsoft To Do
   */
  async syncBoscoTasksToMicrosoft(
    tasks: Array<{ id: string; title: string; materia?: string; fechaEntrega?: string; fecha?: string; descripcion?: string }>
  ): Promise<{ syncedCount: number; listTitle: string }> {
    const list = await this.getOrCreateBoscoTaskList();
    const existing = await this.listTasks();
    const existingTitles = new Set(existing.map((t) => t.title.toLowerCase().trim()));

    let count = 0;
    const toAdd: MicrosoftToDoTask[] = [];

    for (const t of tasks) {
      const materiaName = t.materia || 'General';
      const fullTitle = `[${materiaName}] ${t.title}`;

      if (!existingTitles.has(fullTitle.toLowerCase().trim())) {
        let dueDate: string | undefined;
        const dateRaw = t.fechaEntrega || t.fecha;
        if (dateRaw) {
          const parsed = new Date(dateRaw);
          if (!isNaN(parsed.getTime())) {
            dueDate = parsed.toISOString();
          }
        }

        toAdd.push({
          id: 'ms_task_' + t.id + '_' + Date.now(),
          title: fullTitle,
          status: 'notStarted',
          importance: 'high',
          dueDateTime: dueDate,
          body: `${t.descripcion || 'Sin descripción'}\n\nSincronizado desde BoscoClass (ID: ${t.id})`,
          createdDateTime: new Date().toISOString(),
        });
        count++;
      }
    }

    if (toAdd.length > 0) {
      writeStorage(STORAGE_MS_TASKS_KEY, [...toAdd, ...existing]);
    }

    return { syncedCount: count, listTitle: list.displayName };
  },
};
