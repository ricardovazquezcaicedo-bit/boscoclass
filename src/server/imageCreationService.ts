import { GoogleGenAI } from '@google/genai';

export interface GeneratedImageResult {
  imageUrl: string;
  title: string;
  description: string;
  source: string;
  isAiCreated: boolean;
}


function enhancePromptForAi(query: string): string {
  const clean = query
    .replace(/[^\w\s\u00C0-\u017F]/gi, ' ')
    .replace(/\s+/g, ' ')
    .trim();

  // Add high-fidelity rendering parameters for educational 3D photorealistic quality
  return `detailed educational 3d illustration of ${clean}, realistic scientific visualization, cinematic lighting, 8k resolution, masterpiece`;
}

/**
 * Creates a high-resolution AI image via Gemini image models with fallback
 * to ultra-high-definition Flux diffusion. No low-quality SVGs or wireframes.
 */
export async function createAiImage(prompt: string): Promise<GeneratedImageResult> {
  const cleanPrompt = prompt.trim();
  const apiKey = (process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY || '').trim();
  const enhanced = enhancePromptForAi(cleanPrompt);

  // 1. Try Gemini image model if active
  if (apiKey) {
    try {
      const ai = new GoogleGenAI({
        apiKey,
        httpOptions: {
          headers: { 'User-Agent': 'aistudio-build' },
        },
      });

      const timeout = new Promise<never>((_, reject) =>
        setTimeout(() => reject(new Error('Gemini image timeout')), 2500)
      );

      const genCall = ai.models.generateContent({
        model: 'gemini-3.1-flash-lite-image',
        contents: {
          parts: [
            {
              text: `High quality realistic scientific 3D educational illustration of: ${cleanPrompt}. 8k, detailed, clean background.`,
            },
          ],
        },
        config: {
          imageConfig: {
            aspectRatio: '1:1',
          },
        },
      });

      const res: any = await Promise.race([genCall, timeout]);

      for (const part of res.candidates?.[0]?.content?.parts ?? []) {
        if (part.inlineData?.data) {
          const mime = part.inlineData.mimeType || 'image/png';
          return {
            imageUrl: `data:${mime};base64,${part.inlineData.data}`,
            title: cleanPrompt,
            description: 'Ilustración fotorrealista en alta resolución creada por modelo generativo de IA.',
            source: 'BoscoIA Generador Visual (Gemini)',
            isAiCreated: true,
          };
        }
      }
    } catch {
      // Fall through to high-resolution diffusion generator
    }
  }

  // 2. High-resolution diffusion generation
  const directDiffusionUrl = `https://image.pollinations.ai/prompt/${encodeURIComponent(enhanced)}`;

  return {
    imageUrl: directDiffusionUrl,
    title: cleanPrompt,
    description: 'Ilustración didáctica en alta resolución y render 3D creada por inteligencia artificial.',
    source: 'BoscoIA Generador Visual (Flux AI)',
    isAiCreated: true,
  };
}
