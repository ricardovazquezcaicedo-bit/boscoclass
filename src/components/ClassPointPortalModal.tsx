import React, { useState, useEffect } from 'react';
import {
  X,
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
} from 'lucide-react';
import { ClassPointService } from '../services/classPointStorage';
import {
  ClassPointAula,
  ClassPointCalificacion,
  ClassPointTarea,
  ClassPointProducto,
  ClassPointChisme,
  ClassPointAnuncio,
} from '../types';

interface ClassPointPortalModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectTaskToTutor: (taskPrompt: string) => void;
  username: string;
}

export const ClassPointPortalModal: React.FC<ClassPointPortalModalProps> = ({
  isOpen,
  onClose,
  onSelectTaskToTutor,
  username,
}) => {
  const [activeTab, setActiveTab] = useState<'resumen' | 'tareas' | 'calificaciones' | 'mercado' | 'aulas' | 'chismografo' | 'respaldo'>('resumen');
  const [tareas, setTareas] = useState<ClassPointTarea[]>([]);
  const [calificaciones, setCalificaciones] = useState<ClassPointCalificacion[]>([]);
  const [aulas, setAulas] = useState<ClassPointAula[]>([]);
  const [productos, setProductos] = useState<ClassPointProducto[]>([]);
  const [chismes, setChismes] = useState<ClassPointChisme[]>([]);
  const [anuncios, setAnuncios] = useState<ClassPointAnuncio[]>([]);
  const [classCoins, setClassCoins] = useState<number>(120);
  const [nuevoChismeTexto, setNuevoChismeTexto] = useState('');
  const [compraMensaje, setCompraMensaje] = useState<string | null>(null);
  const [respaldoMensaje, setRespaldoMensaje] = useState<string | null>(null);

  const refreshData = () => {
    setTareas(ClassPointService.getTareas(username));
    setCalificaciones(ClassPointService.getCalificaciones(username));
    setAulas(ClassPointService.getAulas());
    setProductos(ClassPointService.getProductos());
    setChismes(ClassPointService.getChismes());
    setAnuncios(ClassPointService.getAnuncios());
    setClassCoins(ClassPointService.getClassCoins(username));
  };

  useEffect(() => {
    if (isOpen) {
      refreshData();
    }
  }, [isOpen, username]);

  if (!isOpen) return null;

  const metrics = ClassPointService.getStudentMetrics(username);

  const handleComprar = (prod: ClassPointProducto) => {
    if (classCoins < prod.precio) {
      setCompraMensaje(`Necesitas ${prod.precio} Boscoints (tienes ${classCoins}). ¡Resuelve talleres con BoscoIA para ganar más!`);
      return;
    }
    const success = ClassPointService.spendClassCoins(username, prod.precio);
    if (success) {
      setClassCoins(ClassPointService.getClassCoins(username));
      setCompraMensaje(`¡Recompensa canjeada: ${prod.nombre}! Presenta tu comprobante al docente.`);
      setTimeout(() => setCompraMensaje(null), 4000);
    }
  };

  const handlePublicarChisme = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nuevoChismeTexto.trim()) return;
    ClassPointService.addChisme({
      tipo: 'aula',
      aulaId: 'aula-1',
      texto: nuevoChismeTexto.trim(),
      autor: username,
      autorUsuario: username.toLowerCase(),
      destinatario: 'todo el salón',
    });
    setNuevoChismeTexto('');
    setChismes(ClassPointService.getChismes());
  };

  const handleExportarRespaldo = () => {
    const jsonStr = ClassPointService.exportBackup();
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `classpoint-respaldo-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
    setRespaldoMensaje('Copia de seguridad de ClassPoint exportada correctamente.');
  };

  const handleImportarRespaldo = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      const res = ClassPointService.importBackup(content);
      setRespaldoMensaje(res.message);
      if (res.success) {
        refreshData();
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/70 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="relative w-full max-w-4xl bg-[#f8fafc] dark:bg-[#0c1613] border border-slate-200 dark:border-[#1d352b] rounded-3xl shadow-2xl flex flex-col max-h-[92vh] overflow-hidden text-slate-800 dark:text-slate-100">
        
        {/* ClassPoint Modern Header */}
        <div className="px-5 py-3.5 bg-gradient-to-r from-[#103d5b] via-[#176b87] to-[#258ca0] text-white flex items-center justify-between shadow-md shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white border border-white/20 p-1 shadow-md grid place-items-center shrink-0 font-extrabold">
              <img
                src="/assets/aistudio/image_c159dc3e.png"
                alt="BoscoClass"
                className="w-full h-full object-contain"
              />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-extrabold tracking-tight">Bosco<span className="text-[#7be2cb]">Class</span></h2>
                <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-white/20 text-white">
                  Plataforma Escolar
                </span>
              </div>
              <p className="text-xs text-white/80 hidden sm:block">
                Demuestra, Valida y Evoluciona · Conectado con el Tutor Inteligente BoscoIA
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            {/* Boscoints Badge */}
            <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#12344d]/60 border border-white/20 text-[#fff1b8] text-xs font-bold shadow-xs">
              <span className="w-5 h-5 rounded-full bg-gradient-to-br from-amber-300 to-amber-500 text-amber-950 text-[10px] grid place-items-center font-extrabold">
                BC
              </span>
              <span>{classCoins} Boscoints</span>
            </div>

            <button
              onClick={onClose}
              className="p-1.5 rounded-xl text-white/80 hover:text-white hover:bg-white/10 transition-colors"
              title="Cerrar portal"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Horizontal Navigation Tabs */}
        <div className="flex items-center gap-1 px-4 py-2 bg-slate-100/90 dark:bg-[#12231e] border-b border-slate-200 dark:border-[#1a2e26] overflow-x-auto shrink-0 scrollbar-none text-xs font-semibold">
          <button
            onClick={() => setActiveTab('resumen')}
            className={`px-3 py-1.5 rounded-xl whitespace-nowrap transition-colors ${
              activeTab === 'resumen'
                ? 'bg-[#176b87] text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-300 hover:bg-slate-200/60 dark:hover:bg-[#1a332a]'
            }`}
          >
            📊 Resumen General
          </button>
          <button
            onClick={() => setActiveTab('tareas')}
            className={`px-3 py-1.5 rounded-xl whitespace-nowrap transition-colors flex items-center gap-1.5 ${
              activeTab === 'tareas'
                ? 'bg-[#176b87] text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-300 hover:bg-slate-200/60 dark:hover:bg-[#1a332a]'
            }`}
          >
            📝 Tareas y Evidencias
            {metrics.tareasPendientes > 0 && (
              <span className="w-4 h-4 rounded-full bg-amber-500 text-white text-[10px] grid place-items-center">
                {metrics.tareasPendientes}
              </span>
            )}
          </button>
          <button
            onClick={() => setActiveTab('calificaciones')}
            className={`px-3 py-1.5 rounded-xl whitespace-nowrap transition-colors ${
              activeTab === 'calificaciones'
                ? 'bg-[#176b87] text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-300 hover:bg-slate-200/60 dark:hover:bg-[#1a332a]'
            }`}
          >
            📈 Calificaciones & Periodos
          </button>
          <button
            onClick={() => setActiveTab('aulas')}
            className={`px-3 py-1.5 rounded-xl whitespace-nowrap transition-colors ${
              activeTab === 'aulas'
                ? 'bg-[#176b87] text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-300 hover:bg-slate-200/60 dark:hover:bg-[#1a332a]'
            }`}
          >
            🏛️ Mis Aulas
          </button>
          <button
            onClick={() => setActiveTab('mercado')}
            className={`px-3 py-1.5 rounded-xl whitespace-nowrap transition-colors ${
              activeTab === 'mercado'
                ? 'bg-[#176b87] text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-300 hover:bg-slate-200/60 dark:hover:bg-[#1a332a]'
            }`}
          >
            🪙 Mercado de Recompensas
          </button>
          <button
            onClick={() => setActiveTab('chismografo')}
            className={`px-3 py-1.5 rounded-xl whitespace-nowrap transition-colors ${
              activeTab === 'chismografo'
                ? 'bg-[#176b87] text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-300 hover:bg-slate-200/60 dark:hover:bg-[#1a332a]'
            }`}
          >
            🗣️ El Chismógrafo
          </button>
          <button
            onClick={() => setActiveTab('respaldo')}
            className={`px-3 py-1.5 rounded-xl whitespace-nowrap transition-colors ${
              activeTab === 'respaldo'
                ? 'bg-[#176b87] text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-300 hover:bg-slate-200/60 dark:hover:bg-[#1a332a]'
            }`}
          >
            💾 Copias de Seguridad
          </button>
        </div>

        {/* Tab Content Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-5">
          
          {/* TAB 1: RESUMEN GENERAL */}
          {activeTab === 'resumen' && (
            <div className="space-y-5">
              {/* Metric Cards Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="p-4 rounded-2xl bg-white dark:bg-[#10201a] border border-slate-200 dark:border-[#1d352b] shadow-xs">
                  <span className="text-[11px] uppercase font-bold text-slate-400 tracking-wider">Promedio General</span>
                  <div className="text-2xl font-black text-[#176b87] dark:text-[#50c6b3] mt-1">{metrics.promedio}</div>
                  <small className="text-[10px] text-slate-500">{metrics.notasRegistradas} calificaciones</small>
                </div>
                <div className="p-4 rounded-2xl bg-white dark:bg-[#10201a] border border-slate-200 dark:border-[#1d352b] shadow-xs">
                  <span className="text-[11px] uppercase font-bold text-slate-400 tracking-wider">Tareas Pendientes</span>
                  <div className="text-2xl font-black text-amber-600 dark:text-amber-400 mt-1">{metrics.tareasPendientes}</div>
                  <small className="text-[10px] text-slate-500">{metrics.tareasCompletadas} completadas</small>
                </div>
                <div className="p-4 rounded-2xl bg-white dark:bg-[#10201a] border border-slate-200 dark:border-[#1d352b] shadow-xs">
                  <span className="text-[11px] uppercase font-bold text-slate-400 tracking-wider">Asistencia</span>
                  <div className="text-2xl font-black text-emerald-600 dark:text-emerald-400 mt-1">{metrics.asistenciaPct}%</div>
                  <small className="text-[10px] text-slate-500">Periodo 1 activo</small>
                </div>
                <div className="p-4 rounded-2xl bg-white dark:bg-[#10201a] border border-slate-200 dark:border-[#1d352b] shadow-xs">
                  <span className="text-[11px] uppercase font-bold text-slate-400 tracking-wider">Boscoints</span>
                  <div className="text-2xl font-black text-amber-600 dark:text-amber-300 mt-1 flex items-center gap-1">
                    <span>{classCoins}</span>
                    <span className="text-xs">BC</span>
                  </div>
                  <small className="text-[10px] text-slate-500">Canjeables en Mercado</small>
                </div>
              </div>

              {/* Anuncios del Salón */}
              <div className="p-4 rounded-2xl bg-white dark:bg-[#10201a] border border-slate-200 dark:border-[#1d352b] space-y-3 shadow-xs">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                    <MessageSquare className="w-4 h-4 text-[#176b87]" />
                    Tablón de Anuncios Institucionales
                  </h3>
                </div>
                <div className="space-y-2">
                  {anuncios.map((anuncio) => (
                    <div key={anuncio.id} className="p-3 rounded-xl bg-slate-50 dark:bg-[#0c1613] border border-slate-100 dark:border-[#172b23]">
                      <div className="flex items-center justify-between text-xs font-semibold">
                        <span className="text-slate-800 dark:text-slate-200">{anuncio.titulo}</span>
                        <span className="text-[10px] text-slate-400">{anuncio.fecha}</span>
                      </div>
                      <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">{anuncio.texto}</p>
                      <small className="text-[10px] text-[#176b87] dark:text-[#50c6b3] font-medium mt-1 block">
                        Publicado por {anuncio.autor}
                      </small>
                    </div>
                  ))}
                </div>
              </div>

              {/* Quick AI Bridge Callout */}
              <div className="p-4 rounded-2xl bg-gradient-to-r from-emerald-500/10 via-teal-500/10 to-sky-500/10 border border-emerald-500/30 flex items-center justify-between gap-4">
                <div className="space-y-1">
                  <h4 className="text-xs font-bold text-emerald-800 dark:text-emerald-300 flex items-center gap-1.5">
                    <Sparkles className="w-4 h-4 text-emerald-500" />
                    Sinergia BoscoIA + BoscoClass
                  </h4>
                  <p className="text-xs text-slate-600 dark:text-slate-400">
                    Resuelve tus tareas escolares con el tutor inteligente. Cada explicación formalizada con fórmulas te otorga <strong>+25 Boscoints</strong>.
                  </p>
                </div>
                <button
                  onClick={() => setActiveTab('tareas')}
                  className="px-3 py-2 rounded-xl bg-[#176b87] text-white text-xs font-bold hover:bg-[#124b68] transition-colors shrink-0 shadow-xs"
                >
                  Ver mis tareas
                </button>
              </div>
            </div>
          )}

          {/* TAB 2: TAREAS Y EVIDENCIAS */}
          {activeTab === 'tareas' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold">Talleres y Entregas de Evidencias</h3>
                  <p className="text-xs text-slate-500">
                    Inicia la tutoría paso a paso en BoscoIA y genera el informe de entrega.
                  </p>
                </div>
              </div>

              <div className="space-y-3">
                {tareas.map((tarea) => (
                  <div
                    key={tarea.id}
                    className="p-4 rounded-2xl bg-white dark:bg-[#10201a] border border-slate-200 dark:border-[#1d352b] shadow-xs space-y-3"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <span className="text-[10px] font-bold uppercase tracking-wider text-[#176b87] dark:text-[#50c6b3]">
                          {tarea.materia || 'Asignatura'}
                        </span>
                        <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100">{tarea.titulo}</h4>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{tarea.descripcion}</p>
                      </div>
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          tarea.estado === 'completada' || tarea.estado === 'entregada'
                            ? 'bg-emerald-100 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400'
                            : 'bg-amber-100 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400'
                        }`}
                      >
                        {tarea.estado === 'pendiente' ? 'Pendiente' : 'Entregada'}
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-xs text-slate-500 pt-2 border-t border-slate-100 dark:border-[#1a2e26] flex-wrap gap-2">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5" />
                        Fecha máxima: {tarea.fecha}
                      </span>

                      <div className="flex items-center gap-2">
                        {tarea.estado === 'pendiente' && (
                          <button
                            onClick={() => {
                              ClassPointService.updateTareaEstado(tarea.id, 'completada');
                              ClassPointService.addClassCoins(username, tarea.puntosCoins || 30);
                              refreshData();
                            }}
                            className="px-2.5 py-1 rounded-lg border border-slate-200 dark:border-[#1d352b] hover:bg-slate-100 dark:hover:bg-[#182a23] text-xs font-semibold text-slate-700 dark:text-slate-300"
                          >
                            Marcar Entregada (+{tarea.puntosCoins || 30} BC)
                          </button>
                        )}

                        <button
                          onClick={() => {
                            const prompt = `Hola tutor BoscoIA, necesito resolver mi tarea de ClassPoint: "${tarea.titulo}" de la materia ${tarea.materia || ''}.\n\nDescripción del docente: ${tarea.descripcion}.\n\nPor favor, guíame con el método paso a paso y usando notación matemática formal en fracciones de libro de texto.`;
                            onSelectTaskToTutor(prompt);
                            onClose();
                          }}
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#176b87] text-white text-xs font-bold hover:bg-[#124b68] shadow-xs"
                        >
                          <Sparkles className="w-3.5 h-3.5 text-[#50c6b3]" />
                          Pedir ayuda a BoscoIA
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 3: CALIFICACIONES Y PERIODOS */}
          {activeTab === 'calificaciones' && (
            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-bold">Cuaderno de Calificaciones y Periodos</h3>
                <p className="text-xs text-slate-500">
                  Calificaciones registradas por los docentes con porcentajes ponderados.
                </p>
              </div>

              <div className="overflow-x-auto rounded-2xl border border-slate-200 dark:border-[#1d352b] bg-white dark:bg-[#10201a]">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-100 dark:bg-[#142620] text-slate-700 dark:text-slate-300 font-bold border-b border-slate-200 dark:border-[#1d352b]">
                    <tr>
                      <th className="p-3">Materia</th>
                      <th className="p-3">Actividad / Taller</th>
                      <th className="p-3">Periodo</th>
                      <th className="p-3">Ponderación</th>
                      <th className="p-3 text-right">Nota (1 a 5)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-[#192f25]">
                    {calificaciones.map((nota, idx) => (
                      <tr key={nota.id || idx} className="hover:bg-slate-50 dark:hover:bg-[#152822]/40">
                        <td className="p-3 font-semibold text-slate-900 dark:text-slate-100">{nota.materia}</td>
                        <td className="p-3 text-slate-600 dark:text-slate-400">{nota.tipo}</td>
                        <td className="p-3 text-slate-500">Periodo {nota.periodo || '1'}</td>
                        <td className="p-3 text-slate-500">{nota.porcentaje ? `${nota.porcentaje}%` : '—'}</td>
                        <td className="p-3 text-right font-black text-[#176b87] dark:text-[#50c6b3] text-sm">
                          {Number(nota.nota).toFixed(1)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 4: MIS AULAS */}
          {activeTab === 'aulas' && (
            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-bold">Aulas e Institución</h3>
                <p className="text-xs text-slate-500">
                  Grupos de clase con sus respectivos códigos de aula de ClassPoint.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {aulas.map((aula) => (
                  <div key={aula.id} className="p-4 rounded-2xl bg-white dark:bg-[#10201a] border border-slate-200 dark:border-[#1d352b] space-y-2 shadow-xs">
                    <div className="flex items-center justify-between">
                      <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100">{aula.nombre}</h4>
                      <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-md bg-[#176b87]/10 text-[#176b87] dark:text-[#50c6b3]">
                        {aula.codigo}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5" />
                      {aula.horario}
                    </p>
                    <p className="text-xs text-slate-600 dark:text-slate-300 font-medium">
                      Profesor: {aula.profesor}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 5: MERCADO DE RECOMPENSAS */}
          {activeTab === 'mercado' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold">Mercado de Recompensas ClassPoint</h3>
                  <p className="text-xs text-slate-500">
                    Canjea tus Boscoints ganados estudiando por recompensas de clase.
                  </p>
                </div>
                <div className="text-xs font-bold text-[#b45309] dark:text-amber-300 bg-amber-50 dark:bg-amber-950/40 px-3 py-1 rounded-full border border-amber-200 dark:border-amber-800/40">
                  Saldo: {classCoins} BC
                </div>
              </div>

              {compraMensaje && (
                <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-500/30 text-emerald-800 dark:text-emerald-300 text-xs font-medium">
                  {compraMensaje}
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {productos.map((prod) => {
                  const canAfford = classCoins >= prod.precio;
                  return (
                    <div
                      key={prod.id}
                      className="p-4 rounded-2xl bg-white dark:bg-[#10201a] border border-slate-200 dark:border-[#1d352b] shadow-xs flex flex-col justify-between space-y-3"
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="text-2xl">{prod.icono || '🎁'}</span>
                          <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100">{prod.nombre}</h4>
                        </div>
                        <p className="text-xs text-slate-500 dark:text-slate-400">{prod.descripcion}</p>
                      </div>

                      <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-[#1a2e26]">
                        <span className="text-xs font-black text-amber-600 dark:text-amber-300">
                          {prod.precio} Boscoints
                        </span>
                        <button
                          onClick={() => handleComprar(prod)}
                          disabled={!canAfford}
                          className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors ${
                            canAfford
                              ? 'bg-[#176b87] text-white hover:bg-[#124b68] shadow-xs'
                              : 'bg-slate-200 dark:bg-slate-800 text-slate-400 cursor-not-allowed'
                          }`}
                        >
                          {canAfford ? 'Canjear' : 'Insuficiente BC'}
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* TAB 6: EL CHISMÓGRAFO */}
          {activeTab === 'chismografo' && (
            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-bold">🗣️ El Chismógrafo del Salón</h3>
                <p className="text-xs text-slate-500">
                  Comparte anécdotas, novedades y felicitaciones escolares con respeto.
                </p>
              </div>

              {/* Formulario de publicación */}
              <form onSubmit={handlePublicarChisme} className="p-3.5 rounded-2xl bg-white dark:bg-[#10201a] border border-slate-200 dark:border-[#1d352b] space-y-2.5">
                <textarea
                  value={nuevoChismeTexto}
                  onChange={(e) => setNuevoChismeTexto(e.target.value)}
                  placeholder="Escribe una novedad o felicitación para el salón..."
                  rows={2}
                  className="w-full text-xs p-2.5 rounded-xl border border-slate-200 dark:border-[#1d352b] bg-slate-50 dark:bg-[#0c1613] text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-[#176b87]"
                />
                <div className="flex justify-end">
                  <button
                    type="submit"
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#176b87] text-white text-xs font-bold hover:bg-[#124b68] transition-colors"
                  >
                    <Send className="w-3.5 h-3.5" />
                    Publicar en el salón
                  </button>
                </div>
              </form>

              {/* Feed de chismes */}
              <div className="space-y-2">
                {chismes.map((c) => (
                  <div key={c.id} className="p-3.5 rounded-2xl bg-white dark:bg-[#10201a] border border-slate-200 dark:border-[#1d352b] space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold text-slate-800 dark:text-slate-200">
                        {c.autor} → <span className="text-slate-500">{c.destinatario}</span>
                      </span>
                      <span className="text-[10px] text-slate-400">{c.fechaTexto}</span>
                    </div>
                    <p className="text-xs text-slate-700 dark:text-slate-300">{c.texto}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 7: RESPALDO DE DATOS */}
          {activeTab === 'respaldo' && (
            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-bold">Copia de Seguridad y Sincronización ClassPoint</h3>
                <p className="text-xs text-slate-500">
                  Exporta o importa el archivo JSON de respaldo compatible entre ClassPoint y BoscoIA.
                </p>
              </div>

              {respaldoMensaje && (
                <div className="p-3 rounded-xl bg-blue-50 dark:bg-blue-950/40 border border-blue-500/30 text-blue-800 dark:text-blue-300 text-xs font-medium">
                  {respaldoMensaje}
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="p-4 rounded-2xl bg-white dark:bg-[#10201a] border border-slate-200 dark:border-[#1d352b] space-y-3">
                  <div className="flex items-center gap-2">
                    <Download className="w-5 h-5 text-[#176b87]" />
                    <h4 className="text-xs font-bold">Exportar Respaldo</h4>
                  </div>
                  <p className="text-xs text-slate-500">
                    Descarga todas tus tareas, aulas, notas y Boscoints en un archivo JSON seguro.
                  </p>
                  <button
                    onClick={handleExportarRespaldo}
                    className="w-full py-2 rounded-xl bg-[#176b87] text-white text-xs font-bold hover:bg-[#124b68] transition-colors"
                  >
                    Descargar Respaldo JSON
                  </button>
                </div>

                <div className="p-4 rounded-2xl bg-white dark:bg-[#10201a] border border-slate-200 dark:border-[#1d352b] space-y-3">
                  <div className="flex items-center gap-2">
                    <Upload className="w-5 h-5 text-[#50c6b3]" />
                    <h4 className="text-xs font-bold">Importar Respaldo</h4>
                  </div>
                  <p className="text-xs text-slate-500">
                    Carga un archivo `classpoint-respaldo-*.json` exportado desde tu otra página.
                  </p>
                  <label className="block w-full text-center py-2 rounded-xl border border-slate-300 dark:border-[#1d352b] hover:bg-slate-50 dark:hover:bg-[#142620] text-xs font-bold cursor-pointer transition-colors">
                    <span>Seleccionar archivo JSON</span>
                    <input
                      type="file"
                      accept=".json,application/json"
                      onChange={handleImportarRespaldo}
                      className="hidden"
                    />
                  </label>
                </div>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};
