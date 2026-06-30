// Read-only Solana wallet tracking. We only ever take a PUBLIC base58 address
// and look up its balance over the public mainnet RPC — never a private key,
// never a transaction. Price is pulled from CoinGecko in the user's currency.
//
// Both calls run client-side (in the user's browser), so they work from the
// served app and from the standalone HTML using the device's own network.

const RPC_URL = 'https://api.mainnet-beta.solana.com';
const PRICE_URL = 'https://api.coingecko.com/api/v3/simple/price';
const LAMPORTS_PER_SOL = 1_000_000_000;

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

  const balRes = await fetch(RPC_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      jsonrpc: '2.0',
      id: 1,
      method: 'getBalance',
      params: [addr],
    }),
  });
  if (!balRes.ok) throw new Error('RPC ' + balRes.status);
  const balJson = await balRes.json();
  const lamports = balJson?.result?.value;
  if (typeof lamports !== 'number') throw new Error('No balance');
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
