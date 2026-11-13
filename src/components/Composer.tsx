import React, { useState, useRef, useEffect } from 'react';
import {
  ArrowUp,
  Square,
  Paperclip,
  Mic,
  MicOff,
  X,
  FileText,
  Image as ImageIcon,
  FileCode,
} from 'lucide-react';
import { ChatAttachment } from '../types';

interface ComposerProps {
  onSendMessage: (text: string, attachments: ChatAttachment[]) => void;
  isLoading: boolean;
  onStop: () => void;
  placeholder?: string;
  initialText?: string;
  onTextConsumed?: () => void;
}

export const Composer: React.FC<ComposerProps> = ({
  onSendMessage,
  isLoading,
  onStop,
  placeholder = 'Pregunta a BoscoIA sobre cualquier tema, ejercicio o concepto...',
  initialText = '',
  onTextConsumed,
}) => {
  const [text, setText] = useState('');
  const [attachments, setAttachments] = useState<ChatAttachment[]>([]);
  const [isRecording, setIsRecording] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const recognitionRef = useRef<any>(null);

  // Update text if initialText changes from suggestion click
  useEffect(() => {
    if (initialText) {
      setText(initialText);
      if (onTextConsumed) onTextConsumed();
      setTimeout(() => {
        if (textareaRef.current) {
          textareaRef.current.focus();
          textareaRef.current.style.height = 'auto';
          textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 180)}px`;
        }
      }, 50);
    }
  }, [initialText, onTextConsumed]);

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 180)}px`;
    }
  }, [text]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const handleSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (isLoading) return;
    const trimmed = text.trim();
    if (!trimmed && attachments.length === 0) return;

    onSendMessage(trimmed, attachments);
    setText('');
    setAttachments([]);
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }
  };

  // Handle file uploads
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;
    processFiles(Array.from(e.target.files));
    e.target.value = '';
  };

  const processFiles = (files: File[]) => {
    files.forEach((file) => {
      if (file.size > 20 * 1024 * 1024) {
        alert(`El archivo ${file.name} supera el límite de 20MB.`);
        return;
      }

      const reader = new FileReader();
      reader.onload = (loadEvent) => {
        const base64Data = loadEvent.target?.result as string;
        setAttachments((prev) => [
          ...prev,
          {
            name: file.name,
            mimeType: file.type || 'application/octet-stream',
            data: base64Data,
            size: file.size,
          },
        ]);
      };
      reader.readAsDataURL(file);
    });
  };

  const removeAttachment = (index: number) => {
    setAttachments((prev) => prev.filter((_, i) => i !== index));
  };

  // Voice dictation (Speech Recognition)
  const toggleRecording = () => {
    if (isRecording) {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
      setIsRecording(false);
      return;
    }

    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert('Tu navegador no soporta reconocimiento de voz nativo. Por favor usa Chrome, Edge o Safari.');
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.lang = 'es-ES';
      recognition.continuous = true;
      recognition.interimResults = true;

      recognition.onstart = () => {
        setIsRecording(true);
      };

      recognition.onresult = (event: any) => {
        let transcript = '';
        for (let i = event.resultIndex; i < event.results.length; ++i) {
          transcript += event.results[i][0].transcript;
        }
        setText((prev) => (prev ? `${prev} ${transcript}` : transcript));
      };

      recognition.onerror = () => {
        setIsRecording(false);
      };

      recognition.onend = () => {
        setIsRecording(false);
      };

      recognitionRef.current = recognition;
      recognition.start();
    } catch {
      setIsRecording(false);
    }
  };

  // Drag and Drop files
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      processFiles(Array.from(e.dataTransfer.files));
    }
  };

  const canSubmit = (text.trim().length > 0 || attachments.length > 0) && !isLoading;

  return (
    <div
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      className={`w-full max-w-4xl mx-auto rounded-2xl border transition-all ${
        isDragging
          ? 'border-emerald-500 bg-emerald-500/10 scale-[1.005]'
          : 'border-slate-200 dark:border-[#1e342a] bg-white dark:bg-[#101c18] shadow-lg shadow-black/5'
      }`}
    >
      {/* Attachments preview tray */}
      {attachments.length > 0 && (
        <div className="flex flex-wrap gap-2 p-3 pb-0 border-b border-slate-100 dark:border-[#192b23]">
          {attachments.map((file, idx) => (
            <div
              key={idx}
              className="flex items-center gap-2 px-2.5 py-1.5 rounded-xl bg-slate-50 dark:bg-[#162722] border border-slate-200 dark:border-[#223930] text-xs max-w-xs"
            >
              {file.mimeType.startsWith('image/') ? (
                <img src={file.data} alt={file.name} className="w-6 h-6 object-cover rounded-md" />
              ) : (
                <FileText className="w-4 h-4 text-emerald-500" />
              )}
              <span className="truncate text-slate-800 dark:text-slate-200 text-[11px] max-w-[140px]">
                {file.name}
              </span>
              <button
                type="button"
                onClick={() => removeAttachment(idx)}
                className="text-slate-400 hover:text-red-500 transition-colors p-0.5"
                title="Quitar archivo"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Main input text area */}
      <div className="p-3">
        <textarea
          ref={textareaRef}
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          rows={1}
          className="w-full resize-none bg-transparent text-sm text-slate-800 dark:text-slate-100 placeholder-slate-400 outline-none leading-relaxed min-h-[44px] max-h-[180px]"
        />

        {/* Toolbar & Actions */}
        <div className="flex items-center justify-between pt-2">
          {/* Left tools: Attachment & Mic */}
          <div className="flex items-center gap-1">
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              multiple
              accept="image/*,application/pdf,text/*,.py,.js,.ts,.html,.css,.json,.md,.csv"
              className="hidden"
            />
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="p-2 rounded-xl text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-[#162822] transition-colors"
              title="Adjuntar imagen, apunte PDF o código"
            >
              <Paperclip className="w-4 h-4" />
            </button>

            <button
              type="button"
              onClick={toggleRecording}
              className={`p-2 rounded-xl transition-colors ${
                isRecording
                  ? 'bg-red-500 text-white animate-pulse'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-[#162822]'
              }`}
              title={isRecording ? 'Detener dictado por voz' : 'Dictar por voz'}
            >
              {isRecording ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
            </button>
          </div>

          {/* Right tools: Shortcut info & Send / Stop */}
          <div className="flex items-center gap-3">
            <span className="hidden sm:inline text-[11px] text-slate-400">
              Presiona <kbd className="px-1 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-[10px] font-mono">Enter ↵</kbd>
            </span>

            {isLoading ? (
              <button
                type="button"
                onClick={onStop}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-red-600 hover:bg-red-500 text-white text-xs font-medium shadow-sm transition-all"
                title="Detener generación"
              >
                <Square className="w-3.5 h-3.5 fill-current" />
                <span>Detener</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={() => handleSubmit()}
                disabled={!canSubmit}
                className={`p-2.5 rounded-xl flex items-center justify-center transition-all ${
                  canSubmit
                    ? 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-sm hover:scale-[1.02] active:scale-[0.98]'
                    : 'bg-slate-100 dark:bg-[#15241f] text-slate-400 dark:text-slate-600 cursor-not-allowed'
                }`}
                title="Enviar mensaje"
              >
                <ArrowUp className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
