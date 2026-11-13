import React from 'react';
import { X, Flame, Trophy, Award, Sparkles, CheckCircle2, ChevronRight, Target } from 'lucide-react';
import { StudentGamification } from '../types';

interface GamificationModalProps {
  isOpen: boolean;
  onClose: () => void;
  gamification: StudentGamification;
  username: string;
}

export const GamificationModal: React.FC<GamificationModalProps> = ({
  isOpen,
  onClose,
  gamification,
  username,
}) => {
  if (!isOpen) return null;

  // XP Progress towards next level (e.g. each level takes level * 250 XP)
  const currentLevelBase = (gamification.level - 1) * 250;
  const nextLevelTarget = gamification.level * 250;
  const levelProgress = Math.min(
    100,
    Math.max(
      0,
      Math.round(((gamification.xp - currentLevelBase) / (nextLevelTarget - currentLevelBase)) * 100)
    )
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg bg-white dark:bg-[#101c18] border border-slate-200 dark:border-[#1e332b] rounded-3xl shadow-2xl p-6 text-slate-800 dark:text-slate-100 max-h-[90vh] overflow-y-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-[#1a2e26]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/15 text-amber-500 grid place-items-center shadow-xs">
              <Trophy className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-base font-bold leading-tight">Logros y Progreso Académico</h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Aprende paso a paso, sube de nivel y colecciona insignias
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

        {/* Level, Streak and ClassCoins Hero Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
          {/* Level Card */}
          <div className="p-3.5 rounded-2xl bg-gradient-to-br from-emerald-500/10 via-emerald-500/5 to-transparent border border-emerald-500/20 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
                Nivel {gamification.level}
              </span>
              <span className="text-[11px] font-mono font-bold text-slate-700 dark:text-slate-200">
                {gamification.xp} XP
              </span>
            </div>
            <div>
              <h3 className="text-xs font-bold text-slate-900 dark:text-emerald-100 truncate">
                {gamification.levelTitle}
              </h3>
              <p className="text-[10px] text-slate-500 dark:text-slate-400">
                {nextLevelTarget - gamification.xp} XP para Nivel {gamification.level + 1}
              </p>
            </div>
            {/* Progress Bar */}
            <div className="w-full bg-slate-200 dark:bg-[#1b332a] h-1.5 rounded-full overflow-hidden">
              <div
                className="bg-emerald-500 h-full rounded-full transition-all duration-500"
                style={{ width: `${levelProgress}%` }}
              />
            </div>
          </div>

          {/* Daily Streak Card */}
          <div className="p-3.5 rounded-2xl bg-gradient-to-br from-amber-500/10 via-amber-500/5 to-transparent border border-amber-500/20 flex items-center justify-between">
            <div className="space-y-0.5">
              <span className="text-[10px] font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400 flex items-center gap-1">
                <Flame className="w-3 h-3 fill-amber-500 text-amber-500" />
                Racha
              </span>
              <h3 className="text-xl font-black text-slate-900 dark:text-amber-100">
                {gamification.streakDays} Días
              </h3>
              <p className="text-[10px] text-slate-500 dark:text-slate-400">
                Constancia activa
              </p>
            </div>
            <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-500 grid place-items-center text-xl shadow-xs">
              🔥
            </div>
          </div>

          {/* Boscoints Economy Card */}
          <div className="p-3.5 rounded-2xl bg-gradient-to-br from-[#176b87]/15 via-[#50c6b3]/10 to-transparent border border-[#50c6b3]/30 flex items-center justify-between">
            <div className="space-y-0.5">
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#176b87] dark:text-[#7be2cb]">
                Boscoints
              </span>
              <h3 className="text-xl font-black text-amber-600 dark:text-amber-300">
                {gamification.classCoins ?? 0} <span className="text-xs">BC</span>
              </h3>
              <p className="text-[10px] text-slate-500 dark:text-slate-400">
                Mercado de Recompensas
              </p>
            </div>
            <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-600 dark:text-amber-300 font-extrabold text-sm grid place-items-center shadow-xs">
              BC
            </div>
          </div>
        </div>

        {/* Weekly Quests Section */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
              <Target className="w-3.5 h-3.5 text-emerald-500" />
              Retos Semanales de Aprendizaje
            </h4>
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-bold">
              Reinician el lunes
            </span>
          </div>

          <div className="space-y-2">
            {gamification.quests.map((quest) => (
              <div
                key={quest.id}
                className="p-3 rounded-2xl border border-slate-200 dark:border-[#1d352b] bg-slate-50/70 dark:bg-[#0c1613] flex items-center justify-between gap-3"
              >
                <div className="min-w-0 flex-1 space-y-1">
                  <div className="flex items-center gap-2">
                    <p className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                      {quest.title}
                    </p>
                    {quest.completed && (
                      <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-0.5">
                        <CheckCircle2 className="w-3 h-3" />
                        Completado
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="flex-1 bg-slate-200 dark:bg-[#1a2f27] h-1.5 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all ${
                          quest.completed ? 'bg-emerald-500' : 'bg-sky-500'
                        }`}
                        style={{ width: `${Math.min(100, (quest.progress / quest.target) * 100)}%` }}
                      />
                    </div>
                    <span className="text-[10px] font-mono text-slate-400">
                      {quest.progress}/{quest.target}
                    </span>
                  </div>
                </div>

                <div className="shrink-0 text-right">
                  <span className="text-xs font-bold text-amber-600 dark:text-amber-400">
                    +{quest.xpReward} XP
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Academic Badges Grid */}
        <div className="space-y-3">
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
            <Award className="w-3.5 h-3.5 text-amber-500" />
            Insignias Académicas Desbloqueadas ({gamification.badges.filter((b) => b.unlocked).length}/{gamification.badges.length})
          </h4>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
            {gamification.badges.map((badge) => (
              <div
                key={badge.id}
                className={`p-3 rounded-2xl border text-center space-y-1.5 transition-all ${
                  badge.unlocked
                    ? 'border-emerald-500/30 bg-emerald-50/40 dark:bg-emerald-950/20 shadow-xs'
                    : 'border-slate-200 dark:border-[#1a2d26] bg-slate-100/50 dark:bg-[#08100e] opacity-60'
                }`}
              >
                <div
                  className={`w-10 h-10 rounded-2xl mx-auto grid place-items-center text-xl shadow-xs ${
                    badge.unlocked
                      ? 'bg-white dark:bg-[#13251f] border border-emerald-500/30'
                      : 'bg-slate-200 dark:bg-[#14231e] filter grayscale'
                  }`}
                >
                  {badge.icon}
                </div>
                <div>
                  <p className="text-xs font-bold leading-tight text-slate-900 dark:text-slate-100 truncate">
                    {badge.title}
                  </p>
                  <p className="text-[10px] text-slate-500 dark:text-slate-400 line-clamp-2 mt-0.5">
                    {badge.description}
                  </p>
                </div>
                {badge.unlocked && (
                  <span className="inline-block text-[9px] font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">
                    ✓ Obtenida
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
