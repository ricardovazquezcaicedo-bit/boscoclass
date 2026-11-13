import { createAiImage, type GeneratedImageResult } from './imageCreationService.ts';

export type ImageSearchResult = GeneratedImageResult;

/**
 * Educational image resolver delegates directly to AI generation engine (Gemini).
 * No Wikipedia search, no Wikimedia Commons links, no static repetitive images.
 */
export async function resolveEducationalImage(query: string): Promise<GeneratedImageResult> {
  return createAiImage(query);
}
