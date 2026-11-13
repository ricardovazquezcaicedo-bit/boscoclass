import React, { useState, useEffect } from 'react';
import { X, BookOpen, GraduationCap, CheckCircle2, Download, ExternalLink, Sparkles, Clock, User, Share2, Upload } from 'lucide-react';
import { LmsTask, INITIAL_LMS_TASKS } from '../types';
import { ClassPointService } from '../services/classPointStorage';

interface LmsIntegrationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectTaskPrompt: (promptText: string) => void;
  username: string;
  onOpenClassPointPortal?: () => void;
}

export const LmsIntegrationModal: React.FC<LmsIntegrationModalProps> = ({
  isOpen,
  onClose,
  onSelectTaskPrompt,
  username,
  onOpenClassPointPortal,
}) => {
  const [tasks, setTasks] = useState<LmsTask[]>(() => {
    const cpTasks = ClassPointService.getLmsTasks(username);
    return cpTasks.length > 0 ? cpTasks : INITIAL_LMS_TASKS;
  });
  const [isClassroomConnected, setIsClassroomConnected] = useState(true);
  const [selectedTaskForReport, setSelectedTaskForReport] = useState<LmsTask | null>(null);

  useEffect(() => {
    if (isOpen) {
      const cpTasks = ClassPointService.getLmsTasks(username);
      if (cpTasks.length > 0) {
        setTasks(cpTasks);
      }
    }
  }, [isOpen, username]);

  if (!isOpen) return null;

  const handleGenerateReport = (task: LmsTask) => {
    setSelectedTaskForReport(task);
  };

  const handleDownloadReport = (task: LmsTask) => {
    const reportText = `# Informe Pedagógico de Entrega - ClassPoint & LMS
**Estudiante:** ${username}
**Asignatura:** ${task.course}
**Docente:** ${task.teacher}
**Taller / Actividad:** ${task.title}
**Fecha de Entrega:** ${new Date().toLocaleDateString()}

---

### 1. Rúbrica y Criterios Evaluados:
> ${task.rubric}

### 2. Evidencia de Aprendizaje Paso a Paso (Auditoría BoscoIA + ClassPoint):
- **Razonamiento guiado:** El estudiante resolvió el taller siguiendo el método socrático y paso a paso.
- **Pistas solicitadas:** 1 pista conceptual de apoyo sin atajos directos.
- **Notación matemática:** Se emplearon fórmulas formalizadas en LaTeX con fracciones tipográficas.
- **Recompensa Gamificada:** +25 Boscoints (BC) acreditados en el Mercado Escolar.
- **Nivel de Dominio Conceptual:** 95% (Sobresaliente).

### 3. Conclusión del Tutor BoscoIA:
El estudiante demostró apropiación del concepto, verificando sus respuestas de forma autónoma con espíritu de excelencia académica.
`;

    const blob = new Blob([reportText], { type: 'text/markdown;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `entrega_classpoint_${task.id}.md`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="relative w-full max-w-xl bg-white dark:bg-[#101c18] border border-slate-200 dark:border-[#1e332b] rounded-3xl shadow-2xl p-6 text-slate-800 dark:text-slate-100 max-h-[90vh] overflow-y-auto space-y-5">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-[#1a2e26]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-sky-500/15 text-sky-600 dark:text-sky-400 grid place-items-center shadow-xs">
              <BookOpen className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-base font-bold leading-tight">Integración con LMS y Tareas Escolares</h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                ClassPoint · Google Classroom · Moodle · Rúbricas e Informes
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-[#182a23] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* LMS Connection Status Banners */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
          {/* ClassPoint Native Card */}
          <div className="p-3 rounded-2xl border border-[#50c6b3]/50 bg-[#176b87]/10 flex flex-col justify-between">
            <div className="flex items-center gap-2 min-w-0">
              <div className="w-6 h-6 rounded-lg bg-[#176b87] text-white font-black grid place-items-center text-xs shrink-0">
                CP
              </div>
              <div className="min-w-0">
                <p className="text-xs font-bold text-slate-900 dark:text-[#7be2cb] truncate">ClassPoint</p>
                <p className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-0.5">
                  <CheckCircle2 className="w-3 h-3" />
                  Nativo
                </p>
              </div>
            </div>
            {onOpenClassPointPortal && (
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onOpenClassPointPortal();
                }}
                className="mt-2 text-[10px] font-bold text-[#176b87] dark:text-[#7be2cb] hover:underline text-left"
              >
                Abrir Portal →
              </button>
            )}
          </div>

          {/* Google Classroom Card */}
          <div className="p-3 rounded-2xl border border-emerald-500/30 bg-emerald-50/40 dark:bg-emerald-950/20 flex flex-col justify-between">
            <div className="flex items-center gap-2 min-w-0">
              <div className="w-6 h-6 rounded-lg bg-emerald-600 text-white font-bold grid place-items-center text-xs shrink-0">
                G
              </div>
              <div className="min-w-0">
                <p className="text-xs font-bold text-slate-900 dark:text-emerald-100 truncate">Classroom</p>
                <p className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-0.5">
                  <CheckCircle2 className="w-3 h-3" />
                  Sincronizado
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setIsClassroomConnected(!isClassroomConnected)}
              className="mt-2 text-[10px] font-semibold text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 underline text-left"
            >
              {isClassroomConnected ? 'Activo' : 'Conectar'}
            </button>
          </div>

          {/* Moodle / Canvas Card */}
          <div className="p-3 rounded-2xl border border-slate-200 dark:border-[#1d352b] bg-slate-50/70 dark:bg-[#0c1613] flex flex-col justify-between">
            <div className="flex items-center gap-2 min-w-0">
              <div className="w-6 h-6 rounded-lg bg-amber-600 text-white font-bold grid place-items-center text-xs shrink-0">
                M
              </div>
              <div className="min-w-0">
                <p className="text-xs font-bold text-slate-900 dark:text-slate-100 truncate">Moodle</p>
                <p className="text-[10px] text-slate-500">Exportación</p>
              </div>
            </div>
            <span className="mt-2 text-[10px] text-slate-500 font-semibold">
              Listo (.md)
            </span>
          </div>
        </div>

        {/* Assigned Workshops List */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
              <GraduationCap className="w-3.5 h-3.5 text-emerald-500" />
              Talleres y Guías Asignadas por tus Docentes
            </h3>
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-sky-500/10 text-sky-600 dark:text-sky-400 font-bold">
              {tasks.length} Actividades
            </span>
          </div>

          <div className="space-y-3">
            {tasks.map((task) => (
              <div
                key={task.id}
                className="p-4 rounded-2xl border border-slate-200 dark:border-[#1d352b] bg-white dark:bg-[#0c1613] hover:border-emerald-500/40 transition-all space-y-3 shadow-xs"
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <span className="text-[10px] font-semibold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">
                      {task.course}
                    </span>
                    <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100 mt-0.5">
                      {task.title}
                    </h4>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 flex items-center gap-3 mt-1">
                      <span className="flex items-center gap-1">
                        <User className="w-3 h-3 text-slate-400" />
                        {task.teacher}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3 text-slate-400" />
                        Entrega: {task.dueDate}
                      </span>
                    </p>
                  </div>

                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${
                      task.status === 'in_progress'
                        ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400'
                        : 'bg-slate-100 dark:bg-[#1a2d26] text-slate-500'
                    }`}
                  >
                    {task.status === 'in_progress' ? 'En Progreso' : 'Pendiente'}
                  </span>
                </div>

                {/* Rubric snippet */}
                <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-[#12231c] border border-slate-200/60 dark:border-[#1b3429] text-[11px] text-slate-600 dark:text-slate-300 leading-relaxed">
                  <strong>Rúbrica del docente:</strong> {task.rubric}
                </div>

                {/* Actions */}
                <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => handleDownloadReport(task)}
                    className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-[#192c24] border border-slate-200 dark:border-[#1e342b] transition-colors"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Informe de Entrega (.md)</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      onSelectTaskPrompt(task.samplePrompt);
                      onClose();
                    }}
                    className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-semibold bg-emerald-600 hover:bg-emerald-500 text-white transition-all shadow-xs active:scale-[0.98]"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Resolver con BoscoIA</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
