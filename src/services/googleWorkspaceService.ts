// Google Workspace Services Client
// Integrates Google Classroom, Google Calendar, Google Drive, and Google Tasks

import { getAccessToken } from './googleAuthService';

// Interfaces for Google Workspace Entities

export interface GoogleClassroomCourse {
  id: string;
  name: string;
  section?: string;
  descriptionHeading?: string;
  room?: string;
  courseState: string;
  alternateLink?: string;
}

export interface GoogleClassroomCourseWork {
  id: string;
  courseId: string;
  title: string;
  description?: string;
  state: string;
  alternateLink?: string;
  dueDate?: { year: number; month: number; day: number };
  dueTime?: { hours: number; minutes: number };
  maxPoints?: number;
}

export interface GoogleCalendarEvent {
  id: string;
  summary: string;
  description?: string;
  location?: string;
  htmlLink?: string;
  start: { dateTime?: string; date?: string; timeZone?: string };
  end: { dateTime?: string; date?: string; timeZone?: string };
}

export interface GoogleDriveFile {
  id: string;
  name: string;
  mimeType: string;
  webViewLink?: string;
  iconLink?: string;
  createdTime?: string;
  size?: string;
}

export interface GoogleTaskList {
  id: string;
  title: string;
  updated?: string;
}

export interface GoogleTaskItem {
  id: string;
  title: string;
  notes?: string;
  status: 'needsAction' | 'completed';
  due?: string;
  completed?: string;
  updated?: string;
}

// Helper to make authenticated requests with error inspection
async function authorizedFetch(url: string, options: RequestInit = {}): Promise<Response> {
  const token = await getAccessToken();
  if (!token) {
    throw new Error('No hay sesión de Google activa. Conéctate con Google para sincronizar.');
  }

  const headers = new Headers(options.headers || {});
  headers.set('Authorization', `Bearer ${token}`);
  if (!headers.has('Content-Type') && !(options.body instanceof FormData)) {
    headers.set('Content-Type', 'application/json');
  }

  const res = await fetch(url, { ...options, headers });
  if (!res.ok) {
    let errMessage = `Error ${res.status}`;
    try {
      const errJson = await res.json();
      errMessage = errJson?.error?.message || errMessage;
    } catch {}
    throw new Error(errMessage);
  }
  return res;
}

export const GoogleWorkspaceService = {
  // ==========================================
  // GOOGLE CLASSROOM
  // ==========================================

  /**
   * List courses from Google Classroom
   */
  async listCourses(): Promise<GoogleClassroomCourse[]> {
    try {
      const res = await authorizedFetch(
        'https://classroom.googleapis.com/v1/courses?courseStates=ACTIVE&pageSize=20'
      );
      const data = await res.json();
      return (data.courses as GoogleClassroomCourse[]) || [];
    } catch (err: any) {
      console.warn('Google Classroom listCourses:', err.message);
      throw err;
    }
  },

  /**
   * List coursework (tasks/assignments) for a specific course
   */
  async listCourseWork(courseId: string): Promise<GoogleClassroomCourseWork[]> {
    try {
      const res = await authorizedFetch(
        `https://classroom.googleapis.com/v1/courses/${courseId}/courseWork?pageSize=30`
      );
      const data = await res.json();
      return (data.courseWork as GoogleClassroomCourseWork[]) || [];
    } catch (err: any) {
      console.warn('Google Classroom listCourseWork:', err.message);
      throw err;
    }
  },

  // ==========================================
  // GOOGLE CALENDAR
  // ==========================================

  /**
   * List upcoming calendar events from primary calendar
   */
  async listCalendarEvents(): Promise<GoogleCalendarEvent[]> {
    try {
      const now = new Date();
      now.setHours(0, 0, 0, 0);
      const timeMin = now.toISOString();

      const url = `https://www.googleapis.com/calendar/v3/calendars/primary/events?timeMin=${encodeURIComponent(
        timeMin
      )}&singleEvents=true&orderBy=startTime&maxResults=25`;

      const res = await authorizedFetch(url);
      const data = await res.json();
      return (data.items as GoogleCalendarEvent[]) || [];
    } catch (err: any) {
      console.warn('Google Calendar listCalendarEvents:', err.message);
      throw err;
    }
  },

  /**
   * Create an event in primary calendar
   */
  async createCalendarEvent(event: {
    summary: string;
    description?: string;
    startDateTime: string; // ISO 8601
    endDateTime: string;   // ISO 8601
    location?: string;
  }): Promise<GoogleCalendarEvent> {
    const body = {
      summary: event.summary,
      description: event.description || 'Evento escolar sincronizado desde BoscoClass',
      location: event.location || 'Colegio San Juan Bosco',
      start: { dateTime: event.startDateTime },
      end: { dateTime: event.endDateTime },
      reminders: {
        useDefault: false,
        overrides: [
          { method: 'popup', minutes: 60 },
          { method: 'popup', minutes: 1440 },
        ],
      },
    };

    const res = await authorizedFetch(
      'https://www.googleapis.com/calendar/v3/calendars/primary/events',
      {
        method: 'POST',
        body: JSON.stringify(body),
      }
    );
    return res.json();
  },

  /**
   * Delete an event from primary calendar
   */
  async deleteCalendarEvent(eventId: string): Promise<void> {
    await authorizedFetch(
      `https://www.googleapis.com/calendar/v3/calendars/primary/events/${eventId}`,
      {
        method: 'DELETE',
      }
    );
  },

  // ==========================================
  // GOOGLE DRIVE
  // ==========================================

  /**
   * List files created or accessible in Google Drive
   */
  async listDriveFiles(): Promise<GoogleDriveFile[]> {
    try {
      const url =
        'https://www.googleapis.com/drive/v3/files?pageSize=30&fields=files(id,name,mimeType,webViewLink,iconLink,createdTime,size)&orderBy=createdTime%20desc';
      const res = await authorizedFetch(url);
      const data = await res.json();
      return (data.files as GoogleDriveFile[]) || [];
    } catch (err: any) {
      console.warn('Google Drive listDriveFiles:', err.message);
      throw err;
    }
  },

  /**
   * Create a text/markdown file in Google Drive
   */
  async uploadTextFile(fileName: string, content: string, mimeType = 'text/plain'): Promise<GoogleDriveFile> {
    const boundary = '-------314159265358979323846';
    const delimiter = `\r\n--${boundary}\r\n`;
    const closeDelimiter = `\r\n--${boundary}--`;

    const metadata = {
      name: fileName,
      mimeType,
      description: 'Documento o evidencia académica guardada desde BoscoClass',
    };

    const multipartRequestBody =
      delimiter +
      'Content-Type: application/json; charset=UTF-8\r\n\r\n' +
      JSON.stringify(metadata) +
      delimiter +
      `Content-Type: ${mimeType}\r\n\r\n` +
      content +
      closeDelimiter;

    const res = await authorizedFetch(
      'https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart&fields=id,name,mimeType,webViewLink',
      {
        method: 'POST',
        headers: {
          'Content-Type': `multipart/related; boundary=${boundary}`,
        },
        body: multipartRequestBody,
      }
    );
    return res.json();
  },

  /**
   * Delete a file from Google Drive
   */
  async deleteDriveFile(fileId: string): Promise<void> {
    await authorizedFetch(`https://www.googleapis.com/drive/v3/files/${fileId}`, {
      method: 'DELETE',
    });
  },

  // ==========================================
  // GOOGLE TASKS
  // ==========================================

  /**
   * List task lists
   */
  async listTaskLists(): Promise<GoogleTaskList[]> {
    try {
      const res = await authorizedFetch('https://tasks.googleapis.com/tasks/v1/users/@me/lists');
      const data = await res.json();
      return (data.items as GoogleTaskList[]) || [];
    } catch (err: any) {
      console.warn('Google Tasks listTaskLists:', err.message);
      throw err;
    }
  },

  /**
   * Find or create a dedicated "BoscoClass - Tareas" list
   */
  async getOrCreateBoscoTaskList(): Promise<GoogleTaskList> {
    const lists = await this.listTaskLists();
    const existing = lists.find((l) => l.title.toLowerCase().includes('boscoclass'));
    if (existing) {
      return existing;
    }

    const res = await authorizedFetch('https://tasks.googleapis.com/tasks/v1/users/@me/lists', {
      method: 'POST',
      body: JSON.stringify({ title: 'BoscoClass - Tareas y Entregas' }),
    });
    return res.json();
  },

  /**
   * List tasks from a specific list
   */
  async listTasks(taskListId = '@default'): Promise<GoogleTaskItem[]> {
    try {
      const res = await authorizedFetch(
        `https://tasks.googleapis.com/tasks/v1/lists/${taskListId}/tasks?showCompleted=true&maxResults=50`
      );
      const data = await res.json();
      return (data.items as GoogleTaskItem[]) || [];
    } catch (err: any) {
      console.warn('Google Tasks listTasks:', err.message);
      throw err;
    }
  },

  /**
   * Create a new task in a list
   */
  async createTask(taskListId: string, task: { title: string; notes?: string; due?: string }): Promise<GoogleTaskItem> {
    const body: Record<string, any> = {
      title: task.title,
      notes: task.notes || 'Asignada en BoscoClass',
    };
    if (task.due) {
      body.due = task.due;
    }

    const res = await authorizedFetch(
      `https://tasks.googleapis.com/tasks/v1/lists/${taskListId}/tasks`,
      {
        method: 'POST',
        body: JSON.stringify(body),
      }
    );
    return res.json();
  },

  /**
   * Toggle task completion status
   */
  async toggleTaskStatus(taskListId: string, taskId: string, completed: boolean): Promise<GoogleTaskItem> {
    const res = await authorizedFetch(
      `https://tasks.googleapis.com/tasks/v1/lists/${taskListId}/tasks/${taskId}`,
      {
        method: 'PATCH',
        body: JSON.stringify({
          status: completed ? 'completed' : 'needsAction',
        }),
      }
    );
    return res.json();
  },

  /**
   * Delete a task
   */
  async deleteTask(taskListId: string, taskId: string): Promise<void> {
    await authorizedFetch(`https://tasks.googleapis.com/tasks/v1/lists/${taskListId}/tasks/${taskId}`, {
      method: 'DELETE',
    });
  },

  // ==========================================
  // BULK SYNC HELPERS (BoscoClass -> Google)
  // ==========================================

  /**
   * Sync an array of BoscoClass tasks into Google Tasks
   */
  async syncBoscoTasksToGoogle(tasks: Array<{ id: string; title: string; materia?: string; fechaEntrega?: string; fecha?: string; descripcion?: string }>): Promise<{ syncedCount: number; listTitle: string }> {
    const list = await this.getOrCreateBoscoTaskList();
    const existingGoogleTasks = await this.listTasks(list.id);
    const existingTitles = new Set(existingGoogleTasks.map((t) => t.title.toLowerCase().trim()));

    let count = 0;
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

        await this.createTask(list.id, {
          title: fullTitle,
          notes: `${t.descripcion || 'Sin descripción adicional'}\n\nSincronizado desde BoscoClass (ID: ${t.id})`,
          due: dueDate,
        });
        count++;
      }
    }

    return { syncedCount: count, listTitle: list.title };
  },

  /**
   * Sync BoscoClass assignments deadlines to Google Calendar
   */
  async syncDeadlinesToCalendar(tasks: Array<{ id: string; title: string; materia?: string; fechaEntrega?: string; fecha?: string }>): Promise<number> {
    const existingEvents = await this.listCalendarEvents();
    const existingSummaries = new Set(existingEvents.map((e) => e.summary.toLowerCase().trim()));

    let count = 0;
    for (const t of tasks) {
      const dateRaw = t.fechaEntrega || t.fecha;
      if (!dateRaw) continue;
      const materiaName = t.materia || 'General';
      const targetSummary = `Entrega BoscoClass: [${materiaName}] ${t.title}`;
      if (!existingSummaries.has(targetSummary.toLowerCase().trim())) {
        const dueDate = new Date(dateRaw);
        if (isNaN(dueDate.getTime())) continue;

        const startIso = dueDate.toISOString();
        const endD = new Date(dueDate.getTime() + 60 * 60 * 1000); // 1 hour duration
        const endIso = endD.toISOString();

        await this.createCalendarEvent({
          summary: targetSummary,
          description: `Fecha límite de entrega académica para la materia ${materiaName}. Registrado en BoscoClass.`,
          startDateTime: startIso,
          endDateTime: endIso,
        });
        count++;
      }
    }

    return count;
  },
};
