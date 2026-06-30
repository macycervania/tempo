// Live memecoin prices from Dexscreener (free, no key, CORS-enabled). Used with
// a wallet's SPL token holdings to build an Axiom/Dexscreener-style positions
// view with today's P&L. Runs client-side; needs network (served app, not the
// offline HTML).

export interface DexToken {
  priceUsd: number;
  change24h: number; // percent, last 24h
  symbol: string;
  name: string;
  icon: string;
}

function chunk<T>(arr: T[], n: number): T[][] {
  const out: T[][] = [];
  for (let i = 0; i < arr.length; i += n) out.push(arr.slice(i, i + n));
  return out;
}

function num(v: unknown): number {
  const n = typeof v === 'number' ? v : parseFloat(String(v));
  return Number.isFinite(n) ? n : 0;
}

/**
 * Look up the best (most-liquid) pair for each token mint and return its price,
 * 24h change, symbol/name/icon. Tokens with no pair are simply omitted.
 */
export async function fetchDexTokens(
  mints: string[],
  signal?: AbortSignal,
): Promise<Record<string, DexToken>> {
  const out: Record<string, DexToken & { _liq: number }> = {};
  for (const group of chunk(mints, 30)) {
    try {
      const res = await fetch(
        'https://api.dexscreener.com/latest/dex/tokens/' + group.join(','),
        { signal },
      );
      if (!res.ok) continue;
      const data = await res.json();
      const pairs: Record<string, unknown>[] = data?.pairs || [];
      for (const pair of pairs) {
        const base = (pair.baseToken || {}) as Record<string, unknown>;
        const mint = String(base.address || '');
        if (!mint) continue;
        const liq = num((pair.liquidity as Record<string, unknown>)?.usd);
        if (out[mint] && out[mint]._liq >= liq) continue;
        const info = (pair.info || {}) as Record<string, unknown>;
        out[mint] = {
          priceUsd: num(pair.priceUsd),
          change24h: num((pair.priceChange as Record<string, unknown>)?.h24),
          symbol: String(base.symbol || '?'),
          name: String(base.name || base.symbol || ''),
          icon: String(info.imageUrl || ''),
          _liq: liq,
        };
      }
    } catch {
      /* skip this chunk */
    }
  }
  const clean: Record<string, DexToken> = {};
  for (const [k, v] of Object.entries(out)) {
    const { _liq, ...rest } = v;
    void _liq;
    clean[k] = rest;
  }
  return clean;
}
