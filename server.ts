import 'dotenv/config';
import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { handleChatRequest, handleTtsRequest } from './src/server/geminiService.ts';
import {
  handleDeveloperApiChat,
  handleWebhookTest,
  setCorsHeaders,
} from './src/server/developerApiService.ts';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = Number(process.env.PORT) || 3000;
const HOST = process.env.HOST || '0.0.0.0';

// Enable JSON body parsing for requests up to 25MB (for attachments & prompts)
app.use(express.json({ limit: '25mb' }));

// CORS for /api/* routes
app.use('/api', (req, res, next) => {
  setCorsHeaders(res);
  if (req.method === 'OPTIONS') {
    res.sendStatus(204);
    return;
  }
  next();
});

app.post('/api/tts', async (req, res) => {
  try {
    await handleTtsRequest(req, res);
  } catch (err: unknown) {
    if (!res.headersSent) {
      const message = err instanceof Error ? err.message : 'Error en síntesis de voz';
      res.status(500).json({ error: message });
    }
  }
});

app.post('/api/chat', async (req, res) => {
  try {
    await handleChatRequest(req, res);
  } catch (err: unknown) {
    if (!res.headersSent) {
      const message = err instanceof Error ? err.message : 'Error interno';
      res.status(500).json({ error: message });
    }
  }
});

app.post(['/api/v1/chat', '/api/v1/ask'], async (req, res) => {
  try {
    await handleDeveloperApiChat(req, res);
  } catch (err: unknown) {
    if (!res.headersSent) {
      const message = err instanceof Error ? err.message : 'Error en API para desarrolladores';
      res.status(500).json({ error: message });
    }
  }
});

app.post('/api/v1/webhook/test', async (req, res) => {
  try {
    await handleWebhookTest(req, res);
  } catch (err: unknown) {
    if (!res.headersSent) {
      const message = err instanceof Error ? err.message : 'Error probando webhook';
      res.status(500).json({ error: message });
    }
  }
});

app.get('/api/health', (_req, res) => {
  const hasKey = Boolean(process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY);
  res.json({ ready: hasKey, model: 'gemini-3.1-flash-lite', developerApi: 'enabled' });
});

// Educational Image Resolver Endpoint (direct AI creation)
app.get('/api/educational-image', async (req, res) => {
  const query = String(req.query.q || req.query.query || '').trim();
  if (!query) {
    return res.status(400).json({ error: 'Parámetro q requerido' });
  }

  const { createAiImage } = await import('./src/server/imageCreationService.ts');
  const result = await createAiImage(query);

  if (req.headers.accept?.includes('application/json') || req.query.format === 'json') {
    return res.json({ success: true, ...result });
  }

  if (result.imageUrl.startsWith('data:image/svg+xml')) {
    const rawSvg = decodeURIComponent(result.imageUrl.replace('data:image/svg+xml;utf8,', ''));
    res.setHeader('Content-Type', 'image/svg+xml; charset=utf-8');
    res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
    return res.send(rawSvg);
  }

  if (result.imageUrl.startsWith('data:image/')) {
    const matches = result.imageUrl.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
    if (matches && matches.length === 3) {
      const mimeType = matches[1];
      const buffer = Buffer.from(matches[2], 'base64');
      res.setHeader('Content-Type', mimeType);
      res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
      return res.send(buffer);
    }
  }

  // Fallback redirect
  res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
  return res.redirect(302, result.imageUrl);
});

// Image Generation & Visual Concept API
app.post('/api/generate-image', async (req, res) => {
  const { prompt } = req.body || {};
  if (!prompt || typeof prompt !== 'string') {
    return res.status(400).json({ error: 'Prompt requerido' });
  }

  const { createAiImage } = await import('./src/server/imageCreationService.ts');
  const result = await createAiImage(prompt);
  return res.json({
    success: true,
    imageUrl: result.imageUrl,
    title: result.title,
    description: result.description,
    source: result.source,
  });
});

// ClassPoint Presence Route
const activeUsers = new Map<string, { usuario: string; nombre: string; rol: string; institucion: string; lastSeen: number }>();

app.post('/api/presence', (req, res) => {
  const { usuario, nombre, rol, institucion } = req.body || {};
  if (usuario) {
    activeUsers.set(usuario, { usuario, nombre, rol, institucion, lastSeen: Date.now() });
  }
  res.json({ ok: true });
});

app.get('/api/presence', (_req, res) => {
  const cutoff = Date.now() - 120000;
  const list = Array.from(activeUsers.values()).filter((u) => u.lastSeen > cutoff);
  res.json({ total: list.length, personas: list });
});

// Serve frontend dist
const distPath = path.join(__dirname, 'dist');
app.use(express.static(distPath));

app.get('*', (_req, res) => {
  res.sendFile(path.join(distPath, 'index.html'));
});

app.listen(PORT, HOST, () => {
  console.log(`BoscoIA servidor activo en http://${HOST}:${PORT}`);
});
