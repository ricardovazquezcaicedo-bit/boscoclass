import React, { useState } from 'react';
import {
  Plus,
  MessageSquare,
  Trash2,
  Edit2,
  Check,
  Search,
  Settings,
  Moon,
  Sun,
  X,
  FileDown,
  BookOpen,
  LogOut,
  ShieldCheck,
  Trophy,
  Building2,
  Flame,
} from 'lucide-react';
import { ChatSession, UserConfig, UserSession, StudentGamification } from '../types';

interface SidebarProps {
  chats: ChatSession[];
  activeChatId: string | null;
  onSelectChat: (id: string) => void;
  onNewChat: () => void;
  onDeleteChat: (id: string) => void;
  onRenameChat: (id: string, newTitle: string) => void;
  onExportChat: (id: string) => void;
  config: UserConfig;
  onToggleTheme: () => void;
  onOpenSettings: () => void;
  isOpenMobile: boolean;
  onCloseMobile: () => void;
  userSession?: UserSession | null;
  onLogout?: () => void;
  onOpenGamification?: () => void;
  onOpenLms?: () => void;
  onOpenInstitution?: () => void;
  onOpenClassPoint?: () => void;
  gamification?: StudentGamification;
  institutionName?: string;
  institutionLogo?: string;
}

export const Sidebar: React.FC<SidebarProps> = ({
  chats,
  activeChatId,
  onSelectChat,
  onNewChat,
  onDeleteChat,
  onRenameChat,
  onExportChat,
  config,
  onToggleTheme,
  onOpenSettings,
  isOpenMobile,
  onCloseMobile,
  userSession,
  onLogout,
  onOpenGamification,
  onOpenLms,
  onOpenInstitution,
  onOpenClassPoint,
  gamification,
  institutionName = 'Colegio San Juan Bosco',
  institutionLogo = '/assets/aistudio/image_c159dc3e.png',
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [editingChatId, setEditingChatId] = useState<string | null>(null);
  const [editTitleValue, setEditTitleValue] = useState('');

  const filteredChats = chats.filter((c) =>
    c.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.messages.some((m) => m.content.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const startEditing = (e: React.MouseEvent, chat: ChatSession) => {
    e.stopPropagation();
    setEditingChatId(chat.id);
    setEditTitleValue(chat.title);
  };

  const saveEditing = (e: React.MouseEvent | React.KeyboardEvent, id: string) => {
    e.stopPropagation();
    if (editTitleValue.trim()) {
      onRenameChat(id, editTitleValue.trim());
    }
    setEditingChatId(null);
  };

  const handleKeyDown = (e: React.KeyboardEvent, id: string) => {
    if (e.key === 'Enter') {
      saveEditing(e, id);
    } else if (e.key === 'Escape') {
      setEditingChatId(null);
    }
  };

  return (
    <>
      {/* Mobile Backdrop Overlay */}
      {isOpenMobile && (
        <div
          onClick={onCloseMobile}
          className="fixed inset-0 z-40 bg-black/60 md:hidden backdrop-blur-xs transition-opacity"
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed md:static inset-y-0 left-0 z-40 w-72 flex flex-col bg-[#f1f5f3] dark:bg-[#0d1714] border-r border-slate-200 dark:border-[#192b24] transition-transform duration-200 ease-in-out md:translate-x-0 ${
          isOpenMobile ? 'translate-x-0 shadow-2xl' : '-translate-x-full md:translate-x-0'
        }`}
      >
        {/* Brand Header */}
        <div className="p-4 border-b border-slate-200 dark:border-[#192b24] flex items-center justify-between">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="h-10 w-10 p-1 bg-white dark:bg-[#12231e] rounded-xl shadow-xs border border-slate-200 dark:border-[#1d352b] flex items-center justify-center shrink-0">
              <img
                src={institutionLogo}
                alt={institutionName}
                className="w-full h-full object-contain"
              />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-1.5">
                <span className="font-bold text-sm tracking-tight text-slate-900 dark:text-emerald-100">BoscoIA</span>
                <span className="text-[10px] font-semibold text-emerald-600 dark:text-emerald-400">Tutor</span>
              </div>
              <p className="text-[10px] text-slate-500 dark:text-slate-400 truncate">{institutionName}</p>
            </div>
          </div>
          <button
            onClick={onCloseMobile}
            className="md:hidden p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* New Chat Button */}
        <div className="p-3 pb-2">
          <button
            onClick={() => {
              onNewChat();
              onCloseMobile();
            }}
            className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl font-medium text-xs bg-emerald-600 hover:bg-emerald-500 text-white shadow-sm transition-all active:scale-[0.98]"
          >
            <Plus className="w-4 h-4" />
            Nueva Conversación
          </button>
        </div>

        {/* Modular Navigation & Pillars */}
        <div className="px-3 pb-2 space-y-1.5">
          {onOpenGamification && gamification && (
            <button
              onClick={() => {
                onOpenGamification();
                onCloseMobile();
              }}
              className="w-full flex items-center justify-between p-2 rounded-xl text-xs font-semibold bg-amber-500/10 hover:bg-amber-500/20 text-amber-700 dark:text-amber-300 border border-amber-500/20 transition-all active:scale-[0.98]"
            >
              <div className="flex items-center gap-2">
                <Trophy className="w-4 h-4 text-amber-500" />
                <span>Logros y Misiones</span>
              </div>
              <span className="text-[10px] font-mono font-bold bg-amber-500/20 px-1.5 py-0.5 rounded-md">
                🔥 {gamification.streakDays}d · ⭐ {gamification.xp} XP
              </span>
            </button>
          )}

          {onOpenLms && (
            <button
              onClick={() => {
                onOpenLms();
                onCloseMobile();
              }}
              className="w-full flex items-center justify-between p-2 rounded-xl text-xs font-semibold bg-sky-500/10 hover:bg-sky-500/20 text-sky-700 dark:text-sky-300 border border-sky-500/20 transition-all active:scale-[0.98]"
            >
              <div className="flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-sky-500" />
                <span>Tareas LMS / Classroom</span>
              </div>
              <span className="text-[10px] bg-sky-500/20 px-1.5 py-0.5 rounded-md font-bold">
                Google Sync
              </span>
            </button>
          )}

          {onOpenInstitution && (
            <button
              onClick={() => {
                onOpenInstitution();
                onCloseMobile();
              }}
              className="w-full flex items-center justify-between p-2 rounded-xl text-xs font-semibold bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-800 dark:text-emerald-200 border border-emerald-500/20 transition-all active:scale-[0.98]"
            >
              <div className="flex items-center gap-2 truncate">
                <Building2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span className="truncate">Institución / Marca Blanca</span>
              </div>
              <span className="text-[10px] bg-emerald-500/20 px-1.5 py-0.5 rounded-md font-bold shrink-0">
                Modular
              </span>
            </button>
          )}

          {onOpenClassPoint && (
            <button
              onClick={() => {
                onOpenClassPoint();
                onCloseMobile();
              }}
              className="w-full flex items-center justify-between p-2 rounded-xl text-xs font-semibold bg-[#176b87]/15 hover:bg-[#176b87]/25 text-[#104b68] dark:text-[#7be2cb] border border-[#50c6b3]/30 transition-all active:scale-[0.98]"
            >
              <div className="flex items-center gap-2 truncate">
                <div className="w-4 h-4 rounded-md bg-[#176b87] text-white font-extrabold text-[9px] grid place-items-center shrink-0">
                  BC
                </div>
                <span className="truncate">Portal Escolar BoscoClass</span>
              </div>
              <span className="text-[10px] bg-[#50c6b3]/25 text-[#104b68] dark:text-[#7be2cb] px-1.5 py-0.5 rounded-md font-bold shrink-0">
                Suite
              </span>
            </button>
          )}
        </div>

        {/* Search Bar */}
        <div className="px-3 pb-2">
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 w-3.5 h-3.5 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Buscar en conversaciones..."
              className="w-full pl-8 pr-3 py-1.5 text-xs rounded-lg bg-white dark:bg-[#09110e] border border-slate-200 dark:border-[#1a2d25] text-slate-800 dark:text-slate-200 placeholder-slate-400 focus:outline-none focus:border-emerald-500 transition-colors"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-2 top-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 text-xs"
              >
                ✕
              </button>
            )}
          </div>
        </div>

        {/* Chat List */}
        <div className="flex-1 overflow-y-auto px-2 space-y-1 py-1">
          {filteredChats.length === 0 ? (
            <div className="text-center py-8 px-4 text-xs text-slate-400">
              {searchQuery ? 'No se encontraron conversaciones con esa búsqueda.' : 'Sin conversaciones aún. ¡Comienza una nueva!'}
            </div>
          ) : (
            filteredChats.map((chat) => {
              const isActive = chat.id === activeChatId;
              const isEditing = editingChatId === chat.id;

              return (
                <div
                  key={chat.id}
                  onClick={() => {
                    if (!isEditing) {
                      onSelectChat(chat.id);
                      onCloseMobile();
                    }
                  }}
                  className={`group relative flex items-center justify-between w-full p-2.5 rounded-xl text-xs transition-all cursor-pointer ${
                    isActive
                      ? 'bg-white dark:bg-[#12231e] text-emerald-950 dark:text-emerald-100 font-medium shadow-xs border border-emerald-500/20'
                      : 'text-slate-600 dark:text-slate-300 hover:bg-slate-200/60 dark:hover:bg-[#12221c]'
                  }`}
                >
                  <div className="flex items-center gap-2 min-w-0 flex-1">
                    <MessageSquare className={`w-3.5 h-3.5 shrink-0 ${isActive ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-400'}`} />
                    {isEditing ? (
                      <input
                        type="text"
                        autoFocus
                        value={editTitleValue}
                        onChange={(e) => setEditTitleValue(e.target.value)}
                        onKeyDown={(e) => handleKeyDown(e, chat.id)}
                        onClick={(e) => e.stopPropagation()}
                        className="w-full bg-white dark:bg-[#07100e] border border-emerald-500 rounded px-1.5 py-0.5 text-xs text-slate-900 dark:text-white outline-none"
                      />
                    ) : (
                      <span className="truncate text-left" title={chat.title}>
                        {chat.title}
                      </span>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-0.5 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                    {isEditing ? (
                      <button
                        onClick={(e) => saveEditing(e, chat.id)}
                        className="p-1 rounded text-emerald-600 hover:bg-emerald-500/10"
                        title="Guardar nombre"
                      >
                        <Check className="w-3 h-3" />
                      </button>
                    ) : (
                      <>
                        <button
                          onClick={(e) => startEditing(e, chat)}
                          className="p-1 rounded text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-200 dark:hover:bg-[#1b3127]"
                          title="Renombrar chat"
                        >
                          <Edit2 className="w-3 h-3" />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onExportChat(chat.id);
                          }}
                          className="p-1 rounded text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-200 dark:hover:bg-[#1b3127]"
                          title="Descargar conversación (.md)"
                        >
                          <FileDown className="w-3 h-3" />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            if (window.confirm('¿Eliminar esta conversación?')) {
                              onDeleteChat(chat.id);
                            }
                          }}
                          className="p-1 rounded text-slate-400 hover:text-red-500 hover:bg-red-500/10"
                          title="Eliminar chat"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Sidebar Footer */}
        <div className="p-3 border-t border-slate-200 dark:border-[#192b24] bg-[#eaf0ed] dark:bg-[#0a1210]">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 min-w-0">
              <div className="w-8 h-8 rounded-full bg-emerald-600 text-white font-semibold text-xs grid place-items-center shrink-0 overflow-hidden shadow-xs">
                {userSession?.avatar ? (
                  <img src={userSession.avatar} alt={config.username} className="w-full h-full object-cover" />
                ) : config.username ? (
                  config.username.charAt(0).toUpperCase()
                ) : (
                  'E'
                )}
              </div>
              <div className="truncate">
                <div className="flex items-center gap-1">
                  <p className="text-xs font-semibold text-slate-800 dark:text-slate-200 truncate">
                    {config.username}
                  </p>
                  {userSession?.isVerified && (
                    <span title={userSession.verificationMethod || 'Cuenta Verificada'}>
                      <ShieldCheck className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                    </span>
                  )}
                </div>
                <p className="text-[10px] text-slate-500 dark:text-slate-400 truncate">
                  {userSession?.email || config.academicLevel}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-0.5">
              <button
                onClick={onToggleTheme}
                className="p-1.5 rounded-lg text-slate-500 dark:text-slate-300 hover:bg-white dark:hover:bg-[#152620] transition-colors"
                title={config.theme === 'dark' ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro'}
              >
                {config.theme === 'dark' ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-slate-600" />}
              </button>
              <button
                onClick={onOpenSettings}
                className="p-1.5 rounded-lg text-slate-500 dark:text-slate-300 hover:bg-white dark:hover:bg-[#152620] transition-colors"
                title="Configuración y Perfil"
              >
                <Settings className="w-4 h-4" />
              </button>
              {onLogout && (
                <button
                  onClick={onLogout}
                  className="p-1.5 rounded-lg text-slate-500 hover:text-red-500 dark:hover:text-red-400 hover:bg-white dark:hover:bg-[#152620] transition-colors"
                  title="Cerrar Sesión"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>
        </div>
      </aside>
    </>
  );
};
