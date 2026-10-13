// Challenge 3 tab: How does this project get funded?
import React, { useState } from 'react';
import { Calculator, ExternalLink, Landmark, Loader2, Plus, ShieldAlert, Sparkles } from 'lucide-react';
import { TownInfo } from '../types';
import { fundingGap, parseDollars, Source } from '../fundingGap';

interface Program {
  name: string;
  administrator: string;
  whoCanApply: string;
  roughAmount: string;
  nextDeadline: string;
  sourceUrl: string;
  sure: boolean;
}

interface Props {
  address: string;
  town: TownInfo | null;
}

const usd = (n: number) =>
  n.toLocaleString('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 });

export const ChallengePanel: React.FC<Props> = ({ address, town }) => {
  const [programs, setPrograms] = useState<Program[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [totalCost, setTotalCost] = useState('');
  const [sources, setSources] = useState<Source[]>([]);

  const draft = async () => {
    if (!town) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/funding', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ address, town: town.town, zoningUrl: town.zoningUrl }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Could not draft the funding list.');
      const list: Program[] = data.programs || [];
      setPrograms(list);
      // Keep amounts already typed in; add a row for each new program
      setSources((prev) => {
        const known = new Set(prev.map((s) => s.name));
        return [
          ...prev,
          ...list
            .filter((p) => !known.has(p.name))
            .map((p) => ({ name: p.name, amount: '', included: false })),
        ];
      });
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const update = (i: number, patch: Partial<Source>) =>
    setSources(sources.map((s, j) => (j === i ? { ...s, ...patch } : s)));

  const gap = fundingGap(parseDollars(totalCost), sources);

  return (
    <section className="w-full bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 shadow-sm space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-5">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-sky-50 text-sky-700 rounded-2xl">
            <Landmark className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-bold text-sky-700 uppercase tracking-wider">Challenge 3</p>
            <h3 className="text-2xl font-bold text-slate-900">How does this project get funded?</h3>
          </div>
        </div>
        <button
          onClick={draft}
          disabled={!town || loading}
          className="inline-flex items-center gap-2 px-5 py-3 bg-sky-700 hover:bg-sky-800 disabled:opacity-50 text-white font-bold rounded-xl shadow-sm"
        >
          {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Sparkles className="w-5 h-5" />}
          {programs ? 'Redraft the list' : 'Find funding programs'}
        </button>
      </div>

      {!town && (
        <p className="text-base text-slate-600">Pick the town in the zoning card above first.</p>
      )}
      {error && <p className="text-base text-rose-700 font-semibold">{error}</p>}

      {programs && (
        <div className="grid gap-3 sm:grid-cols-2">
          {programs.map((p) => (
            <div key={p.name} className="p-4 border border-slate-200 rounded-xl space-y-1">
              <p className="text-lg font-bold text-slate-900">
                {p.name}
                {!p.sure && (
                  <span className="ml-2 align-middle text-xs font-bold uppercase tracking-wide bg-amber-100 text-amber-900 px-2 py-0.5 rounded">
                    Check the source
                  </span>
                )}
              </p>
              <p className="text-slate-600">{p.administrator}</p>
              <p className="text-slate-700"><b>Who can apply:</b> {p.whoCanApply}</p>
              <p className="text-slate-700"><b>Roughly:</b> {p.roughAmount}</p>
              <p className="text-slate-700"><b>Next deadline:</b> {p.nextDeadline}</p>
              {p.sourceUrl ? (
                <a
                  href={p.sourceUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-blue-700 font-semibold hover:underline"
                >
                  Source page <ExternalLink className="w-3.5 h-3.5" />
                </a>
              ) : (
                <p className="text-slate-500 italic">No source page found: search for it before relying on it.</p>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Gap calculator: works with or without the program list */}
      <div className="p-5 bg-slate-50 border border-slate-200 rounded-2xl space-y-4">
        <h4 className="text-xl font-bold text-slate-900 flex items-center gap-2">
          <Calculator className="w-5 h-5" /> Funding gap
        </h4>
        <label className="block">
          <span className="font-semibold text-slate-800">Total project cost</span>
          <input
            value={totalCost}
            onChange={(e) => setTotalCost(e.target.value)}
            placeholder="$2,500,000"
            inputMode="decimal"
            className="mt-1 block w-60 px-3 py-2 border border-slate-300 rounded-lg"
          />
        </label>
        <table className="w-full text-left text-base">
          <tbody>
            {sources.map((s, i) => (
              <tr key={i} className="border-t border-slate-200">
                <td className="py-2 pr-3">
                  <input
                    type="checkbox"
                    checked={s.included}
                    onChange={(e) => update(i, { included: e.target.checked })}
                    className="w-5 h-5"
                    aria-label={`Count ${s.name || 'this source'}`}
                  />
                </td>
                <td className="py-2 pr-3">
                  <input
                    value={s.name}
                    onChange={(e) => update(i, { name: e.target.value })}
                    placeholder="Funding source"
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                  />
                </td>
                <td className="py-2">
                  <input
                    value={s.amount}
                    onChange={(e) => update(i, { amount: e.target.value, included: true })}
                    placeholder="$0"
                    inputMode="decimal"
                    className="w-40 px-3 py-2 border border-slate-300 rounded-lg"
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <button
          onClick={() => setSources([...sources, { name: '', amount: '', included: true }])}
          className="inline-flex items-center gap-1 text-blue-700 font-semibold hover:underline"
        >
          <Plus className="w-4 h-4" /> Add a source
        </button>
        <div className="text-lg">
          <p>Sources counted: <b>{usd(gap.funded)}</b></p>
          <p className={gap.remaining > 0 ? 'text-rose-800' : 'text-emerald-800'}>
            {gap.remaining > 0 ? 'Remaining gap: ' : 'Fully funded, surplus: '}
            <b>{usd(Math.abs(gap.remaining))}</b>
          </p>
        </div>
      </div>

      {programs && (
        <div className="p-4 bg-amber-50 border border-amber-300 rounded-xl flex items-start gap-3">
          <ShieldAlert className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" />
          <p className="text-base font-bold text-amber-950">
            Program list drafted by Gemini. Check every program, amount and deadline on its source page.
          </p>
        </div>
      )}
    </section>
  );
};
