import React, { useState } from 'react';
import { X, Building2, Check, Sparkles, Plus, Edit2, ShieldCheck, Globe } from 'lucide-react';
import { InstitutionConfig, INSTITUTIONS_PRESETS } from '../types';

interface InstitutionModalProps {
  isOpen: boolean;
  onClose: () => void;
  activeInstitutionId: string;
  onSelectInstitution: (institution: InstitutionConfig) => void;
}

export const InstitutionModal: React.FC<InstitutionModalProps> = ({
  isOpen,
  onClose,
  activeInstitutionId,
  onSelectInstitution,
}) => {
  const [institutions, setInstitutions] = useState<InstitutionConfig[]>(() => {
    try {
      const saved = localStorage.getItem('bosco_institutions');
      if (saved) return JSON.parse(saved);
    } catch {}
    return INSTITUTIONS_PRESETS;
  });

  const [isEditingCustom, setIsEditingCustom] = useState(false);
  const [customName, setCustomName] = useState('Mi Colegio / Universidad');
  const [customTagline, setCustomTagline] = useState('Campus Modular Personalizado');
  const [customRubric, setCustomRubric] = useState('Metodología basada en proyectos, pensamiento analítico y resolución guiada.');

  if (!isOpen) return null;

  const handleSelect = (inst: InstitutionConfig) => {
    onSelectInstitution(inst);
    onClose();
  };

  const handleSaveCustom = (e: React.FormEvent) => {
    e.preventDefault();
    const updated = institutions.map((inst) => {
      if (inst.id === 'custom_school') {
        return {
          ...inst,
          name: customName,
          shortName: customName.split(' ')[0] || 'Mi Colegio',
          tagline: customTagline,
          customRubric: customRubric,
        };
      }
      return inst;
    });

    setInstitutions(updated);
    try {
      localStorage.setItem('bosco_institutions', JSON.stringify(updated));
    } catch {}

    const customInst = updated.find((i) => i.id === 'custom_school');
    if (customInst) {
      onSelectInstitution(customInst);
    }
    setIsEditingCustom(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg bg-white dark:bg-[#101c18] border border-slate-200 dark:border-[#1e332b] rounded-3xl shadow-2xl p-6 text-slate-800 dark:text-slate-100 max-h-[90vh] overflow-y-auto space-y-5">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-[#1a2e26]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 grid place-items-center shadow-xs">
              <Building2 className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-base font-bold leading-tight">Escalabilidad Modular e Instituciones</h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Selecciona tu colegio o personaliza la plataforma en Marca Blanca
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

        {/* Institution Cards */}
        <div className="space-y-3">
          {institutions.map((inst) => {
            const isSelected = inst.id === activeInstitutionId;
            return (
              <div
                key={inst.id}
                onClick={() => handleSelect(inst)}
                className={`p-4 rounded-2xl border transition-all cursor-pointer space-y-2 ${
                  isSelected
                    ? 'border-emerald-500 bg-emerald-50/50 dark:bg-emerald-950/20 shadow-xs'
                    : 'border-slate-200 dark:border-[#1d352b] hover:border-slate-300 dark:hover:border-[#2b4d3f] bg-white dark:bg-[#0c1613]'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <img
                      src={inst.logoUrl}
                      alt={inst.name}
                      className="w-9 h-9 object-contain rounded-xl bg-white dark:bg-[#152721] p-1 border border-slate-200 dark:border-[#1e342b]"
                    />
                    <div>
                      <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-1.5">
                        {inst.name}
                        {isSelected && (
                          <span className="text-[10px] font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-md">
                            Activo
                          </span>
                        )}
                      </h3>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400">{inst.tagline}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {inst.isCustom && (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setIsEditingCustom(true);
                        }}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-emerald-600 hover:bg-slate-100 dark:hover:bg-[#162721] transition-colors"
                        title="Personalizar esta institución"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                    )}
                    <div
                      className={`w-6 h-6 rounded-full grid place-items-center ${
                        isSelected
                          ? 'bg-emerald-600 text-white'
                          : 'border border-slate-300 dark:border-slate-600'
                      }`}
                    >
                      {isSelected && <Check className="w-3.5 h-3.5" />}
                    </div>
                  </div>
                </div>

                {inst.customRubric && (
                  <p className="text-[11px] text-slate-600 dark:text-slate-300 bg-slate-50 dark:bg-[#12231c] p-2 rounded-xl border border-slate-100 dark:border-[#1b3429] line-clamp-2">
                    <strong>Rúbrica Institucional:</strong> {inst.customRubric}
                  </p>
                )}
              </div>
            );
          })}
        </div>

        {/* Custom School Editor Form */}
        {isEditingCustom && (
          <form
            onSubmit={handleSaveCustom}
            className="p-4 rounded-2xl border border-emerald-500/40 bg-slate-50 dark:bg-[#0c1613] space-y-3 animate-in fade-in duration-150"
          >
            <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5" />
              Personalizar Identidad Institucional (Marca Blanca)
            </h4>

            <div>
              <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-300 mb-1">
                Nombre del Colegio o Universidad:
              </label>
              <input
                type="text"
                value={customName}
                onChange={(e) => setCustomName(e.target.value)}
                placeholder="Ej. Liceo Departamental, Colegio Mayor"
                className="w-full px-3 py-2 rounded-xl text-xs bg-white dark:bg-[#12231c] border border-slate-200 dark:border-[#1d352b] text-slate-800 dark:text-slate-100 outline-none focus:border-emerald-500"
                required
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-300 mb-1">
                Lema o Sede Institucional:
              </label>
              <input
                type="text"
                value={customTagline}
                onChange={(e) => setCustomTagline(e.target.value)}
                placeholder="Ej. Sede Central · Formando líderes del futuro"
                className="w-full px-3 py-2 rounded-xl text-xs bg-white dark:bg-[#12231c] border border-slate-200 dark:border-[#1d352b] text-slate-800 dark:text-slate-100 outline-none focus:border-emerald-500"
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-300 mb-1">
                Rúbrica y Enfoque Pedagógico del Tutor:
              </label>
              <textarea
                value={customRubric}
                onChange={(e) => setCustomRubric(e.target.value)}
                rows={2}
                placeholder="Indica las pautas de evaluación y estilo pedagógico específico de tu institución..."
                className="w-full px-3 py-2 rounded-xl text-xs bg-white dark:bg-[#12231c] border border-slate-200 dark:border-[#1d352b] text-slate-800 dark:text-slate-100 outline-none focus:border-emerald-500 resize-none"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-1">
              <button
                type="button"
                onClick={() => setIsEditingCustom(false)}
                className="px-3 py-1.5 rounded-lg text-xs text-slate-500 hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="px-4 py-1.5 rounded-lg text-xs font-semibold bg-emerald-600 hover:bg-emerald-500 text-white transition-colors"
              >
                Guardar y Aplicar
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
