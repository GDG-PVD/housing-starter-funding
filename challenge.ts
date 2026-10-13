// Challenge 3: How does this project get funded?
//
// POST /api/funding drafts a list of programs that could fund affordable
// housing at the active site: who runs each, who can apply, roughly how
// much, the next deadline and the program's source page. Anything Gemini is
// not sure of is shown as "check the source". The gap calculator in the tab
// is plain arithmetic and works without Gemini.
import type { Express } from 'express';
import { askGeminiJson, siteLines, SiteContext } from './challengeApi';

export interface FundingProgram {
  name: string;
  administrator: string;
  whoCanApply: string;
  roughAmount: string;
  nextDeadline: string;
  sourceUrl: string;
  sure: boolean;
}

const SCHEMA = {
  type: 'object',
  properties: {
    programs: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          name: { type: 'string' },
          administrator: { type: 'string', description: 'Agency that runs it' },
          whoCanApply: { type: 'string' },
          roughAmount: { type: 'string' },
          nextDeadline: {
            type: 'string',
            description: 'Only a published date; otherwise "check the source"',
          },
          sourceUrl: {
            type: 'string',
            description: "The program's official page, or empty if unknown",
          },
          sure: { type: 'boolean', description: 'false unless every field is well established' },
        },
        required: [
          'name',
          'administrator',
          'whoCanApply',
          'roughAmount',
          'nextDeadline',
          'sourceUrl',
          'sure',
        ],
      },
    },
  },
  required: ['programs'],
};

const SYSTEM = `You help Rhode Island housing practitioners find funding for affordable housing.
List programs that could fund a small affordable housing project at this site: RIHousing programs, federal and state housing tax credits, HOME and CDBG funds through the municipality, and any others that fit.
Give each program's official source page when you know it, and leave sourceUrl empty rather than guess.
Never invent a deadline: write "check the source" unless a date is published. Set sure to false when in doubt.`;

export function registerChallenge(app: Express) {
  app.post('/api/funding', async (req, res) => {
    try {
      const site = req.body as SiteContext;
      if (!site?.address || !site?.town) {
        return res.status(400).json({ error: 'Explore a site first.' });
      }
      const result = await askGeminiJson<{ programs: FundingProgram[] }>(
        SYSTEM,
        `${siteLines(site)}\n\nList funding programs for affordable housing at this site.`,
        SCHEMA
      );
      res.json(result);
    } catch (err: any) {
      console.error('Funding error:', err);
      res.status(500).json({ error: err.message || 'Could not draft the funding list.' });
    }
  });
}
