import React, { useState } from 'react';
import {
  X,
  Trash2,
  Download,
  Moon,
  Sun,
  GraduationCap,
  Sparkles,
  User,
  ShieldCheck,
  Volume2,
  VolumeX,
  Play,
} from 'lucide-react';
import { UserConfig, UserSession } from '../types';
import { GEMINI_VOICES, previewVoice, stopSpeech } from '../services/speechService';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  config: UserConfig;
  onSaveConfig: (newConfig: UserConfig) => void;
  onClearAllChats: () => void;
  onExportAllData: () => void;
  userSession?: UserSession | null;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  config,
  onSaveConfig,
  onClearAllChats,
  onExportAllData,
  userSession,
}) => {
  const [formData, setFormData] = useState<UserConfig>(config);
  const [confirmClear, setConfirmClear] = useState(false);
  const [isPlayingPreview, setIsPlayingPreview] = useState(false);

  if (!isOpen) return null;

  const handlePreviewClick = () => {
    if (isPlayingPreview) {
      stopSpeech();
      setIsPlayingPreview(false);
      return;
    }
    setIsPlayingPreview(true);
    previewVoice(
      {
        voiceEngine: formData.voiceEngine ?? 'gemini',
        voiceName: formData.voiceName ?? 'Kore',
        voiceSpeed: formData.voiceSpeed ?? 1.0,
        voicePitch: formData.voicePitch ?? 1.0,
      },
      () => setIsPlayingPreview(false)
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSaveConfig(formData);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="relative w-full max-w-md bg-white dark:bg-[#101c18] border border-slate-200 dark:border-[#1e332b] rounded-2xl shadow-2xl p-6 text-slate-800 dark:text-slate-100 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between pb-4 border-b border-slate-200 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-red-500/10 dark:bg-red-500/20 text-[#D32F2F] dark:text-red-400 grid place-items-center">
              <GraduationCap className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white leading-none">Perfil de Aprendizaje</h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Personaliza a BoscoIA a tu ritmo de estudio</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {userSession?.isVerified && (
          <div className="mt-4 p-3 rounded-xl bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900/50 text-xs text-red-900 dark:text-red-200 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-[#D32F2F] shrink-0" />
              <div>
                <p className="font-bold">Cuenta Institucional Verificada</p>
                <p className="text-[11px] text-red-700 dark:text-red-300">
                  {userSession.verificationMethod}
                </p>
              </div>
            </div>
            <span className="text-[10px] px-2 py-0.5 rounded-md bg-red-100 dark:bg-red-900/60 font-bold text-red-800 dark:text-red-200">
              Activo
            </span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-5 space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-800 dark:text-slate-200 mb-1.5 flex items-center gap-1.5">
              <User className="w-3.5 h-3.5 text-[#D32F2F]" />
              Tu Nombre o Alias
            </label>
            <input
              type="text"
              value={formData.username}
              onChange={(e) => setFormData({ ...formData, username: e.target.value })}
              placeholder="Ej. Alex, Sofía, Mateo"
              className="w-full px-3.5 py-2.5 rounded-xl text-sm bg-white dark:bg-slate-900 text-slate-900 dark:text-white placeholder:text-slate-500 border border-slate-300 dark:border-slate-700 focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500 transition-colors font-medium"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-800 dark:text-slate-200 mb-1.5 flex items-center gap-1.5">
              <GraduationCap className="w-3.5 h-3.5 text-[#D32F2F]" />
              Nivel Académico
            </label>
            <select
              value={formData.academicLevel}
              onChange={(e) => setFormData({ ...formData, academicLevel: e.target.value as any })}
              className="w-full px-3.5 py-2.5 rounded-xl text-sm bg-white dark:bg-slate-900 text-slate-900 dark:text-white border border-slate-300 dark:border-slate-700 focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500 transition-colors font-medium"
            >
              <option value="Primaria">Primaria (Explicaciones muy sencillas y visuales)</option>
              <option value="Secundaria">Secundaria (Básico - Intermedio)</option>
              <option value="Bachillerato">Bachillerato / Preparatoria (Preparación académica)</option>
              <option value="Universidad">Universidad / Nivel Superior (Técnico y riguroso)</option>
              <option value="Autodidacta">Autodidacta / Aprendizaje Continuo</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-800 dark:text-slate-200 mb-1.5 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              Estilo Pedagógico Preferido
            </label>
            <select
              value={formData.teachingTone}
              onChange={(e) => setFormData({ ...formData, teachingTone: e.target.value as any })}
              className="w-full px-3.5 py-2.5 rounded-xl text-sm bg-white dark:bg-slate-900 text-slate-900 dark:text-white border border-slate-300 dark:border-slate-700 focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500 transition-colors font-medium"
            >
              <option value="Didáctico y guiado">Didáctico y guiado (Paso a paso con analogías)</option>
              <option value="Conciso y directo">Conciso y directo (Respuestas al grano)</option>
              <option value="Académico riguroso">Académico riguroso (Formal con fundamento teórico)</option>
              <option value="Socrático (con preguntas guía)">Socrático (Te ayuda a deducir la respuesta)</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-800 dark:text-slate-200 mb-1.5 flex items-center gap-1.5">
              {formData.theme === 'dark' ? <Moon className="w-3.5 h-3.5 text-slate-400" /> : <Sun className="w-3.5 h-3.5 text-amber-500" />}
              Tema Visual
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setFormData({ ...formData, theme: 'dark' })}
                className={`flex items-center justify-center gap-2 py-2 px-3 rounded-xl border text-xs font-bold transition-all ${
                  formData.theme === 'dark'
                    ? 'border-red-500 bg-red-500/10 text-red-500 dark:text-red-400'
                    : 'border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:border-slate-300'
                }`}
              >
                <Moon className="w-4 h-4" />
                Modo Oscuro
              </button>
              <button
                type="button"
                onClick={() => setFormData({ ...formData, theme: 'light' })}
                className={`flex items-center justify-center gap-2 py-2 px-3 rounded-xl border text-xs font-bold transition-all ${
                  formData.theme === 'light'
                    ? 'border-[#D32F2F] bg-red-50 text-[#D32F2F]'
                    : 'border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:border-slate-300'
                }`}
              >
                <Sun className="w-4 h-4" />
                Modo Claro
              </button>
            </div>
          </div>

          {/* Voice Personalization for BoscoIA */}
          <div className="p-4 rounded-2xl border border-red-200 dark:border-red-950/60 bg-red-50/30 dark:bg-red-950/10 space-y-3.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-900 dark:text-slate-100 flex items-center gap-1.5">
                <Volume2 className="w-4 h-4 text-[#D32F2F] dark:text-red-400" />
                <span>Voz de BoscoIA (Lectura en Voz Alta)</span>
              </label>
              <button
                type="button"
                onClick={handlePreviewClick}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all shadow-xs ${
                  isPlayingPreview
                    ? 'bg-amber-500 hover:bg-amber-600 text-slate-950 animate-pulse'
                    : 'bg-[#D32F2F] hover:bg-red-700 text-white hover:scale-105 active:scale-95'
                }`}
              >
                {isPlayingPreview ? (
                  <>
                    <VolumeX className="w-3.5 h-3.5" />
                    <span>Detener</span>
                  </>
                ) : (
                  <>
                    <Play className="w-3.5 h-3.5 fill-current" />
                    <span>Probar Voz</span>
                  </>
                )}
              </button>
            </div>

            <p className="text-[11px] text-slate-600 dark:text-slate-400">
              Elige cómo quieres que suene BoscoIA cuando leas explicaciones o resuelvas ejercicios paso a paso.
            </p>

            {/* Voice Cards */}
            <div className="space-y-1.5">
              {GEMINI_VOICES.map((voice) => {
                const isSelected = (formData.voiceName || 'Kore') === voice.id && (formData.voiceEngine || 'gemini') === 'gemini';
                return (
                  <div
                    key={voice.id}
                    onClick={() => {
                      setFormData({
                        ...formData,
                        voiceEngine: 'gemini',
                        voiceName: voice.id,
                      });
                      if (isPlayingPreview) {
                        stopSpeech();
                        setIsPlayingPreview(false);
                      }
                    }}
                    className={`p-2.5 rounded-xl border text-left cursor-pointer transition-all ${
                      isSelected
                        ? 'border-[#D32F2F] bg-red-500/10 dark:bg-red-950/40 text-slate-950 dark:text-white shadow-xs'
                        : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-red-400/50 text-slate-700 dark:text-slate-300'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className={`w-2 h-2 rounded-full ${isSelected ? 'bg-[#D32F2F]' : 'bg-slate-300 dark:bg-slate-700'}`} />
                        <span className="text-xs font-bold">{voice.name}</span>
                        {voice.recommended && (
                          <span className="text-[9px] px-1.5 py-0.5 rounded-md bg-amber-500/20 text-amber-700 dark:text-amber-300 font-bold">
                            Recomendada
                          </span>
                        )}
                      </div>
                      <span className="text-[10px] text-[#D32F2F] dark:text-red-400 font-bold">
                        {voice.gender === 'female' ? 'Femenina' : 'Masculina'}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 pl-4">
                      {voice.description}
                    </p>
                  </div>
                );
              })}

              {/* Browser voice option */}
              <div
                onClick={() => {
                  setFormData({
                    ...formData,
                    voiceEngine: 'browser',
                  });
                  if (isPlayingPreview) {
                    stopSpeech();
                    setIsPlayingPreview(false);
                  }
                }}
                className={`p-2.5 rounded-xl border text-left cursor-pointer transition-all ${
                  formData.voiceEngine === 'browser'
                    ? 'border-[#D32F2F] bg-red-500/10 dark:bg-red-950/40 text-slate-950 dark:text-white shadow-xs'
                    : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-red-400/50 text-slate-700 dark:text-slate-300'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className={`w-2 h-2 rounded-full ${formData.voiceEngine === 'browser' ? 'bg-[#D32F2F]' : 'bg-slate-300 dark:bg-slate-700'}`} />
                    <span className="text-xs font-bold">Voz Local del Navegador (Dispositivo)</span>
                  </div>
                  <span className="text-[10px] text-slate-400">Offline / Sistema</span>
                </div>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 pl-4">
                  Utiliza el sintetizador nativo de tu computadora o teléfono.
                </p>
              </div>
            </div>

            {/* Speed Selector */}
            <div className="pt-2">
              <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                Velocidad de Lectura
              </label>
              <div className="grid grid-cols-4 gap-1.5">
                {[
                  { label: '0.85x Pausada', val: 0.85 },
                  { label: '1.0x Normal', val: 1.0 },
                  { label: '1.15x Fluida', val: 1.15 },
                  { label: '1.25x Rápida', val: 1.25 },
                ].map((s) => {
                  const isSelected = (formData.voiceSpeed ?? 1.0) === s.val;
                  return (
                    <button
                      key={s.val}
                      type="button"
                      onClick={() => setFormData({ ...formData, voiceSpeed: s.val })}
                      className={`py-1.5 px-2 rounded-xl text-[11px] font-bold transition-all ${
                        isSelected
                          ? 'bg-[#D32F2F] text-white shadow-xs'
                          : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:border-slate-300'
                      }`}
                    >
                      {s.label}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          <div className="pt-3 border-t border-slate-200 dark:border-slate-800 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs text-slate-500 dark:text-slate-400">Datos guardados localmente</span>
              <button
                type="button"
                onClick={onExportAllData}
                className="flex items-center gap-1 text-xs text-[#D32F2F] dark:text-red-400 hover:underline font-semibold"
              >
                <Download className="w-3.5 h-3.5" />
                Exportar Historial (JSON)
              </button>
            </div>

            {confirmClear ? (
              <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-xs text-red-600 dark:text-red-400 space-y-2">
                <p>¿Seguro que deseas eliminar todos los chats? Esta acción no se puede deshacer.</p>
                <div className="flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setConfirmClear(false)}
                    className="px-2.5 py-1 rounded-md bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300"
                  >
                    Cancelar
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      onClearAllChats();
                      setConfirmClear(false);
                      onClose();
                    }}
                    className="px-2.5 py-1 rounded-md bg-red-600 text-white font-medium"
                  >
                    Sí, eliminar todo
                  </button>
                </div>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => setConfirmClear(true)}
                className="flex items-center gap-1.5 text-xs text-red-500 hover:text-red-600 dark:hover:text-red-400 transition-colors pt-1"
              >
                <Trash2 className="w-3.5 h-3.5" />
                Borrar todas las conversaciones
              </button>
            )}
          </div>

          <div className="pt-3 flex items-center justify-end gap-2 border-t border-slate-200 dark:border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold rounded-xl text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-xs font-bold rounded-xl bg-[#D32F2F] hover:bg-red-700 text-white shadow-sm transition-colors cursor-pointer"
            >
              Guardar Cambios
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
