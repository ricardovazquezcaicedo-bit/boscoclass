import { GoogleGenAI } from '@google/genai';
import type { IncomingMessage, ServerResponse } from 'http';

export interface ChatFile {
  name: string;
  mimeType: string;
  data: string; // Base64 encoded or data URL
}

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
  files?: ChatFile[];
}

export interface ChatRequestBody {
  messages: ChatMessage[];
  systemInstruction?: string;
  academicLevel?: string;
  teachingTone?: string;
}

const PRIMARY_MODEL = 'gemini-3.1-flash-lite';
const FALLBACK_MODELS = ['gemini-3.8-flash'];

function getAiClient(): GoogleGenAI {
  const apiKey = (process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY || '').trim();
  if (!apiKey) {
    throw new Error('No se encontró GEMINI_API_KEY en las variables de entorno.');
  }
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
}

function convertFileToPart(file: ChatFile) {
  const base64Data = file.data.includes(',') ? file.data.split(',')[1] : file.data;
  const mime = file.mimeType || 'application/octet-stream';

  if (mime.startsWith('image/') || mime === 'application/pdf') {
    return {
      inlineData: {
        mimeType: mime,
        data: base64Data,
      },
    };
  }

  // Text, code, markdown, csv documents
  try {
    const text = Buffer.from(base64Data, 'base64').toString('utf8');
    return {
      text: `\n[Archivo adjunto: ${file.name}]\n\`\`\`\n${text}\n\`\`\`\n`,
    };
  } catch {
    return {
      text: `[Archivo adjunto: ${file.name}]`,
    };
  }
}

export async function handleChatRequest(req: IncomingMessage, res: ServerResponse): Promise<void> {
  const body: ChatRequestBody = (req as any).body;

  if (!body || !body.messages || !Array.isArray(body.messages) || body.messages.length === 0) {
    res.writeHead(400, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: 'No se recibieron mensajes para procesar.' }));
    return;
  }

  let ai: GoogleGenAI;
  try {
    ai = getAiClient();
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Error de configuración de la API.';
    res.writeHead(503, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: message }));
    return;
  }

  // Format contents for Gemini
  const contents = body.messages.map((m) => {
    const parts: any[] = [];
    if (m.content) {
      parts.push({ text: m.content });
    }
    if (m.files && Array.isArray(m.files)) {
      for (const file of m.files) {
        parts.push(convertFileToPart(file));
      }
    }
    return {
      role: m.role === 'assistant' ? 'model' : 'user',
      parts: parts.length > 0 ? parts : [{ text: '...' }],
    };
  });

  const academicLevel = body.academicLevel || 'Bachillerato / Preparatoria';
  const teachingTone = body.teachingTone || 'Didáctico y guiado';
  const customInstruction = body.systemInstruction || '';

  const systemInstruction = `Eres BoscoIA, el asistente educativo y tutor inteligente del Colegio San Juan Bosco (Salesianos de Don Bosco - Tuluá). Tu misión es acompañar y potenciar el aprendizaje del estudiante con claridad didáctica, paciencia, entusiasmo y espíritu formativo salesiano.

Perfil académico:
- Institución: Colegio San Juan Bosco (Salesianos de Don Bosco - Tuluá)
- Nivel académico del estudiante: ${academicLevel}
- Estilo pedagógico: ${teachingTone}
${customInstruction ? `Instrucción adicional del usuario: ${customInstruction}` : ''}

Normas de enseñanza:
1. Explica los conceptos paso a paso con claridad didáctica, descomponiendo problemas difíciles en partes comprensibles.
2. Usa analogías de la vida cotidiana para conceptos abstractos.
3. Formatea la respuesta con Markdown impecable:
   - Títulos y subtítulos limpios (## y ###).
   - Negritas en conceptos clave o definiciones.
   - Listas ordenadas para procedimientos paso a paso.
   - Tablas comparativas cuando haya contrastes.
   - Bloques de código con el lenguaje especificado (\`\`\`python, \`\`\`javascript, etc.).
4. Notación matemática avanzada de libro de texto:
   - SIEMPRE que haya fracciones o divisiones algebraicas, usa la notación LaTeX $\\frac{numerador}{denominador}$ o en bloque $$\\frac{x - 1}{2}$$. NUNCA uses texto plano como (x - 1)/2 o a/b en pasos matemáticos.
   - Para ecuaciones algebraicas, potencias, polinomios, raíces o fórmulas, usa LaTeX delimitado por $...$ (en línea, ej. $6x^2 + 12x - 18$, $\\frac{x - 1}{2}$) o $$...$$ (en bloque centrado, ej. $$x = \\frac{-b \\pm \\sqrt{b^2 - 4ac}}{2a}$$).
   - Para números ordinarios, conteos, viñetas de listas o preguntas (ej. "Pregunta 1", "sumar 7", "3 manzanas"), escribe los números limpios SIN signos de dólar ($).
5. Si el estudiante envía un ejercicio o tarea, NO des únicamente la respuesta final de golpe; guía el razonamiento paso a paso para que comprenda el procedimiento.
6. Sé siempre paciente, respetuoso, motivador y didáctico.
7. Creación de imágenes e ilustraciones didácticas generadas por IA directamente en el chat (como Gemini o ChatGPT):
   - Cuando el usuario te pida crear, generar, dibujar, ilustrar o ver una imagen o diagrama (ejemplo: "crea una imagen de...", "genera una imagen de una celula eucariota y procariota", "dibuja un dinosaurio", "muéstrame un átomo"):
   - DEBES generar e insertar la imagen creada por IA directamente en el chat usando la etiqueta Markdown:
     ![Descripción del concepto](/api/educational-image?q=termino_detallado_3d_render)
     (Reemplaza los espacios con signos +; por ejemplo: ![Célula Eucariota y Procariota](/api/educational-image?q=eukaryotic+and+prokaryotic+cell+detailed+3d+scientific+render), ![San Juan Bosco](/api/educational-image?q=san+juan+bosco+portrait+oil+painting+salesian+turin), ![Dinosaurio Rex](/api/educational-image?q=tyrannosaurus+rex+dinosaur+photorealistic+3d+render)).
   - Las imágenes deben ser SIEMPRE de máxima calidad fotorrealista o render 3D detallado (estilo ChatGPT y Gemini). NUNCA uses enlaces de Wikipedia ni diagramas vectoriales simples.
   - Acompaña SIEMPRE la imagen creada con una explicación didáctica detallada de cada una de sus partes, orgánulos o componentes, guiando al estudiante paso a paso.`;

  // Start SSE stream
  res.writeHead(200, {
    'Content-Type': 'text/event-stream; charset=utf-8',
    'Cache-Control': 'no-cache, no-transform',
    'Connection': 'keep-alive',
    'X-Accel-Buffering': 'no',
  });

  const modelsToTry = [PRIMARY_MODEL, ...FALLBACK_MODELS];
  let streamStarted = false;

  for (const model of modelsToTry) {
    try {
      const responseStream = await ai.models.generateContentStream({
        model,
        contents,
        config: {
          systemInstruction,
        },
      });

      for await (const chunk of responseStream) {
        const text = chunk.text;
        if (text) {
          streamStarted = true;
          res.write(`data: ${JSON.stringify({ delta: text })}\n\n`);
        }
      }

      res.write('data: [DONE]\n\n');
      res.end();
      return;
    } catch (err: any) {
      console.warn(`Error con modelo ${model}:`, err?.message || err);
      if (streamStarted) {
        res.write(`data: ${JSON.stringify({ error: 'La respuesta se interrumpió antes de completarse.' })}\n\n`);
        res.end();
        return;
      }
    }
  }

  // If all models failed
  res.write(
    `data: ${JSON.stringify({
      error: 'El servicio de IA está experimentando alta demanda momentáneamente. Por favor, intenta de nuevo en unos segundos.',
    })}\n\n`
  );
  res.end();
}

export interface TtsRequestBody {
  text: string;
  voiceName?: 'Kore' | 'Puck' | 'Charon' | 'Fenrir' | 'Zephyr';
  style?: string;
}

export async function handleTtsRequest(req: IncomingMessage, res: ServerResponse): Promise<void> {
  const body: TtsRequestBody = (req as any).body;
  if (!body || !body.text || typeof body.text !== 'string') {
    res.writeHead(400, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: 'Texto requerido para síntesis de voz.' }));
    return;
  }

  // Clean text before sending to speech synthesis so it sounds like a human tutor
  const cleanText = body.text
    .slice(0, 1200)
    .replace(/!\[[^\]]*\]\([^)]+\)/g, '') // remove images
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1') // keep link text only
    .replace(/```[\s\S]*?```/g, ' [código omitido] ') // code blocks
    .replace(/`([^`]+)`/g, '$1') // inline code
    .replace(/\\frac\{([^}]+)\}\{([^}]+)\}/g, '$1 sobre $2') // convert fractions to Spanish words
    .replace(/\$\$[\s\S]*?\$\$/g, (m) => m.replace(/\$\$/g, '').replace(/\\frac\{([^}]+)\}\{([^}]+)\}/g, '$1 sobre $2').replace(/\\[a-zA-Z]+/g, ' '))
    .replace(/\$([^$]+)\$/g, (m) => m.replace(/\$/g, '').replace(/\\frac\{([^}]+)\}\{([^}]+)\}/g, '$1 sobre $2').replace(/\\[a-zA-Z]+/g, ' '))
    .replace(/\\times/g, ' por ')
    .replace(/\\div/g, ' dividido entre ')
    .replace(/\\pm/g, ' más o menos ')
    .replace(/\\sqrt\{([^}]+)\}/g, ' raíz cuadrada de $1 ')
    .replace(/\\le/g, ' menor o igual a ')
    .replace(/\\ge/g, ' mayor o igual a ')
    .replace(/\\neq/g, ' diferente de ')
    .replace(/\\[a-zA-Z]+/g, ' ')
    .replace(/[#*`_~|]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

  if (!cleanText) {
    res.writeHead(400, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: 'Texto vacío tras limpieza.' }));
    return;
  }

  let ai: GoogleGenAI;
  try {
    ai = getAiClient();
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Error de configuración de la API.';
    res.writeHead(503, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: message }));
    return;
  }

  const voiceName = body.voiceName || 'Kore';
  const stylePrompt = body.style || 'Voz natural, cálida, expresiva y fluida en español latinoamericano para un tutor escolar atento y paciente.';

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash-lite-tts',
      contents: cleanText,
      config: {
        responseModalities: ['AUDIO'],
        speechConfig: {
          voiceConfig: {
            prebuiltVoiceConfig: { voiceName },
          },
        },
      },
    });

    const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
    if (base64Audio) {
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ success: true, audioBase64: base64Audio, mimeType: 'audio/wav', voiceName }));
      return;
    }

    res.writeHead(500, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: 'No se generó audio en la respuesta del modelo.' }));
  } catch (err: any) {
    console.warn('Gemini TTS error:', err?.message || err);
    res.writeHead(500, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: err?.message || 'Error en síntesis de voz.' }));
  }
}

