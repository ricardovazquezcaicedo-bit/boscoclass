import React, { useState, useEffect } from 'react';
import {
  Copy,
  Check,
  Volume2,
  VolumeX,
  RotateCcw,
  FileText,
  User,
  Sparkles,
  AlertCircle,
  FileCode,
  FileImage,
} from 'lucide-react';
import { ChatMessage, ChatAttachment } from '../types';
import { MarkdownRenderer } from './MarkdownRenderer';

interface MessageBubbleProps {
  message: ChatMessage;
  onRegenerate?: () => void;
  speakingMessageId: string | null;
  onToggleSpeech: (id: string, text: string) => void;
  isLatestAssistantMessage?: boolean;
  onQuickAction?: (actionPrompt: string, autoSend: boolean) => void;
}

export const MessageBubble: React.FC<MessageBubbleProps> = ({
  message,
  onRegenerate,
  speakingMessageId,
  onToggleSpeech,
  isLatestAssistantMessage,
  onQuickAction,
}) => {
  const [copied, setCopied] = useState(false);
  const isAssistant = message.role === 'assistant';
  const isSpeaking = speakingMessageId === message.id;

  const handleCopy = () => {
    navigator.clipboard.writeText(message.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const renderAttachment = (file: ChatAttachment, idx: number) => {
    const isImage = file.mimeType.startsWith('image/');
    if (isImage) {
      return (
        <div key={idx} className="relative group rounded-xl overflow-hidden border border-slate-200 dark:border-slate-700 bg-slate-900/10 max-w-xs">
          <img
            src={file.data}
            alt={file.name}
            className="w-full h-auto max-h-56 object-cover cursor-pointer hover:scale-[1.02] transition-transform"
            onClick={() => {
              const win = window.open();
              win?.document.write(`<img src="${file.data}" style="max-width:100%; height:auto;" />`);
            }}
          />
          <div className="p-1.5 bg-black/70 text-white text-[11px] truncate px-2.5">
            {file.name} · {formatFileSize(file.size)}
          </div>
        </div>
      );
    }

    const isCode = file.name.endsWith('.js') || file.name.endsWith('.py') || file.name.endsWith('.ts') || file.name.endsWith('.html') || file.name.endsWith('.css');

    return (
      <div
        key={idx}
        className="flex items-center gap-2.5 p-2.5 rounded-xl border border-slate-200 dark:border-[#22382f] bg-white dark:bg-[#14231e] text-xs max-w-xs"
      >
        <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
          {isCode ? <FileCode className="w-4 h-4" /> : <FileText className="w-4 h-4" />}
        </div>
        <div className="truncate min-w-0 flex-1">
          <p className="font-medium text-slate-800 dark:text-slate-200 truncate">{file.name}</p>
          <p className="text-[10px] text-slate-400">{formatFileSize(file.size)}</p>
        </div>
      </div>
    );
  };

  return (
    <div className={`flex gap-3 max-w-4xl w-full mx-auto group ${isAssistant ? '' : 'justify-end'}`}>
      {/* Assistant Avatar */}
      {isAssistant && (
        <div className="shrink-0 w-8 h-8 rounded-xl bg-white dark:bg-[#12231e] border border-slate-200 dark:border-[#1e382f] p-1 grid place-items-center shadow-xs mt-1">
          <img
            src="/assets/aistudio/image_c159dc3e.png"
            alt="BoscoIA"
            className="w-full h-full object-contain"
          />
        </div>
      )}

      {/* Bubble Container */}
      <div className={`flex flex-col max-w-[88%] sm:max-w-[80%] ${isAssistant ? 'items-start' : 'items-end'}`}>
        {/* Header label */}
        <div className="flex items-center gap-2 px-1 mb-1 text-[11px] text-slate-400">
          <span>{isAssistant ? 'BoscoIA · Tutor' : 'Tú'}</span>
          <span>·</span>
          <span>
            {new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </span>
        </div>

        {/* Bubble body */}
        <div
          className={`rounded-2xl p-4 sm:p-5 shadow-xs transition-all ${
            isAssistant
              ? 'bg-white dark:bg-[#101c18] border border-slate-200 dark:border-[#1d332a] text-slate-900 dark:text-slate-100'
              : 'bg-emerald-600 dark:bg-[#1b4337] text-white border border-emerald-700/30 dark:border-emerald-600/30'
          }`}
        >
          {/* Attached Files */}
          {message.files && message.files.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-3">
              {message.files.map((file, idx) => renderAttachment(file, idx))}
            </div>
          )}

          {/* Content */}
          {message.error ? (
            <div className="flex items-start gap-2.5 text-red-600 dark:text-red-400 text-sm">
              <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
              <div>
                <p className="font-medium">Ocurrió un error al generar la respuesta:</p>
                <p className="text-xs mt-1 opacity-90">{message.content}</p>
              </div>
            </div>
          ) : isAssistant ? (
            <div className="relative">
              <MarkdownRenderer content={message.content} />
              {message.isStreaming && (
                <span className="inline-block w-2 h-4 ml-1 bg-emerald-500 animate-pulse align-middle" />
              )}
            </div>
          ) : (
            <div className="whitespace-pre-wrap text-sm leading-relaxed">{message.content}</div>
          )}

          {/* Pedagogical Interactive Action Chips */}
          {isAssistant && !message.isStreaming && !message.error && isLatestAssistantMessage && onQuickAction && (
            <div className="mt-4 pt-3.5 border-t border-slate-100 dark:border-[#1a2e26]">
              <div className="flex items-center gap-1.5 text-[11px] font-semibold text-emerald-700 dark:text-emerald-400 mb-2.5">
                <Sparkles className="w-3.5 h-3.5" />
                <span>¿Cómo deseas continuar el aprendizaje?</span>
              </div>
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() =>
                    onQuickAction(
                      'Dame una pista del siguiente paso sin darme la solución completa.',
                      true
                    )
                  }
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-950/40 dark:hover:bg-emerald-900/50 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/40 transition-all hover:scale-[1.02] active:scale-[0.98] shadow-xs cursor-pointer"
                >
                  <span>💡</span>
                  <span>Pista del siguiente paso</span>
                </button>

                <button
                  type="button"
                  onClick={() => onQuickAction('¿Está bien lo que hice?: ', false)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium bg-sky-50 hover:bg-sky-100 dark:bg-sky-950/40 dark:hover:bg-sky-900/50 text-sky-700 dark:text-sky-300 border border-sky-200 dark:border-sky-800/40 transition-all hover:scale-[1.02] active:scale-[0.98] shadow-xs cursor-pointer"
                >
                  <span>✍️</span>
                  <span>Comprobar mi respuesta</span>
                </button>

                <button
                  type="button"
                  onClick={() =>
                    onQuickAction(
                      'Por favor explícamelo de otra forma con una analogía más cotidiana y sencilla.',
                      true
                    )
                  }
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium bg-amber-50 hover:bg-amber-100 dark:bg-amber-950/40 dark:hover:bg-amber-900/50 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-800/40 transition-all hover:scale-[1.02] active:scale-[0.98] shadow-xs cursor-pointer"
                >
                  <span>🔄</span>
                  <span>Explicar de otra forma</span>
                </button>

                <button
                  type="button"
                  onClick={() =>
                    onQuickAction(
                      'Proponme un ejercicio similar para poner a prueba lo aprendido.',
                      true
                    )
                  }
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium bg-purple-50 hover:bg-purple-100 dark:bg-purple-950/40 dark:hover:bg-purple-900/50 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800/40 transition-all hover:scale-[1.02] active:scale-[0.98] shadow-xs cursor-pointer"
                >
                  <span>📝</span>
                  <span>Ejercicio similar</span>
                </button>

                <button
                  type="button"
                  onClick={() =>
                    onQuickAction(
                      '¿Podrías desglosarlo en un paso a paso aún más detallado?',
                      true
                    )
                  }
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium bg-slate-50 hover:bg-slate-100 dark:bg-[#152721] dark:hover:bg-[#1a312a] text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-[#223930] transition-all hover:scale-[1.02] active:scale-[0.98] shadow-xs cursor-pointer"
                >
                  <span>🔍</span>
                  <span>Paso a paso detallado</span>
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Assistant Actions Bar */}
        {isAssistant && !message.isStreaming && !message.error && (
          <div className="flex items-center gap-1 mt-1.5 px-1 opacity-80 group-hover:opacity-100 transition-opacity">
            <button
              onClick={handleCopy}
              className="flex items-center gap-1 px-2 py-1 rounded-lg text-xs text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-[#162721] transition-colors"
              title="Copiar respuesta completa"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Copiado' : 'Copiar'}</span>
            </button>

            {'speechSynthesis' in window && (
              <button
                onClick={() => onToggleSpeech(message.id, message.content)}
                className={`flex items-center gap-1 px-2 py-1 rounded-lg text-xs transition-colors ${
                  isSpeaking
                    ? 'text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 font-medium'
                    : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-[#162721]'
                }`}
                title={isSpeaking ? 'Pausar o detener lectura en voz alta' : 'Escuchar respuesta con voz'}
              >
                {isSpeaking ? <VolumeX className="w-3.5 h-3.5 animate-pulse" /> : <Volume2 className="w-3.5 h-3.5" />}
                <span>{isSpeaking ? 'Detener voz' : 'Escuchar'}</span>
              </button>
            )}

            {onRegenerate && (
              <button
                onClick={onRegenerate}
                className="flex items-center gap-1 px-2 py-1 rounded-lg text-xs text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-[#162721] transition-colors"
                title="Volver a generar esta respuesta"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Regenerar</span>
              </button>
            )}
          </div>
        )}
      </div>

      {/* User Avatar */}
      {!isAssistant && (
        <div className="shrink-0 w-8 h-8 rounded-xl bg-slate-300 dark:bg-[#1e382f] text-slate-700 dark:text-emerald-200 grid place-items-center shadow-xs mt-1">
          <User className="w-4 h-4" />
        </div>
      )}
    </div>
  );
};
