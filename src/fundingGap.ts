// Funding gap arithmetic for the Challenge 3 tab: total project cost minus
// every funding source the team has ticked.

export interface Source {
  name: string;
  amount: string; // as typed, e.g. "$1,200,000"
  included: boolean;
}

// "$1,200,000" -> 1200000; "1.2m" -> 1200000; "250k" -> 250000; junk -> 0
export function parseDollars(text: string): number {
  const m = text.trim().toLowerCase().replace(/[$,\s]/g, '').match(/^(\d*\.?\d+)([km])?$/);
  if (!m) return 0;
  const n = parseFloat(m[1]);
  return Math.round(n * (m[2] === 'm' ? 1e6 : m[2] === 'k' ? 1e3 : 1));
}

export function fundingGap(totalCost: number, sources: Source[]) {
  const funded = sources
    .filter((s) => s.included)
    .reduce((sum, s) => sum + parseDollars(s.amount), 0);
  return { funded, remaining: totalCost - funded };
}
