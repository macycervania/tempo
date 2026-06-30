// Build live memecoin positions from one or more tracked wallets: read each
// wallet's SPL holdings, price them via Dexscreener, and compute today's P&L
// from the 24h price change. Needs network (served app, not the offline HTML).

import { fetchTokenHoldings } from './solana';
import { fetchDexTokens } from './dexscreener';
import type { TokenPosition } from './types';

export async function loadPositions(
  addresses: string[],
  signal?: AbortSignal,
): Promise<TokenPosition[]> {
  // Sum duplicate mints held across multiple wallets.
  const byMint: Record<string, number> = {};
  for (const addr of addresses) {
    try {
      const holdings = await fetchTokenHoldings(addr);
      for (const h of holdings) byMint[h.mint] = (byMint[h.mint] || 0) + h.amount;
    } catch {
      /* skip unreachable wallet */
    }
  }
  const mints = Object.keys(byMint);
  if (!mints.length) return [];

  const dex = await fetchDexTokens(mints, signal);
  const positions: TokenPosition[] = [];
  for (const mint of mints) {
    const t = dex[mint];
    if (!t || !t.priceUsd) continue; // no market / not traded — skip
    const amount = byMint[mint];
    const valueUsd = amount * t.priceUsd;
    if (valueUsd < 0.5) continue; // ignore dust
    const denom = 1 + t.change24h / 100;
    const dayPnlUsd = denom > 0.01 ? valueUsd - valueUsd / denom : valueUsd;
    positions.push({
      mint,
      symbol: t.symbol,
      name: t.name,
      amount,
      priceUsd: t.priceUsd,
      valueUsd,
      change24h: t.change24h,
      dayPnlUsd,
      icon: t.icon,
    });
  }
  positions.sort((a, b) => b.valueUsd - a.valueUsd);
  return positions;
}
