// Shared helper for the challenge tab: ask Gemini for JSON that matches a
// schema, so the tab can render a table or checklist instead of prose.
import { GoogleGenAI } from '@google/genai';

export const MODEL = 'gemini-3.8-flash';

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
  const response = await ai.models.generateContent({
    model: MODEL,
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
