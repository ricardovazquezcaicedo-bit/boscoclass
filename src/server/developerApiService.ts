import { GoogleGenAI } from '@google/genai';
import type { IncomingMessage, ServerResponse } from 'http';

const PRIMARY_MODEL = 'gemini-3.1-flash-lite';
const FALLBACK_MODELS = ['gemini-3.8-flash'];

function getAiClient(): GoogleGenAI {
  const apiKey = (process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY || '').trim();
  if (!apiKey) {
    throw new Error('No se encontró GEMINI_API_KEY en el servidor.');
  }
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build-dev-api',
      },
    },
  });
}

export function setCorsHeaders(res: ServerResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, x-api-key, X-Requested-With');
}

export interface DeveloperApiRequestBody {
  message?: string;
  messages?: Array<{ role: 'user' | 'assistant'; content: string }>;
  stream?: boolean;
  academicLevel?: string;
  teachingTone?: string;
  institutionName?: string;
  customInstruction?: string;
}

export async function handleDeveloperApiChat(req: IncomingMessage, res: ServerResponse): Promise<void> {
  setCorsHeaders(res);

  if (req.method === 'OPTIONS') {
    res.writeHead(204);
    res.end();
    return;
  }

  const body: DeveloperApiRequestBody = (req as any).body || {};

  // Extract auth key for logging / validation (accepts Bearer or x-api-key or query param)
  const authHeader = req.headers['authorization'] || '';
  const xApiKey = req.headers['x-api-key'] || '';
  const urlParams = new URL(req.url || '', 'http://localhost').searchParams;
  const providedKey = (typeof xApiKey === 'string' && xApiKey) || (typeof authHeader === 'string' && authHeader.replace(/^Bearer\s+/i, '')) || urlParams.get('api_key') || 'anonymous_dev';

  // Normalize messages
  let messagesPayload: Array<{ role: 'user' | 'assistant'; content: string }> = [];
  if (Array.isArray(body.messages) && body.messages.length > 0) {
    messagesPayload = body.messages;
  } else if (body.message && typeof body.message === 'string') {
    messagesPayload = [{ role: 'user', content: body.message }];
  } else {
    res.writeHead(400, { 'Content-Type': 'application/json' });
    res.end(
      JSON.stringify({
        error: 'Petición inválida. Debes enviar "message" (string) o "messages" (array de mensajes).',
        example: {
          message: '¿Cómo factorizo 6x^2 + 12x - 18?',
          academicLevel: 'Secundaria / Bachillerato',
          stream: false,
        },
      })
    );
    return;
  }

  let ai: GoogleGenAI;
  try {
    ai = getAiClient();
  } catch (err: any) {
    res.writeHead(503, { 'Content-Type': 'application/json' });
    res.end(
      JSON.stringify({
        error: err?.message || 'Error inicializando el motor de IA.',
      })
    );
    return;
  }

  const institutionName = body.institutionName || 'Colegio San Juan Bosco';
  const academicLevel = body.academicLevel || 'Bachillerato / Preparatoria';
  const teachingTone = body.teachingTone || 'Didáctico, paso a paso y guiado';
  const customInstruction = body.customInstruction || '';

  const systemInstruction = `Eres el asistente de IA y tutor inteligente integrado para "${institutionName}". Tu misión es acompañar y resolver dudas con pedagogía, claridad didáctica, paciencia y rigor académico.

Configuración de la integración:
- Institución: ${institutionName}
- Nivel Académico: ${academicLevel}
- Estilo Pedagógico: ${teachingTone}
${customInstruction ? `- Rúbrica / Instrucción personalizada: ${customInstruction}` : ''}

Normas de respuesta para la aplicación externa:
1. Explica los conceptos paso a paso con claridad didáctica.
2. Si el usuario solicita un ejercicio matemático, SIEMPRE usa notación LaTeX para fórmulas y fracciones algebraicas (ej. $\\frac{a}{b}$ o $$\\frac{x - 1}{2}$$).
3. No des únicamente el resultado directo si se trata de un problema escolar; guía con pistas y razonamiento estructurado.
4. Usa Markdown limpio para títulos, listas y tablas.`;

  const contents = messagesPayload.map((m) => ({
    role: m.role === 'assistant' ? 'model' : 'user',
    parts: [{ text: m.content || '...' }],
  }));

  const shouldStream = Boolean(body.stream);

  if (shouldStream) {
    // Server-Sent Events Streaming Mode
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
        const stream = await ai.models.generateContentStream({
          model,
          contents,
          config: {
            systemInstruction,
          },
        });

        for await (const chunk of stream) {
          if (chunk.text) {
            streamStarted = true;
            res.write(`data: ${JSON.stringify({ delta: chunk.text })}\n\n`);
          }
        }

        res.write('data: [DONE]\n\n');
        res.end();
        return;
      } catch (err: any) {
        console.warn(`[DevAPI Stream] Error con modelo ${model}:`, err?.message || err);
        if (streamStarted) {
          res.write(`data: ${JSON.stringify({ error: 'Flujo interrumpido.' })}\n\n`);
          res.end();
          return;
        }
      }
    }

    res.write(`data: ${JSON.stringify({ error: 'Servicio de IA saturado temporalmente.' })}\n\n`);
    res.end();
  } else {
    // Standard Synchronous JSON Response Mode (most common for external apps)
    const modelsToTry = [PRIMARY_MODEL, ...FALLBACK_MODELS];

    for (const model of modelsToTry) {
      try {
        const response = await ai.models.generateContent({
          model,
          contents,
          config: {
            systemInstruction,
          },
        });

        const replyText = response.text || '';

        res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
        res.end(
          JSON.stringify({
            success: true,
            response: replyText,
            model,
            authenticatedAs: providedKey.slice(0, 10) + '...',
            timestamp: Date.now(),
            metadata: {
              institution: institutionName,
              academicLevel,
            },
          })
        );
        return;
      } catch (err: any) {
        console.warn(`[DevAPI Sync] Error con modelo ${model}:`, err?.message || err);
      }
    }

    res.writeHead(500, { 'Content-Type': 'application/json' });
    res.end(
      JSON.stringify({
        success: false,
        error: 'No se pudo generar la respuesta desde el motor de IA.',
      })
    );
  }
}

export async function handleWebhookTest(req: IncomingMessage, res: ServerResponse): Promise<void> {
  setCorsHeaders(res);

  if (req.method === 'OPTIONS') {
    res.writeHead(204);
    res.end();
    return;
  }

  const body = (req as any).body || {};
  const { webhookUrl, eventType = 'test.ping', samplePayload } = body;

  if (!webhookUrl || typeof webhookUrl !== 'string' || !webhookUrl.startsWith('http')) {
    res.writeHead(400, { 'Content-Type': 'application/json' });
    res.end(
      JSON.stringify({
        success: false,
        error: 'Debes proporcionar una URL válida que empiece por http:// o https://',
      })
    );
    return;
  }

  const payloadToSend = {
    event: eventType,
    timestamp: new Date().toISOString(),
    source: 'BoscoIA-Developer-Gateway',
    data: samplePayload || {
      studentId: 'usr_dev_1001',
      studentName: 'Estudiante de Prueba',
      academicLevel: 'Bachillerato',
      eventDetails: 'Prueba de conexión exitosa entre BoscoIA y tu aplicación externa.',
      scoreOrXp: 50,
    },
  };

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 8000);

    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'BoscoIA-Webhook-Dispatcher/1.0',
        'X-Bosco-Event': eventType,
      },
      body: JSON.stringify(payloadToSend),
      signal: controller.signal,
    });

    clearTimeout(timeout);

    let responseBody = '';
    try {
      responseBody = await response.text();
    } catch {}

    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(
      JSON.stringify({
        success: response.ok,
        statusCode: response.status,
        statusText: response.statusText,
        deliveredPayload: payloadToSend,
        targetResponsePreview: responseBody.slice(0, 300),
      })
    );
  } catch (err: any) {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(
      JSON.stringify({
        success: false,
        error: `No se pudo conectar a la URL indicada: ${err?.message || 'Error de red / Timeout'}`,
        suggestion: 'Asegúrate de que la URL de tu otra app sea accesible públicamente o esté escuchando peticiones POST.',
      })
    );
  }
}
