// Shared helper for the challenge tab: ask Gemini for JSON that matches a
// schema, so the tab can render a table or checklist instead of prose.
import { GoogleGenAI } from '@google/genai';

export const MODEL = 'gemini-3.8-flash';

// Free-tier keys are the first to be turned away when Gemini is busy
// (503 "high demand"). Retry once, then fall back to an older Flash model.
const MODELS = [MODEL, MODEL, 'gemini-3.5-flash'];

export async function generateWithFallback(
  ai: GoogleGenAI,
  params: Omit<Parameters<GoogleGenAI['models']['generateContent']>[0], 'model'>
) {
  for (let attempt = 0; ; attempt++) {
    try {
      return await ai.models.generateContent({ ...params, model: MODELS[attempt] });
    } catch (err: any) {
      const busy = /\b(503|429)\b|UNAVAILABLE|RESOURCE_EXHAUSTED|high demand/i.test(
        String(err?.status ?? '') + ' ' + String(err?.message ?? '')
      );
      if (!busy) throw err;
      if (attempt === MODELS.length - 1) {
        throw new Error(
          'Gemini is busy right now. Wait a minute and click Try Again. If it keeps happening, use a Gemini API key from a project with billing enabled.'
        );
      }
      await new Promise((r) => setTimeout(r, 1500 * (attempt + 1)));
    }
  }
}

export interface SiteContext {
  address: string;
  town: string;
  zoningUrl?: string;
  whereZoningSits?: string;
}

export function siteLines(site: SiteContext): string {
  return [
    `Site address: ${site.address}`,
    `Rhode Island municipality: ${site.town}`,
    `Zoning ordinance: ${site.zoningUrl || 'not on file'}`,
    `Where zoning sits in the code: ${site.whereZoningSits || 'not on file'}`,
  ].join('\n');
}

export async function askGeminiJson<T>(
  systemInstruction: string,
  prompt: string,
  schema: object
): Promise<T> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error('GEMINI_API_KEY is not configured in environment or Secrets.');
  }
  const ai = new GoogleGenAI({
    apiKey,
    httpOptions: { headers: { 'User-Agent': 'aistudio-build' } },
  });
  const response = await generateWithFallback(ai, {
    contents: prompt,
    config: {
      systemInstruction,
      temperature: 0.3,
      responseMimeType: 'application/json',
      responseJsonSchema: schema,
    },
  });
  const text = response.text?.trim();
  if (!text) throw new Error('Gemini returned an empty answer. Try again.');
  return JSON.parse(text) as T;
}
