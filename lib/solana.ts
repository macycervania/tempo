// Read-only Solana wallet tracking. We only ever take a PUBLIC base58 address
// and look up its balance over the public mainnet RPC — never a private key,
// never a transaction. Price is pulled from CoinGecko in the user's currency.
//
// Both calls run client-side (in the user's browser), so they work from the
// served app and from the standalone HTML using the device's own network.

// Several public, CORS-friendly mainnet RPCs — tried in order until one
// answers. The official api.mainnet-beta endpoint rate-limits browser
// requests hard, so it's the last resort, not the first.
const RPC_URLS = [
  'https://solana-rpc.publicnode.com',
  'https://solana.api.onfinality.io/public',
  'https://api.mainnet-beta.solana.com',
];
const PRICE_URL = 'https://api.coingecko.com/api/v3/simple/price';
const LAMPORTS_PER_SOL = 1_000_000_000;

/** Query getBalance across the fallback RPCs; returns lamports or throws. */
async function rpcBalance(addr: string): Promise<number> {
  let lastErr: unknown = null;
  for (const url of RPC_URLS) {
    try {
      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          jsonrpc: '2.0',
          id: 1,
          method: 'getBalance',
          params: [addr],
        }),
      });
      if (!res.ok) {
        lastErr = new Error('RPC ' + res.status);
        continue;
      }
      const json = await res.json();
      const lamports = json?.result?.value;
      if (typeof lamports === 'number') return lamports;
      lastErr = new Error(json?.error?.message || 'No balance in response');
    } catch (e) {
      lastErr = e;
    }
  }
  throw lastErr instanceof Error ? lastErr : new Error('All RPC endpoints failed');
}

/** CoinGecko understands every currency we ship in the picker (lowercased). */
const SUPPORTED_VS = new Set(['php', 'usd', 'eur', 'gbp', 'jpy', 'inr']);

/** A public Solana address is base58, 32–44 chars (no 0, O, I, l). */
export function isSolAddress(addr: string): boolean {
  return /^[1-9A-HJ-NP-Za-km-z]{32,44}$/.test(addr.trim());
}

export interface WalletBalance {
  sol: number;
  valLocal: number;
}

/** Fetch a wallet's SOL balance and its value in `currencyCode`. */
export async function fetchSolWallet(
  address: string,
  currencyCode: string,
): Promise<WalletBalance> {
  const addr = address.trim();
  if (!isSolAddress(addr)) throw new Error('Invalid Solana address');

  const lamports = await rpcBalance(addr);
  const sol = lamports / LAMPORTS_PER_SOL;

  const vs = SUPPORTED_VS.has(currencyCode.toLowerCase())
    ? currencyCode.toLowerCase()
    : 'usd';
  let price = 0;
  try {
    const pRes = await fetch(`${PRICE_URL}?ids=solana&vs_currencies=${vs}`);
    if (pRes.ok) {
      const pJson = await pRes.json();
      price = Number(pJson?.solana?.[vs]) || 0;
    }
  } catch {
    /* price is best-effort; balance still shows */
  }

  return { sol, valLocal: Math.round(sol * price) };
}

// SPL token program — owner's token accounts live under it.
const TOKEN_PROGRAM = 'TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA';

export interface Holding {
  mint: string;
  amount: number;
}

/** List the SPL tokens (mint + UI amount) a wallet holds, across fallback RPCs. */
export async function fetchTokenHoldings(address: string): Promise<Holding[]> {
  const addr = address.trim();
  if (!isSolAddress(addr)) throw new Error('Invalid Solana address');
  let lastErr: unknown = null;
  for (const url of RPC_URLS) {
    try {
      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          jsonrpc: '2.0',
          id: 1,
          method: 'getTokenAccountsByOwner',
          params: [
            addr,
            { programId: TOKEN_PROGRAM },
            { encoding: 'jsonParsed' },
          ],
        }),
      });
      if (!res.ok) {
        lastErr = new Error('RPC ' + res.status);
        continue;
      }
      const json = await res.json();
      const accts: Record<string, unknown>[] = json?.result?.value || [];
      const holdings: Holding[] = [];
      for (const a of accts) {
        const data = (a.account as Record<string, unknown>)?.data as Record<
          string,
          unknown
        >;
        const parsed = (data?.parsed as Record<string, unknown>)?.info as Record<
          string,
          unknown
        >;
        const amt = (parsed?.tokenAmount as Record<string, unknown>)?.uiAmount;
        const mint = parsed?.mint;
        if (typeof mint === 'string' && typeof amt === 'number' && amt > 0) {
          holdings.push({ mint, amount: amt });
        }
      }
      return holdings;
    } catch (e) {
      lastErr = e;
    }
  }
  throw lastErr instanceof Error ? lastErr : new Error('Holdings lookup failed');
}
