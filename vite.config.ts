import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { defineConfig, type Plugin } from 'vite';
import { handleChatRequest, handleTtsRequest } from './src/server/geminiService.ts';
import {
  handleDeveloperApiChat,
  handleWebhookTest,
  setCorsHeaders,
} from './src/server/developerApiService.ts';
import { createAiImage } from './src/server/imageCreationService.ts';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function apiServerPlugin(): Plugin {
  return {
    name: 'api-server-plugin',
    configureServer(server) {
      server.middlewares.use(express.json({ limit: '25mb' }));

      server.middlewares.use(async (req, res, next) => {
        const url = req.url?.split('?')[0];

        if (url?.startsWith('/api/')) {
          setCorsHeaders(res);
          if (req.method === 'OPTIONS') {
            res.writeHead(204);
            res.end();
            return;
          }
        }

        if (req.method === 'POST' && url === '/api/tts') {
          try {
            await handleTtsRequest(req, res);
          } catch (e: any) {
            if (!res.headersSent) {
              res.writeHead(500, { 'Content-Type': 'application/json' });
              res.end(JSON.stringify({ error: e?.message || 'Error en síntesis de voz.' }));
            }
          }
          return;
        }

        if (req.method === 'POST' && url === '/api/chat') {
          try {
            await handleChatRequest(req, res);
          } catch (e: any) {
            if (!res.headersSent) {
              res.writeHead(500, { 'Content-Type': 'application/json' });
              res.end(JSON.stringify({ error: e?.message || 'Error interno del servidor.' }));
            }
          }
          return;
        }

        if ((url === '/api/v1/chat' || url === '/api/v1/ask') && (req.method === 'POST' || req.method === 'OPTIONS')) {
          try {
            await handleDeveloperApiChat(req, res);
          } catch (e: any) {
            if (!res.headersSent) {
              res.writeHead(500, { 'Content-Type': 'application/json' });
              res.end(JSON.stringify({ error: e?.message || 'Error en API para desarrolladores.' }));
            }
          }
          return;
        }

        if (url === '/api/v1/webhook/test' && (req.method === 'POST' || req.method === 'OPTIONS')) {
          try {
            await handleWebhookTest(req, res);
          } catch (e: any) {
            if (!res.headersSent) {
              res.writeHead(500, { 'Content-Type': 'application/json' });
              res.end(JSON.stringify({ error: e?.message || 'Error probando webhook.' }));
            }
          }
          return;
        }

        if ((req.method === 'GET' || req.method === 'HEAD') && url === '/api/educational-image') {
          try {
            const rawQuery = (req.url || '').split('?')[1] || '';
            const searchParams = new URLSearchParams(rawQuery);
            const query = (searchParams.get('q') || searchParams.get('query') || '').trim();
            if (!query) {
              res.writeHead(400, { 'Content-Type': 'application/json' });
              res.end(JSON.stringify({ error: 'Parámetro q requerido' }));
              return;
            }
            const result = await createAiImage(query);

            if (req.headers.accept?.includes('application/json') || searchParams.get('format') === 'json') {
              res.writeHead(200, { 'Content-Type': 'application/json' });
              res.end(JSON.stringify({ success: true, ...result }));
              return;
            }

            if (result.imageUrl.startsWith('data:image/svg+xml')) {
              const rawSvg = decodeURIComponent(result.imageUrl.replace('data:image/svg+xml;utf8,', ''));
              res.writeHead(200, {
                'Content-Type': 'image/svg+xml; charset=utf-8',
                'Cache-Control': 'no-cache, no-store, must-revalidate',
              });
              res.end(rawSvg);
              return;
            }

            if (result.imageUrl.startsWith('data:image/')) {
              const matches = result.imageUrl.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
              if (matches && matches.length === 3) {
                const mimeType = matches[1];
                const buffer = Buffer.from(matches[2], 'base64');
                res.writeHead(200, {
                  'Content-Type': mimeType,
                  'Cache-Control': 'no-cache, no-store, must-revalidate',
                });
                res.end(buffer);
                return;
              }
            }

            res.writeHead(302, {
              Location: result.imageUrl,
              'Cache-Control': 'no-cache, no-store, must-revalidate',
            });
            res.end();
            return;
          } catch (e: any) {
            if (!res.headersSent) {
              res.writeHead(500, { 'Content-Type': 'application/json' });
              res.end(JSON.stringify({ error: e?.message || 'Error resolviendo imagen' }));
            }
            return;
          }
        }

        if (req.method === 'POST' && url === '/api/generate-image') {
          try {
            const body = (req as any).body || {};
            const prompt = body.prompt;
            if (!prompt || typeof prompt !== 'string') {
              res.writeHead(400, { 'Content-Type': 'application/json' });
              res.end(JSON.stringify({ error: 'Prompt requerido' }));
              return;
            }
            const result = await createAiImage(prompt);
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(
              JSON.stringify({
                success: true,
                imageUrl: result.imageUrl,
                title: result.title,
                description: result.description,
                source: result.source,
              })
            );
            return;
          } catch (e: any) {
            if (!res.headersSent) {
              res.writeHead(500, { 'Content-Type': 'application/json' });
              res.end(JSON.stringify({ error: e?.message || 'Error generando imagen' }));
            }
            return;
          }
        }

        if (req.method === 'GET' && url === '/api/health') {
          res.writeHead(200, { 'Content-Type': 'application/json' });
          const hasKey = Boolean(process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY);
          res.end(
            JSON.stringify({
              ready: hasKey,
              model: 'gemini-3.1-flash-lite',
              developerApi: 'enabled',
            })
          );
          return;
        }

        next();
      });
    },
  };
}

export default defineConfig(() => {
  return {
    plugins: [react(), tailwindcss(), apiServerPlugin()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src'),
      },
    },
    server: {
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      hmr: process.env.DISABLE_HMR !== 'true',
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
  };
});
