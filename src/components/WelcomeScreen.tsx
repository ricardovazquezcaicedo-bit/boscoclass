import React, { useState } from 'react';
import {
  Sparkles,
  Atom,
  Calculator,
  Compass,
  Code,
  PenTool,
  Languages,
  BookMarked,
  Lightbulb,
  CheckCircle2,
  FileText,
} from 'lucide-react';
import { UserConfig } from '../types';

interface WelcomeScreenProps {
  config: UserConfig;
  onSelectPrompt: (promptText: string) => void;
}

interface SubjectItem {
  name: string;
  icon: React.ReactNode;
  color: string;
  prompts: string[];
}

export const WelcomeScreen: React.FC<WelcomeScreenProps> = ({ config, onSelectPrompt }) => {
  const [selectedSubject, setSelectedSubject] = useState<number>(0);

  const subjects: SubjectItem[] = [
    {
      name: 'Ciencias Naturales',
      icon: <Atom className="w-4 h-4 text-emerald-500" />,
      color: 'emerald',
      prompts: [
        'Explica la fotosíntesis con una analogía sencilla y cotidiana',
        '¿Cómo funciona la respiración celular y por qué necesitamos oxígeno?',
        'Explica la diferencia entre mitosis y meiosis paso a paso',
        '¿Por qué el cielo es azul durante el día y naranja al atardecer?',
      ],
    },
    {
      name: 'Matemáticas y Física',
      icon: <Calculator className="w-4 h-4 text-cyan-500" />,
      color: 'cyan',
      prompts: [
        '¿Cómo entender la derivada intuitivamente sin memorizar fórmulas?',
        'Explica el teorema de Pitágoras y cómo se aplica en la vida real',
        'Resuelve paso a paso: ¿Cómo calcular la velocidad final de un objeto en caída libre?',
        '¿Qué es un número imaginario y para qué sirve en física o ingeniería?',
      ],
    },
    {
      name: 'Historia y Humanidades',
      icon: <Compass className="w-4 h-4 text-amber-500" />,
      color: 'amber',
      prompts: [
        '¿Cuáles fueron las causas y consecuencias principales de la Revolución Francesa?',
        'Explica el mito de la caverna de Platón y su lección filosófica',
        'Línea de tiempo de la Segunda Guerra Mundial explicada de forma clara',
        '¿Cómo influyó la invención de la imprenta en la difusión del conocimiento?',
      ],
    },
    {
      name: 'Programación y Lógica',
      icon: <Code className="w-4 h-4 text-indigo-500" />,
      color: 'indigo',
      prompts: [
        'Explica la recursividad en programación con un ejemplo en Python',
        '¿Cuál es la diferencia entre un array y una lista enlazada?',
        '¿Cómo funciona una consulta SQL con JOIN explicada con diagramas de Venn?',
        'Explica el concepto de Programación Orientada a Objetos para principiantes',
      ],
    },
    {
      name: 'Redacción y Análisis',
      icon: <PenTool className="w-4 h-4 text-rose-500" />,
      color: 'rose',
      prompts: [
        'Ayúdame a redactar una introducción persuasiva para un ensayo académico',
        '¿Cuáles son las principales figuras retóricas con ejemplos literarios?',
        'Dame pautas para mejorar la coherencia y cohesión en un texto argumentativo',
        'Escribe un poema didáctico sobre las leyes del universo',
      ],
    },
    {
      name: 'Idiomas',
      icon: <Languages className="w-4 h-4 text-teal-500" />,
      color: 'teal',
      prompts: [
        'Explica cuándo usar "Past Simple" vs "Present Perfect" en inglés con ejemplos',
        'Genera un diálogo en inglés para practicar pedir comida en un restaurante',
        'Explica los falsos cognados ("false friends") más comunes en inglés',
        'Corrige este párrafo y explícame los errores gramaticales cometidos',
      ],
    },
  ];

  const studyModes = [
    {
      title: 'Explicación Paso a Paso',
      desc: 'Descompone temas complejos en etapas didácticas sencillas.',
      icon: <CheckCircle2 className="w-4 h-4 text-emerald-500" />,
      prompt: 'Explícame paso a paso y con ejemplos prácticos cómo ',
    },
    {
      title: 'Analogía Intuitiva',
      desc: 'Comprende conceptos abstractos relacionándolos con la vida diaria.',
      icon: <Lightbulb className="w-4 h-4 text-amber-500" />,
      prompt: 'Explica el siguiente concepto usando una analogía cotidiana y visual: ',
    },
    {
      title: 'Cuestionario de Práctica (Quiz)',
      desc: 'Ponte a prueba con preguntas tipo examen comentadas.',
      icon: <BookMarked className="w-4 h-4 text-indigo-500" />,
      prompt: 'Crea un mini-quiz de 3 preguntas de opción múltiple con respuestas y explicaciones didácticas sobre: ',
    },
    {
      title: 'Resumir y Sintetizar Apuntes',
      desc: 'Extrae ideas clave, tablas y conclusiones de tus notas.',
      icon: <FileText className="w-4 h-4 text-teal-500" />,
      prompt: 'Ayúdame a resumir este tema en 5 puntos clave, conceptos esenciales y una conclusión: ',
    },
    {
      title: 'Generar Ilustración con IA',
      desc: 'Pide a la IA que dibuje diagramas, células, esquemas y conceptos visuales.',
      icon: <Sparkles className="w-4 h-4 text-emerald-500" />,
      prompt: 'Genera una imagen didáctica detallada y explícame sus partes paso a paso sobre: ',
    },
  ];

  return (
    <div className="w-full max-w-4xl mx-auto px-4 py-8 md:py-12 space-y-8 animate-in fade-in duration-300">
      {/* Hero Welcome */}
      <div className="text-center space-y-3">
        <div className="inline-block p-3 sm:p-4 rounded-2xl bg-white dark:bg-[#101c18] border border-slate-200 dark:border-[#1d332a] shadow-sm mb-1">
          <img
            src="/assets/aistudio/image_c159dc3e.png"
            alt="Colegio San Juan Bosco - Salesianos de Don Bosco Tuluá"
            className="h-16 w-16 sm:h-20 sm:w-20 object-contain mx-auto"
          />
        </div>
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium bg-emerald-500/10 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 border border-emerald-500/20">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Tutor Académico Oficial · Colegio San Juan Bosco · {config.academicLevel}</span>
          </div>
        </div>
        <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-slate-900 dark:text-emerald-50">
          ¿En qué puedo ayudarte hoy, {config.username}?
        </h1>
        <p className="text-sm text-slate-600 dark:text-slate-400 max-w-xl mx-auto">
          Explora materias, resuelve dudas con explicaciones paso a paso, analiza tus apuntes o practica para tus exámenes.
        </p>
      </div>

      {/* Quick Study Modes */}
      <div className="space-y-3">
        <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 px-1">
          Modos de Estudio Rápidos
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {studyModes.map((mode, i) => (
            <button
              key={i}
              onClick={() => onSelectPrompt(mode.prompt)}
              className="flex flex-col text-left p-3.5 rounded-xl border border-slate-200 dark:border-[#1a2e26] bg-white dark:bg-[#101c18] hover:border-emerald-500/50 dark:hover:border-emerald-500/50 hover:shadow-md transition-all group"
            >
              <div className="flex items-center gap-2 mb-2">
                <div className="p-1.5 rounded-lg bg-slate-100 dark:bg-[#162722] group-hover:bg-emerald-500/10 transition-colors">
                  {mode.icon}
                </div>
                <span className="text-xs font-semibold text-slate-800 dark:text-slate-200 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                  {mode.title}
                </span>
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
                {mode.desc}
              </p>
            </button>
          ))}
        </div>
      </div>

      {/* Subject Browser */}
      <div className="space-y-3">
        <div className="flex items-center justify-between px-1">
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
            Preguntas Frecuentes por Materia
          </h2>
          <span className="text-[11px] text-slate-400">Haz clic para consultar</span>
        </div>

        {/* Subject selector tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
          {subjects.map((sub, idx) => (
            <button
              key={idx}
              onClick={() => setSelectedSubject(idx)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all ${
                selectedSubject === idx
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'bg-white dark:bg-[#111f1a] text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-[#1c3028] hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              {sub.icon}
              <span>{sub.name}</span>
            </button>
          ))}
        </div>

        {/* Selected subject prompt cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
          {subjects[selectedSubject].prompts.map((prompt, pIdx) => (
            <button
              key={pIdx}
              onClick={() => onSelectPrompt(prompt)}
              className="text-left p-3 rounded-xl border border-slate-200 dark:border-[#1a2e26] bg-white dark:bg-[#101c18] hover:bg-slate-50 dark:hover:bg-[#14241f] hover:border-emerald-500/40 text-xs text-slate-700 dark:text-slate-300 transition-all flex items-start gap-2.5 group"
            >
              <span className="text-emerald-500 dark:text-emerald-400 mt-0.5 font-bold">›</span>
              <span className="group-hover:text-emerald-700 dark:group-hover:text-emerald-300 transition-colors">
                {prompt}
              </span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
