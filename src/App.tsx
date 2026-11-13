import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  Menu,
  BookOpen,
  Sparkles,
  ArrowDown,
  FileDown,
  Trash2,
  RefreshCw,
  GraduationCap,
  LogOut,
  ShieldCheck,
  Trophy,
  Building2,
  Flame,
} from 'lucide-react';
import { Sidebar } from './components/Sidebar';
import { WelcomeScreen } from './components/WelcomeScreen';
import { MessageBubble } from './components/MessageBubble';
import { Composer } from './components/Composer';
import { SettingsModal } from './components/SettingsModal';
import { AuthScreen } from './components/AuthScreen';
import { BoscoClassLanding } from './components/BoscoClassLanding';
import { ClassPointDashboard } from './components/ClassPointDashboard';
import { GamificationModal } from './components/GamificationModal';
import { LmsIntegrationModal } from './components/LmsIntegrationModal';
import { InstitutionModal } from './components/InstitutionModal';
import { ClassPointPortalModal } from './components/ClassPointPortalModal';
import { ClassPointService } from './services/classPointStorage';
import { speakText, stopSpeech } from './services/speechService';
import {
  ChatSession,
  ChatMessage,
  ChatAttachment,
  UserConfig,
  UserSession,
  DEFAULT_CONFIG,
  StudentGamification,
  INITIAL_GAMIFICATION,
  InstitutionConfig,
  INSTITUTIONS_PRESETS,
} from './types';

// Helper to isolate storage keys strictly per student account
const getUserStorageKey = (email: string | undefined, suffix: string) => {
  if (!email) return `bosco_guest_${suffix}`;
  const sanitized = email.trim().toLowerCase().replace(/[^a-z0-9_]/g, '_');
  return `bosco_user_${sanitized}_${suffix}`;
};

const loadUserChats = (email: string | undefined): ChatSession[] => {
  try {
    const key = getUserStorageKey(email, 'chats');
    const saved = localStorage.getItem(key);
    if (saved) {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed.map((c: any) => ({
          id: c.id || Date.now().toString(),
          title: c.title || 'Conversación',
          createdAt: c.createdAt || Date.now(),
          updatedAt: c.updatedAt || Date.now(),
          messages: (c.messages || []).map((m: any, idx: number) => ({
            id: m.id || `${c.id}-${idx}`,
            role: m.role || 'user',
            content: m.content || '',
            files: m.files || [],
            timestamp: m.timestamp || Date.now(),
          })),
        }));
      }
    }
  } catch (e) {
    console.error('Error cargando chats del usuario', e);
  }
  return [];
};

const loadUserConfig = (email: string | undefined, fallbackName?: string): UserConfig => {
  try {
    const key = getUserStorageKey(email, 'config');
    const saved = localStorage.getItem(key);
    if (saved) {
      return { ...DEFAULT_CONFIG, ...JSON.parse(saved) };
    }
  } catch {}
  return {
    ...DEFAULT_CONFIG,
    username: fallbackName || DEFAULT_CONFIG.username,
  };
};

export default function App() {
  // User Authentication Session State
  const [userSession, setUserSession] = useState<UserSession | null>(() => {
    try {
      const saved = localStorage.getItem('bosco_user_session');
      if (saved) {
        const parsed = JSON.parse(saved) as UserSession;
        const isCreator =
          parsed.email?.toLowerCase() === 'ricardovazquezcaicedo@gmail.com' ||
          parsed.username?.toLowerCase() === 'creador';
        if (isCreator && parsed.role !== 'creadorOriginal') {
          const upgraded: UserSession = {
            ...parsed,
            role: 'creadorOriginal',
            username: 'creador',
            institutionId: 'global',
            institutionName: 'Red Global BoscoClass',
          };
          localStorage.setItem('bosco_user_session', JSON.stringify(upgraded));
          return upgraded;
        }
        return parsed;
      }
    } catch {}
    return null;
  });

  // Config & Theme State scoped to initial user
  const [config, setConfig] = useState<UserConfig>(() => {
    try {
      const savedSession = localStorage.getItem('bosco_user_session');
      const session = savedSession ? JSON.parse(savedSession) : null;
      if (session?.email) {
        return loadUserConfig(session.email, session.name);
      }
      const saved = localStorage.getItem('bosco_config');
      if (saved) return { ...DEFAULT_CONFIG, ...JSON.parse(saved) };
    } catch {}
    return DEFAULT_CONFIG;
  });

  // Chats State strictly scoped to the active student
  const [chats, setChats] = useState<ChatSession[]>(() => {
    try {
      const savedSession = localStorage.getItem('bosco_user_session');
      const session = savedSession ? JSON.parse(savedSession) : null;
      if (session?.email) {
        const loaded = loadUserChats(session.email);
        if (loaded.length > 0) return loaded;
      }
    } catch {}
    return [];
  });

  const [activeChatId, setActiveChatId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [showScrollBottom, setShowScrollBottom] = useState(false);
  const [stagedPrompt, setStagedPrompt] = useState<string>('');
  const [speakingMessageId, setSpeakingMessageId] = useState<string | null>(null);

  // Gamification State (XP, levels, streak, badges)
  const [gamification, setGamification] = useState<StudentGamification>(() => {
    try {
      const savedSession = localStorage.getItem('bosco_user_session');
      const session = savedSession ? JSON.parse(savedSession) : null;
      const key = getUserStorageKey(session?.email, 'gamification');
      const saved = localStorage.getItem(key);
      if (saved) return JSON.parse(saved);
    } catch {}
    return INITIAL_GAMIFICATION;
  });

  // Active Modular Institution State
  const [activeInstitution, setActiveInstitution] = useState<InstitutionConfig>(() => {
    try {
      const savedId = localStorage.getItem('bosco_active_institution_id');
      const savedList = localStorage.getItem('bosco_institutions');
      const list: InstitutionConfig[] = savedList ? JSON.parse(savedList) : INSTITUTIONS_PRESETS;
      const match = list.find((i) => i.id === savedId);
      if (match) return match;
    } catch {}
    return INSTITUTIONS_PRESETS[0];
  });

  const [isGamificationOpen, setIsGamificationOpen] = useState(false);
  const [isLmsOpen, setIsLmsOpen] = useState(false);
  const [isInstitutionOpen, setIsInstitutionOpen] = useState(false);
  const [isClassPointOpen, setIsClassPointOpen] = useState(false);

  // Award XP and advance student levels + ClassCoins
  const awardXp = (amount: number, _reason?: string) => {
    // Add ClassCoins directly to the student's ClassPoint balance
    const coinsEarned = Math.max(5, Math.ceil(amount / 5));
    const newCoins = ClassPointService.addClassCoins(config.username, coinsEarned);

    setGamification((prev) => {
      const newXp = prev.xp + amount;
      const nextLevelTarget = prev.level * 250;
      let newLevel = prev.level;
      let newTitle = prev.levelTitle;

      if (newXp >= nextLevelTarget) {
        newLevel = prev.level + 1;
        const titles = [
          'Aprendiz Curioso',
          'Explorador del Conocimiento',
          'Razonador Lógico',
          'Investigador Creativo',
          'Maestro del Pensamiento',
        ];
        newTitle = titles[Math.min(titles.length - 1, newLevel - 1)];
      }

      const updated = {
        ...prev,
        xp: newXp,
        level: newLevel,
        levelTitle: newTitle,
        classCoins: newCoins,
      };

      if (userSession?.email) {
        try {
          const key = getUserStorageKey(userSession.email, 'gamification');
          localStorage.setItem(key, JSON.stringify(updated));
        } catch {}
      }
      return updated;
    });
  };

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  // When a user logs in, switch immediately to their own private chats and config
  const handleLoginSuccess = (rawSession: UserSession) => {
    const isCreator =
      rawSession.email?.toLowerCase() === 'ricardovazquezcaicedo@gmail.com' ||
      rawSession.username?.toLowerCase() === 'creador';
    const session: UserSession = isCreator
      ? {
          ...rawSession,
          role: 'creadorOriginal',
          username: 'creador',
          institutionId: 'global',
          institutionName: 'Red Global BoscoClass',
        }
      : rawSession;

    setUserSession(session);
    try {
      localStorage.setItem('bosco_user_session', JSON.stringify(session));
    } catch {}

    // Load THIS student's private config
    const userCfg = loadUserConfig(session.email, session.name);
    setConfig({
      ...userCfg,
      username: session.name || userCfg.username,
      academicLevel: session.academicLevel || userCfg.academicLevel,
    });

    // Load THIS student's private chats
    const userChats = loadUserChats(session.email);
    if (userChats.length > 0) {
      setChats(userChats);
      setActiveChatId(userChats[0].id);
    } else {
      const freshChat: ChatSession = {
        id: `chat-${Date.now()}`,
        title: 'Nueva conversación',
        createdAt: Date.now(),
        updatedAt: Date.now(),
        messages: [],
      };
      setChats([freshChat]);
      setActiveChatId(freshChat.id);
    }
  };

  // When student logs out, save their current chats and clear memory completely
  const handleLogout = () => {
    if (userSession?.email) {
      try {
        const key = getUserStorageKey(userSession.email, 'chats');
        localStorage.setItem(key, JSON.stringify(chats));
      } catch {}
    }

    try {
      localStorage.removeItem('bosco_user_session');
    } catch {}

    setUserSession(null);
    setChats([]);
    setActiveChatId(null);
    setIsSettingsOpen(false);
    setIsMobileSidebarOpen(false);
  };

  // Apply Theme & Save config scoped to student
  useEffect(() => {
    const root = document.documentElement;
    if (config.theme === 'dark') {
      root.classList.add('dark');
      root.setAttribute('data-theme', 'dark');
    } else {
      root.classList.remove('dark');
      root.setAttribute('data-theme', 'light');
    }
    try {
      localStorage.setItem('bosco_config', JSON.stringify(config));
    } catch {}

    if (userSession?.email) {
      try {
        const key = getUserStorageKey(userSession.email, 'config');
        localStorage.setItem(key, JSON.stringify(config));
      } catch {}
    }
  }, [config, userSession?.email]);

  // Save Chats strictly scoped to the logged-in student
  useEffect(() => {
    if (!userSession?.email) return;
    try {
      const key = getUserStorageKey(userSession.email, 'chats');
      localStorage.setItem(key, JSON.stringify(chats));
    } catch (e) {
      console.error('Error guardando chats del usuario en localStorage', e);
    }
  }, [chats, userSession?.email]);

  // Ensure active chat if a user has chats
  useEffect(() => {
    if (!userSession) return;
    if (chats.length === 0) {
      handleNewChat();
    } else if (!activeChatId || !chats.some((c) => c.id === activeChatId)) {
      setActiveChatId(chats[0].id);
    }
  }, [userSession, chats.length, activeChatId]);

  const activeChat = chats.find((c) => c.id === activeChatId) || null;

  // Auto-scroll logic
  const scrollToBottom = useCallback((smooth = true) => {
    messagesEndRef.current?.scrollIntoView({ behavior: smooth ? 'smooth' : 'auto' });
  }, []);

  useEffect(() => {
    if (!showScrollBottom) {
      scrollToBottom(false);
    }
  }, [activeChat?.messages, showScrollBottom, scrollToBottom]);

  const handleScroll = () => {
    if (!messagesContainerRef.current) return;
    const { scrollTop, scrollHeight, clientHeight } = messagesContainerRef.current;
    const isUp = scrollHeight - scrollTop - clientHeight > 160;
    setShowScrollBottom(isUp);
  };

  // Create New Chat
  const handleNewChat = () => {
    const newId = Date.now().toString();
    const newChatSession: ChatSession = {
      id: newId,
      title: 'Nueva conversación',
      createdAt: Date.now(),
      updatedAt: Date.now(),
      messages: [],
    };
    setChats((prev) => [newChatSession, ...prev]);
    setActiveChatId(newId);
  };

  // Delete Chat
  const handleDeleteChat = (id: string) => {
    setChats((prev) => {
      const remaining = prev.filter((c) => c.id !== id);
      if (activeChatId === id) {
        if (remaining.length > 0) {
          setActiveChatId(remaining[0].id);
        } else {
          // If all deleted, will be created by effect
          setActiveChatId(null);
        }
      }
      return remaining;
    });
  };

  // Rename Chat
  const handleRenameChat = (id: string, newTitle: string) => {
    setChats((prev) =>
      prev.map((c) => (c.id === id ? { ...c, title: newTitle, updatedAt: Date.now() } : c))
    );
  };

  // Clear All Chats for the current active student only
  const handleClearAllChats = () => {
    const freshChat: ChatSession = {
      id: `chat-${Date.now()}`,
      title: 'Nueva conversación',
      createdAt: Date.now(),
      updatedAt: Date.now(),
      messages: [],
    };
    setChats([freshChat]);
    setActiveChatId(freshChat.id);
    if (userSession?.email) {
      try {
        const key = getUserStorageKey(userSession.email, 'chats');
        localStorage.setItem(key, JSON.stringify([freshChat]));
      } catch {}
    }
  };

  // Export Single Chat as Markdown (.md)
  const handleExportChat = (id: string) => {
    const chatToExport = chats.find((c) => c.id === id);
    if (!chatToExport) return;

    let md = `# ${chatToExport.title}\n\n`;
    md += `*Fecha: ${new Date(chatToExport.createdAt).toLocaleString()}*\n`;
    md += `*Tutor: BoscoIA - Nivel: ${config.academicLevel}*\n`;
    md += `*Estudiante: ${config.username} (${userSession?.email || 'Invitado'})*\n\n---\n\n`;

    chatToExport.messages.forEach((m) => {
      const sender = m.role === 'assistant' ? '🤖 BoscoIA' : `👤 ${config.username}`;
      const time = new Date(m.timestamp).toLocaleTimeString();
      md += `### ${sender} (${time})\n\n${m.content}\n\n`;
      if (m.files && m.files.length > 0) {
        md += `*Archivos adjuntos: ${m.files.map((f) => f.name).join(', ')}*\n\n`;
      }
    });

    const blob = new Blob([md], { type: 'text/markdown;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${chatToExport.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.md`;
    link.click();
    URL.revokeObjectURL(url);
  };

  // Export All Data (JSON Backup for current student)
  const handleExportAllData = () => {
    const data = {
      user: {
        name: config.username,
        email: userSession?.email || 'invitado',
        academicLevel: config.academicLevel,
        teachingTone: config.teachingTone,
      },
      chats,
      exportedAt: new Date().toISOString(),
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    const cleanUser = config.username.replace(/[^a-z0-9]/gi, '_').toLowerCase() || 'estudiante';
    link.download = `boscoia_${cleanUser}_backup_${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  // Speech synthesis (Text-to-Speech) using Gemini Neural TTS or browser natural voice
  const handleToggleSpeech = (id: string, text: string) => {
    if (speakingMessageId === id) {
      stopSpeech();
      setSpeakingMessageId(null);
      return;
    }

    stopSpeech();
    setSpeakingMessageId(id);

    speakText({
      text,
      id,
      voiceEngine: config.voiceEngine ?? 'gemini',
      voiceName: config.voiceName ?? 'Kore',
      voiceSpeed: config.voiceSpeed ?? 1.0,
      voicePitch: config.voicePitch ?? 1.0,
      onStart: () => setSpeakingMessageId(id),
      onEnd: () => setSpeakingMessageId(null),
      onError: () => setSpeakingMessageId(null),
    });
  };

  // Stop Generation
  const handleStopGeneration = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
    setIsLoading(false);
  };

  // Send Message with SSE Streaming
  const handleSendMessage = async (text: string, attachments: ChatAttachment[] = []) => {
    if (!activeChatId) return;

    const currentChat = chats.find((c) => c.id === activeChatId);
    if (!currentChat) return;

    const userMessage: ChatMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: text,
      files: attachments,
      timestamp: Date.now(),
    };

    const isFirstMessage = currentChat.messages.length === 0;
    const computedTitle = isFirstMessage
      ? text.length > 32
        ? `${text.slice(0, 32).trim()}...`
        : text || (attachments[0]?.name ? `Archivo: ${attachments[0].name}` : 'Conversación')
      : currentChat.title;

    const assistantMessageId = `asst-${Date.now()}`;
    const assistantPlaceholder: ChatMessage = {
      id: assistantMessageId,
      role: 'assistant',
      content: '',
      timestamp: Date.now(),
      isStreaming: true,
    };

    // Update state with user message + streaming assistant placeholder
    const updatedMessages = [...currentChat.messages, userMessage, assistantPlaceholder];

    setChats((prev) =>
      prev.map((c) =>
        c.id === activeChatId
          ? {
              ...c,
              title: computedTitle,
              updatedAt: Date.now(),
              messages: updatedMessages,
            }
          : c
      )
    );

    setIsLoading(true);
    const boscoConfig = ClassPointService.getBoscoIAConfig();
    const isStudent = userSession?.role === 'estudiante';
    if (boscoConfig.isLocked && isStudent) {
      const lockedNotice = `🔒 **BoscoIA se encuentra temporalmente bloqueado por tu docente o director.**\n\n**Motivo:** ${boscoConfig.lockedReason || 'Evaluación o examen activo en el salón.'}\n\n*Por favor enfócate en tu evaluación presencial. ¡Mucho éxito!*`;
      setChats((prev) =>
        prev.map((c) =>
          c.id !== activeChatId
            ? c
            : {
                ...c,
                messages: c.messages.map((m) =>
                  m.id === assistantMessageId
                    ? { ...m, content: lockedNotice, isStreaming: false }
                    : m
                ),
              }
        )
      );
      setIsLoading(false);
      return;
    }

    awardXp(25, 'Consulta académica enviada');
    const controller = new AbortController();
    abortControllerRef.current = controller;

    try {
      // Build messages payload for server
      const messagesPayload = updatedMessages
        .filter((m) => m.id !== assistantMessageId)
        .map((m) => ({
          role: m.role,
          content: m.content,
          files: m.files?.map((f) => ({
            name: f.name,
            mimeType: f.mimeType,
            data: f.data,
          })),
        }));

      const socraticInstruction = boscoConfig.socraticOnly
        ? '\n[MODO SOCRÁTICO OBLIGATORIO: El docente ha establecido que NO des respuestas directas. Solo proporciona pistas pedagógicas, preguntas de reflexión y pasos guiados para que el estudiante piense.]'
        : '';

      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        signal: controller.signal,
        body: JSON.stringify({
          messages: messagesPayload,
          academicLevel: config.academicLevel,
          teachingTone: config.teachingTone,
          systemInstruction: (activeInstitution.customRubric || '') + socraticInstruction,
        }),
      });

      if (!response.ok) {
        let errMessage = 'Error al comunicarse con el servidor.';
        try {
          const errData = await response.json();
          if (errData.error) errMessage = errData.error;
        } catch {}
        throw new Error(errMessage);
      }

      if (!response.body) {
        throw new Error('Respuesta sin flujo de datos.');
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let assistantText = '';
      let buffer = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';

        for (const line of lines) {
          if (line.startsWith('data:')) {
            const dataStr = line.slice(5).trim();
            if (dataStr === '[DONE]') continue;
            if (!dataStr) continue;

            try {
              const parsed = JSON.parse(dataStr);
              if (parsed.delta) {
                assistantText += parsed.delta;

                // Update assistant content live
                setChats((prev) =>
                  prev.map((c) => {
                    if (c.id !== activeChatId) return c;
                    return {
                      ...c,
                      messages: c.messages.map((m) =>
                        m.id === assistantMessageId
                          ? { ...m, content: assistantText, isStreaming: true }
                          : m
                      ),
                    };
                  })
                );
              } else if (parsed.error) {
                throw new Error(parsed.error);
              }
            } catch (err: any) {
              if (err.message && !dataStr.startsWith('{')) {
                // Ignore plain heartbeat or raw chunk parse exceptions
              } else if (err.message) {
                throw err;
              }
            }
          }
        }
      }

      // Finalize assistant message
      setChats((prev) =>
        prev.map((c) => {
          if (c.id !== activeChatId) return c;
          return {
            ...c,
            messages: c.messages.map((m) =>
              m.id === assistantMessageId
                ? { ...m, content: assistantText || 'Sin respuesta generada.', isStreaming: false }
                : m
            ),
          };
        })
      );

      // Award ClassCoins/Boscoints if permitted by teacher/director
      if (userSession) {
        const u = userSession.username || userSession.email.split('@')[0] || config.username;
        const record = ClassPointService.recordAIQuestion(u);
        if (record.allowed && record.coinsEarned > 0) {
          awardXp(record.coinsEarned * 10, 'Pregunta didáctica resuelta con BoscoIA');
        }
      }
    } catch (err: any) {
      if (err.name === 'AbortError') {
        // User stopped generation manually
        setChats((prev) =>
          prev.map((c) => {
            if (c.id !== activeChatId) return c;
            return {
              ...c,
              messages: c.messages.map((m) =>
                m.id === assistantMessageId
                  ? { ...m, isStreaming: false }
                  : m
              ),
            };
          })
        );
      } else {
        const errorMessage = err?.message || 'Error de conexión con el asistente BoscoIA.';
        setChats((prev) =>
          prev.map((c) => {
            if (c.id !== activeChatId) return c;
            return {
              ...c,
              messages: c.messages.map((m) =>
                m.id === assistantMessageId
                  ? {
                      ...m,
                      content: errorMessage,
                      isStreaming: false,
                      error: true,
                    }
                  : m
              ),
            };
          })
        );
      }
    } finally {
      setIsLoading(false);
      abortControllerRef.current = null;
    }
  };

  // Regenerate last assistant response
  const handleRegenerate = () => {
    if (!activeChat || activeChat.messages.length === 0 || isLoading) return;

    // Find last user message
    const lastUserMsgIdx = [...activeChat.messages].reverse().findIndex((m) => m.role === 'user');
    if (lastUserMsgIdx === -1) return;

    const actualIdx = activeChat.messages.length - 1 - lastUserMsgIdx;
    const lastUserMsg = activeChat.messages[actualIdx];

    // Remove any assistant messages after this user message
    const trimmedMessages = activeChat.messages.slice(0, actualIdx);

    setChats((prev) =>
      prev.map((c) => (c.id === activeChat.id ? { ...c, messages: trimmedMessages } : c))
    );

    // Resend user message
    handleSendMessage(lastUserMsg.content, lastUserMsg.files || []);
  };

  if (!userSession) {
    return (
      <BoscoClassLanding
        onLoginSuccess={handleLoginSuccess}
        theme={config.theme}
        onToggleTheme={() =>
          setConfig((prev) => ({ ...prev, theme: prev.theme === 'dark' ? 'light' : 'dark' }))
        }
      />
    );
  }

  return (
    <div className={`${config.theme === 'dark' ? 'dark' : ''} min-h-screen w-full bg-[#f4f8f8] dark:bg-[#070e0c]`}>
      <ClassPointDashboard
        userSession={userSession}
        onLogout={handleLogout}
        theme={config.theme}
        onToggleTheme={() =>
          setConfig((prev) => ({ ...prev, theme: prev.theme === 'dark' ? 'light' : 'dark' }))
        }
        onUpdateUserSession={(updatedSession) => {
          setUserSession(updatedSession);
          try {
            localStorage.setItem('bosco_user_session', JSON.stringify(updatedSession));
          } catch {}
          setConfig((prev) => ({
            ...prev,
            username: updatedSession.name || prev.username,
          }));
        }}
        onOpenBoscoIA={(prompt) => {
          if (prompt) {
            setStagedPrompt(prompt);
          }
        }}
        renderBoscoIATutor={() => (
          <div className="flex h-full min-h-[78vh] w-full rounded-3xl overflow-hidden border border-slate-200 dark:border-[#1e342b] bg-white dark:bg-[#0a110f] shadow-xl relative">
            {/* Sidebar with conversation history */}
            <div className="hidden lg:block w-72 shrink-0 border-r border-slate-200 dark:border-[#1a2d24]">
              <Sidebar
                chats={chats}
                activeChatId={activeChatId}
                onSelectChat={(id) => {
                  setActiveChatId(id);
                  scrollToBottom();
                }}
                onNewChat={handleNewChat}
                onDeleteChat={handleDeleteChat}
                onRenameChat={handleRenameChat}
                onExportChat={handleExportChat}
                config={config}
                onToggleTheme={() =>
                  setConfig((prev) => ({ ...prev, theme: prev.theme === 'dark' ? 'light' : 'dark' }))
                }
                onOpenSettings={() => setIsSettingsOpen(true)}
                isOpenMobile={false}
                onCloseMobile={() => {}}
                userSession={userSession}
                onLogout={handleLogout}
                onOpenGamification={() => setIsGamificationOpen(true)}
                onOpenLms={() => setIsLmsOpen(true)}
                onOpenInstitution={() => setIsInstitutionOpen(true)}
                onOpenClassPoint={() => setIsClassPointOpen(true)}
                gamification={gamification}
                institutionName={activeInstitution.name}
                institutionLogo={activeInstitution.logoUrl}
              />
            </div>

            {/* Chat Workspace */}
            <div className="flex-1 flex flex-col h-full min-w-0 overflow-hidden relative bg-[#f8fafc]/50 dark:bg-[#08120f]/50">
              {/* Tutor Header Controls */}
              <div className="px-4 py-2.5 border-b border-slate-200 dark:border-[#1a2e26] bg-white dark:bg-[#0e1815] flex items-center justify-between shrink-0">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-emerald-500 text-white grid place-items-center font-bold">
                    <Sparkles className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-xs font-bold text-slate-800 dark:text-slate-100">
                      BoscoIA · Tutor Didáctico
                    </h3>
                    <p className="text-[10px] text-slate-400">
                      Resolución socrática, KaTeX y diagramas biológicos
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 text-xs">
                  <button
                    onClick={handleNewChat}
                    className="px-2.5 py-1 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 font-bold border border-emerald-200 dark:border-emerald-800/40 hover:bg-emerald-100 text-[11px]"
                  >
                    + Nuevo Chat
                  </button>
                  {activeChat && activeChat.messages.length > 0 && (
                    <>
                      <button
                        onClick={() => handleExportChat(activeChat.id)}
                        className="p-1.5 rounded-lg text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800"
                        title="Exportar chat"
                      >
                        <FileDown className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={handleRegenerate}
                        disabled={isLoading}
                        className="p-1.5 rounded-lg text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800"
                        title="Regenerar respuesta"
                      >
                        <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
                      </button>
                    </>
                  )}
                </div>
              </div>

              {/* Messages Scroll Area */}
              <div
                ref={messagesContainerRef}
                onScroll={handleScroll}
                className="flex-1 overflow-y-auto px-4 py-4 space-y-4"
              >
                {!activeChat || activeChat.messages.length === 0 ? (
                  <WelcomeScreen
                    config={config}
                    onSelectPrompt={(promptText) => {
                      setStagedPrompt(promptText);
                    }}
                  />
                ) : (
                  activeChat.messages.map((message, idx) => {
                    const isLatestAssistant =
                      idx === activeChat.messages.length - 1 && message.role === 'assistant';
                    return (
                      <MessageBubble
                        key={message.id || idx}
                        message={message}
                        speakingMessageId={speakingMessageId}
                        onToggleSpeech={handleToggleSpeech}
                        onRegenerate={isLatestAssistant ? handleRegenerate : undefined}
                        isLatestAssistantMessage={isLatestAssistant}
                        onQuickAction={(actionText, autoSend) => {
                          awardXp(50, 'Uso de guía pedagógica interactiva');
                          if (autoSend) {
                            handleSendMessage(actionText, []);
                          } else {
                            setStagedPrompt(actionText);
                          }
                        }}
                      />
                    );
                  })
                )}
                <div ref={messagesEndRef} className="h-4" />
              </div>

              {/* Scroll to bottom button */}
              {showScrollBottom && (
                <button
                  onClick={() => scrollToBottom(true)}
                  className="absolute bottom-24 right-5 z-20 p-2 rounded-full bg-emerald-600 text-white shadow-lg hover:bg-emerald-500 transition-all active:scale-95"
                  title="Ir al final de la conversación"
                >
                  <ArrowDown className="w-4 h-4" />
                </button>
              )}

              {/* Composer */}
              <div className="p-3 border-t border-slate-200 dark:border-[#1a2d24] bg-white dark:bg-[#0c1613]">
                <Composer
                  onSendMessage={handleSendMessage}
                  isLoading={isLoading}
                  onStop={handleStopGeneration}
                  initialText={stagedPrompt}
                  onTextConsumed={() => setStagedPrompt('')}
                />
              </div>
            </div>
          </div>
        )}
      />

      {/* Settings Modal */}
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        config={config}
        onSaveConfig={setConfig}
        onClearAllChats={handleClearAllChats}
        onExportAllData={handleExportAllData}
        userSession={userSession}
      />

      {/* Gamification & Badges Modal */}
      <GamificationModal
        isOpen={isGamificationOpen}
        onClose={() => setIsGamificationOpen(false)}
        gamification={gamification}
        username={config.username}
      />
    </div>
  );
}
