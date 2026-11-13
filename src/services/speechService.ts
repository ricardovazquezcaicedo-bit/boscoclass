// Voice and Speech Synthesis Service for BoscoIA
// Integrates Gemini Studio Neural TTS (gemini-3.8-flash-lite-tts) with curated browser fallbacks

export interface GeminiVoiceOption {
  id: string;
  name: string;
  gender: 'female' | 'male';
  tone: string;
  description: string;
  recommended?: boolean;
}

export const GEMINI_VOICES: GeminiVoiceOption[] = [
  {
    id: 'Kore',
    name: 'Kore (Voz Femenina Cálida)',
    gender: 'female',
    tone: 'Cálida, empática y pedagógica',
    description: 'Voz humana con dicción clara ideal para tutoría y explicaciones paso a paso.',
    recommended: true,
  },
  {
    id: 'Puck',
    name: 'Puck (Voz Masculina Juvenil)',
    gender: 'male',
    tone: 'Dinámico, alegre y cercano',
    description: 'Voz juvenil y motivadora ideal para dinámicas escolares y explicaciones amenas.',
  },
  {
    id: 'Zephyr',
    name: 'Zephyr (Voz Femenina Serena)',
    gender: 'female',
    tone: 'Serena, paciente y reflexiva',
    description: 'Tono pausado y tranquilizador para lecturas analíticas y conceptos profundos.',
  },
  {
    id: 'Charon',
    name: 'Charon (Voz Masculina Académica)',
    gender: 'male',
    tone: 'Formal, profundo y riguroso',
    description: 'Voz con resonancia académica para ciencias exactas, debates e historia.',
  },
  {
    id: 'Fenrir',
    name: 'Fenrir (Voz Masculina Profunda)',
    gender: 'male',
    tone: 'Enérgico y rotundo',
    description: 'Tono masculino firme para instrucciones claras y resúmenes estructurados.',
  },
];

export interface SpokenVoiceConfig {
  voiceEngine?: 'gemini' | 'browser';
  voiceName?: string;
  voiceSpeed?: number;
  voicePitch?: number;
}

export interface SpeakOptions extends SpokenVoiceConfig {
  text: string;
  id?: string;
  onStart?: () => void;
  onEnd?: () => void;
  onError?: (error: any) => void;
}

// Global active audio state
let currentAudio: HTMLAudioElement | null = null;
let currentUtterance: SpeechSynthesisUtterance | null = null;
let currentActiveId: string | null = null;

export function cleanTextForSpeech(rawText: string): string {
  if (!rawText) return '';

  return rawText
    // Remove image markups like ![alt](url)
    .replace(/!\[[^\]]*\]\([^)]+\)/g, '')
    // Remove links but keep anchor text [link](url) -> link
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
    // Remove code blocks
    .replace(/```[\s\S]*?```/g, ' Código omitido para la lectura en voz alta. ')
    // Replace inline code `x` -> x
    .replace(/`([^`]+)`/g, '$1')
    // Replace LaTeX fraction notation \frac{a}{b} -> a sobre b
    .replace(/\\frac\{([^}]+)\}\{([^}]+)\}/g, '$1 sobre $2')
    // Replace LaTeX square root \sqrt{x} -> raíz de x
    .replace(/\\sqrt\{([^}]+)\}/g, 'raíz cuadrada de $1')
    // LaTeX math symbols
    .replace(/\\times/g, ' por ')
    .replace(/\\cdot/g, ' por ')
    .replace(/\\div/g, ' dividido entre ')
    .replace(/\\pm/g, ' más o menos ')
    .replace(/\\le/g, ' menor o igual a ')
    .replace(/\\ge/g, ' mayor o igual a ')
    .replace(/\\neq/g, ' diferente de ')
    .replace(/\\approx/g, ' aproximadamente igual a ')
    .replace(/\\infty/g, ' infinito ')
    .replace(/\\pi/g, ' pi ')
    // Strip block and inline LaTeX delimiters $$ and $
    .replace(/\$\$[\s\S]*?\$\$/g, (m) => m.replace(/\$\$/g, '').replace(/\\frac\{([^}]+)\}\{([^}]+)\}/g, '$1 sobre $2').replace(/\\[a-zA-Z]+/g, ' '))
    .replace(/\$([^$]+)\$/g, (m) => m.replace(/\$/g, '').replace(/\\frac\{([^}]+)\}\{([^}]+)\}/g, '$1 sobre $2').replace(/\\[a-zA-Z]+/g, ' '))
    // Remove other LaTeX command slashes
    .replace(/\\[a-zA-Z]+/g, ' ')
    // Remove headers, bold, italics, strikethrough, blockquotes
    .replace(/^[#>\s-]+/gm, '')
    .replace(/[*_~`]/g, '')
    // Remove excessive whitespace
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Get available browser Spanish voices, sorted by quality
 */
export function getBrowserSpanishVoices(): SpeechSynthesisVoice[] {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
    return [];
  }

  const allVoices = window.speechSynthesis.getVoices() || [];
  const spanish = allVoices.filter(
    (v) => v.lang.toLowerCase().startsWith('es') || v.lang.toLowerCase().includes('es-')
  );

  // Sort natural/neural and Google/Microsoft/Apple voices first
  return spanish.sort((a, b) => {
    const isNaturalA = /natural|neural|google|microsoft|apple|online/i.test(a.name);
    const isNaturalB = /natural|neural|google|microsoft|apple|online/i.test(b.name);
    if (isNaturalA && !isNaturalB) return -1;
    if (!isNaturalA && isNaturalB) return 1;
    return a.name.localeCompare(b.name);
  });
}

/**
 * Stop any current speech playback
 */
export function stopSpeech(): void {
  if (currentAudio) {
    try {
      currentAudio.pause();
      currentAudio.currentTime = 0;
      currentAudio.src = '';
    } catch {}
    currentAudio = null;
  }

  if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
    try {
      window.speechSynthesis.cancel();
    } catch {}
  }
  currentUtterance = null;
  currentActiveId = null;
}

/**
 * Get ID of currently speaking message (if any)
 */
export function getCurrentSpeakingId(): string | null {
  return currentActiveId;
}

/**
 * Fallback to browser Web Speech API with properly picked Spanish voice
 */
function speakWithBrowserSynth(options: SpeakOptions, cleanText: string): void {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
    options.onError?.(new Error('Síntesis de voz no disponible en este navegador.'));
    return;
  }

  window.speechSynthesis.cancel();

  const utterance = new SpeechSynthesisUtterance(cleanText);
  utterance.lang = 'es-ES';
  utterance.rate = options.voiceSpeed ?? 1.0;
  utterance.pitch = options.voicePitch ?? 1.0;

  // Find preferred voice
  const spanishVoices = getBrowserSpanishVoices();
  if (options.voiceName) {
    const matched = spanishVoices.find((v) => v.name === options.voiceName);
    if (matched) {
      utterance.voice = matched;
    }
  }

  if (!utterance.voice && spanishVoices.length > 0) {
    utterance.voice = spanishVoices[0];
  }

  currentActiveId = options.id || 'preview';
  currentUtterance = utterance;

  utterance.onstart = () => {
    options.onStart?.();
  };

  utterance.onend = () => {
    if (currentActiveId === (options.id || 'preview')) {
      currentActiveId = null;
    }
    currentUtterance = null;
    options.onEnd?.();
  };

  utterance.onerror = (e) => {
    if (currentActiveId === (options.id || 'preview')) {
      currentActiveId = null;
    }
    currentUtterance = null;
    options.onError?.(e);
  };

  window.speechSynthesis.speak(utterance);
}

/**
 * Speak text using Gemini Neural TTS or browser fallback
 */
export async function speakText(options: SpeakOptions): Promise<void> {
  stopSpeech();

  const cleanText = cleanTextForSpeech(options.text);
  if (!cleanText) {
    options.onError?.(new Error('No hay texto legible para reproducir.'));
    return;
  }

  const engine = options.voiceEngine ?? 'gemini';
  const voiceName = options.voiceName || 'Kore';
  const speed = options.voiceSpeed ?? 1.0;

  // Direct browser synthesis if requested
  if (engine === 'browser') {
    speakWithBrowserSynth(options, cleanText);
    return;
  }

  // Gemini Neural TTS (Natural Studio Quality)
  currentActiveId = options.id || 'preview';
  options.onStart?.();

  try {
    const res = await fetch('/api/tts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        text: cleanText.slice(0, 1500),
        voiceName: voiceName,
        style: 'Voz natural, didáctica, cálida y paciente en español latinoamericano para un tutor salesiano del Colegio San Juan Bosco.',
      }),
    });

    if (!res.ok) {
      throw new Error(`Servicio de voz neural respondió con error HTTP ${res.status}`);
    }

    const data = await res.json();
    if (!data.success || !data.audioBase64) {
      throw new Error(data.error || 'No se recibió audio válido');
    }

    const audioUrl = `data:${data.mimeType || 'audio/wav'};base64,${data.audioBase64}`;
    const audio = new Audio(audioUrl);
    currentAudio = audio;
    audio.playbackRate = Math.max(0.75, Math.min(1.5, speed));

    audio.onended = () => {
      if (currentActiveId === (options.id || 'preview')) {
        currentActiveId = null;
      }
      currentAudio = null;
      options.onEnd?.();
    };

    audio.onerror = (e) => {
      console.warn('Error reproduciendo audio neural, intentando síntesis de navegador:', e);
      speakWithBrowserSynth(options, cleanText);
    };

    await audio.play();
  } catch (err) {
    console.warn('Fallo Gemini TTS, usando voz natural del navegador:', err);
    speakWithBrowserSynth(options, cleanText);
  }
}

/**
 * Play a short pleasant test sample of the selected voice
 */
export function previewVoice(config: SpokenVoiceConfig, onEndCallback?: () => void): void {
  const sample = '¡Hola! Soy BoscoIA, tu tutor inteligente del Colegio San Juan Bosco. Con esta voz te acompañaré a aprender paso a paso.';
  speakText({
    text: sample,
    id: 'voice_preview',
    voiceEngine: config.voiceEngine ?? 'gemini',
    voiceName: config.voiceName ?? 'Kore',
    voiceSpeed: config.voiceSpeed ?? 1.0,
    voicePitch: config.voicePitch ?? 1.0,
    onEnd: onEndCallback,
    onError: () => onEndCallback?.(),
  });
}
